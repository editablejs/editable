import {
  useEffect as useReactEffect,
  useRef as useReactRef,
  useState as useReactState,
} from 'react'
import {
  render,
  html,
  useState,
  define,
  flushSync,
  useRef,
  useEffect,
  virtual,
  HTMLAttributes,
  createContext,
  useContext,
  custom,
} from 'rezon'
import { spread } from 'rezon/directives/spread'
import {
  Button,
  Icon,
  Avatar,
  AvatarImage,
  Slot,
  Portal,
  Popover,
  PopoverAnchor,
  PopoverPortal,
  PopoverContent,
} from '@editablejs/theme'
import ReactDOM from 'react-dom'

interface TestProps extends HTMLAttributes<HTMLDivElement> {
  value?: string
}
const TestVirtual = virtual<TestProps>(props => {
  console.log('TestVirtual', props)
  if (props.value) return html`<div>value: ${props.value}</div>`
  return html`<div ${spread(props)}></div>`
})

const PortalContext = createContext<{ count: number }>({ count: 0 })

const CountContext = createContext<{ count: number; setCount: (value: number) => void }>({} as any)

const TestPortalContent = virtual(() => {
  const { count } = useContext(PortalContext)
  return html`<div>Portal${count}</div>`
})

const TestPortal = virtual(() => {
  return html`<div>
    TestPortal${Portal({
      children: TestPortalContent(),
    })}
  </div>`
})

const TestCount = virtual(() => {
  const { count, setCount } = useContext(CountContext)
  return html`<div @click=${() => setCount(count + 1)}>TestCount: ${count}</div>`
})

const MyContainer = custom(
  el => {
    console.log(el)
    return html`<div>MyContainer</div>`
  },
  {
    useShadowDOM: false,
  },
)

let t: any = null
const TestContainer = virtual(function ({ children }: { children: unknown }) {
  const el = this as any
  if (!t) {
    t = el
  }
  console.log(
    children,
    this,
    this === t,
    el['_$parent']['_$parts'].map((part: any) => part === this),
  )
  return children
})

define(MyContainer, 'my-container')

/**
 *
${PortalContext.Provider({
  value: { count },
  children: TestPortal()
})}
 */

const _PopoverAnchor = virtual(props => {
  return html`<div ${spread(props)}>PopoverAnchor</div>`
})

const _PopoverContent = virtual(props => {
  return html`<div ${spread(props)}>PopoverContent</div>`
})
const _TestValue = virtual(() => {
  return 123
})

const MyApp = virtual(() => {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLButtonElement>(null)
  const slotRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    console.log(slotRef)
  }, [])

  return html`<div>
    ${Slot({
      ref: slotRef,
      children: TestVirtual({
        children: Avatar({
          children: AvatarImage({
            width: 32,
            height: 32,
            src: 'https://avatars.githubusercontent.com/u/10251037?s=60&v=4',
          }),
        }),
      }),
    })}
    <div>
      ${Button({
        icon: Icon({
          name: 'bold',
        }),
        children: count,
        onClick: () => setCount(count + 1),
        ref,
      })}
    </div>
    <div>
      <button
        @click=${() => {
          flushSync(() => setCount(2))
          setCount(1)
        }}
      >
        flushSync: ${count}
      </button>
    </div>
  </div>`
})
/**
 * ${Popover({
    open: true,
    children: [
      PopoverAnchor({
        children: Button({
          children: 'PopoverAnchor',
          ref,
        }),
      }),
      PopoverPortal({
        children: PopoverContent({
          children: 'PopoverContent',
        }),
      }),
    ],
})}
 */

/**
 * ${Slot({
      ref: slotRef,
      children: TestVirtual({
      children: Avatar({
        children: AvatarImage({
          width: 32,
          height: 32,
          src: 'https://avatars.githubusercontent.com/u/10251037?s=60&v=4'
        })
      })
    })})}
    <div>${Button({
      icon: Icon({
        name: 'bold'
      }),
      children: count,
      onClick: () => setCount(count + 1),
      ref
    })}</div>
    <div>
      <button @click=${() => {
        flushSync(() => setCount(2))
        setCount(1)
      }}>flushSync: ${count}</button>
    </div>
 */

export default function Test() {
  const ref = useReactRef<HTMLDivElement>(null)

  useReactEffect(() => {
    if (ref.current) {
      render(MyApp(), ref.current, {})
    }
  }, [])

  return (
    <div tw="text-center">
      <div>Vanilla JS:</div>
      <div ref={ref}></div>
      <br />
      React Component:
      <ReactTest />
    </div>
  )
}

const ReactButton = () => {
  const [count, setCount] = useReactState(0)
  const [count1, setCount1] = useReactState(0)
  useReactEffect(() => {
    console.log('ReactButton mounted')
    return () => console.log('ReactButton unmounted')
  }, [])
  console.log(count)
  return (
    <div>
      <button
        onClick={() => {
          ReactDOM.flushSync(() => {})
          setCount(2)
          setCount(1)
        }}
      >
        {count}
        {count1}
      </button>
    </div>
  )
}

const ReactTest = () => {
  const [count, setCount] = useReactState(0)

  return (
    <div>
      <div>
        <ReactButton />
      </div>
      <div>
        <button onClick={() => setCount(count + 1)}>{count}</button>
      </div>
    </div>
  )
}
