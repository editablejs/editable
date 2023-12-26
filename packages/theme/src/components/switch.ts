
import { useComposedRefs } from './compose-refs'
import { useControllableState } from '@/hooks/use-controllable-state'
import { usePrevious } from '@/hooks/use-previous'
import { useSize } from '@/hooks/use-size'
import { composeEventHandlers } from '@/utils'
import { createContext, useContext, useState, useRef, useEffect, HTMLAttributes, c, ButtonHTMLAttributes, html, InputHTMLAttributes } from 'rezon'
import { ref } from 'rezon/directives/ref'
import { spread } from 'rezon/directives/spread'
import { styleMap } from 'rezon/directives/style-map'

/* -------------------------------------------------------------------------------------------------
 * Switch
 * -----------------------------------------------------------------------------------------------*/

type SwitchContextValue = { checked: boolean; disabled?: boolean }
const SwitchContext = createContext<SwitchContextValue>({} as any)
const useSwitchContext = () => useContext(SwitchContext)

type PrimitiveButtonProps = ButtonHTMLAttributes<HTMLButtonElement>

interface SwitchProps extends Omit<PrimitiveButtonProps, 'onChange'> {
  checked?: boolean
  defaultChecked?: boolean
  required?: boolean
  onChange?(checked: boolean): void
}

const Switch = c<SwitchProps>((props) => {
  const {
    name,
    checked: checkedProp,
    defaultChecked,
    required,
    disabled,
    value = 'on',
    onChange,
    ref: forwardedRef,
    ...switchProps
  } = props
  const [button, setButton] = useState<HTMLButtonElement | null>(null)
  const composedRefs = useComposedRefs(forwardedRef, node => setButton(node))
  const hasConsumerStoppedPropagationRef = useRef(false)
  // We set this to true by default so that events bubble to forms without JS (SSR)
  const isFormControl = button ? Boolean(button.closest('form')) : true

  const [checked = false, setChecked] = useControllableState({
    prop: checkedProp,
    defaultProp: defaultChecked,
    onChange,
  })

  return SwitchContext.Provider({
    value: { checked, disabled },
    children: [html`<button type="button" role="switch"
    aria-checked="${checked}"
    aria-required="${required}"
    data-state="${getState(checked)}"
    data-disabled="${disabled ? '' : undefined}"
    disabled="${disabled}"
    value="${value}"
    ${spread(switchProps)}
    ref="${composedRefs}"
    @click="${composeEventHandlers(props.onClick, event => {
      setChecked(prevChecked => !prevChecked)
      if (isFormControl) {
        // if switch is in a form, stop propagation from the button so that we only propagate
        // one click event (from the input). We propagate changes from an input so that native
        // form validation works and form events reflect switch updates.
        if (!hasConsumerStoppedPropagationRef.current) {
          event.stopPropagation()
          hasConsumerStoppedPropagationRef.current = true
        }
      }
    })}
    >
    </button>`,
    isFormControl ? BubbleInput({
      control: button,
      bubbles: !hasConsumerStoppedPropagationRef.current,
      name,
      value,
      checked,
      required,
      disabled,
      // We transform because the input is absolutely positioned but we have
      // rendered it **after** the button. This pulls it back to sit on top
      // of the button.
      style: { transform: 'translateX(-100%)' }
    }) : null
    ]
  })
})

/* -------------------------------------------------------------------------------------------------
 * SwitchThumb
 * -----------------------------------------------------------------------------------------------*/


type SwitchThumbElement = HTMLSpanElement
type PrimitiveSpanProps = HTMLAttributes<SwitchThumbElement>
interface SwitchThumbProps extends PrimitiveSpanProps { }

const SwitchThumb = c<SwitchThumbProps>((props) => {
  const context = useSwitchContext()
  return html`<span data-state="${getState(context.checked)}" data-disabled=${context.disabled ? '' : undefined} ${spread(props)}></span>`;
},
)


/* ---------------------------------------------------------------------------------------------- */

type InputProps = InputHTMLAttributes<HTMLInputElement>
interface BubbleInputProps extends Omit<InputProps, 'checked'> {
  checked: boolean
  control: HTMLElement | null
  bubbles: boolean
}

const BubbleInput = c<BubbleInputProps>((props) => {
  const { control, checked, bubbles = true, ...inputProps } = props
  const _ref = useRef<HTMLInputElement>(null)
  const prevChecked = usePrevious(checked)
  const controlSize = useSize(control)

  // Bubble checked change to parents (e.g form change event)
  useEffect(() => {
    const input = _ref.current!
    const inputProto = window.HTMLInputElement.prototype
    const descriptor = Object.getOwnPropertyDescriptor(inputProto, 'checked') as PropertyDescriptor
    const setChecked = descriptor.set
    if (prevChecked !== checked && setChecked) {
      const event = new Event('click', { bubbles })
      setChecked.call(input, checked)
      input.dispatchEvent(event)
    }
  }, [prevChecked, checked, bubbles])

  return html`<input type="checkbox" aria-hidden ?checked="${checked}" ${spread(inputProps)} tabindex="-1" ref=${ref(_ref)} style=${styleMap({
    ...props.style,
    ...controlSize,
    position: 'absolute',
    pointerEvents: 'none',
    opacity: 0,
    margin: 0,
  })} />`
})

function getState(checked: boolean) {
  return checked ? 'checked' : 'unchecked'
}

export {
  //
  Switch,
  SwitchThumb,
}
export type { SwitchProps, SwitchThumbProps }
