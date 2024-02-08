import { directive, DirectiveParameters, ChildPart, PartInfo } from './lit-html/directive'
import {
  getDirectiveClass,
  isDirectiveResult,
  isTemplateResult,
} from './lit-html/directive-helpers'
import { html, noChange } from './lit-html/html'
import { AsyncDirective } from './lit-html/async-directive'
import { shallow } from '@editablejs/utils/shallow'
import { createScheduler, Scheduler, SchedulerUpdateOptions } from './scheduler'
import { Component } from './core'

type PropsAreEqual<P> = ((prevProps: Readonly<P>, nextProps: Readonly<P>) => boolean) | true

interface ComponentScheduler<P = {}> extends Scheduler<ChildPart> {
  props: P
  shouldReturnCachedResult?: boolean
}

const RENDERER_TO_CHILDPART: WeakMap<
  Function,
  WeakMap<ChildPart, ComponentScheduler<any>>
> = new WeakMap()
const RENDERER_TO_SCHEDULER: WeakMap<
  Function,
  WeakMap<ComponentScheduler<any>, ChildPart>
> = new WeakMap()

const createComponentScheduler = <P = {}, C extends Component<P> = Component<P>>(
  renderer: C,
  part: ChildPart,
  setValue: AsyncDirective['setValue'],
) => {
  const scheduler = createScheduler<ChildPart, ComponentScheduler<P>>(part)

  scheduler.render = (options = {}): unknown => {
    if (!options.force && scheduler.shouldReturnCachedResult) {
      return noChange
    }
    return scheduler.state.run(() => {
      const rendererThis = part as ChildPart & { currentOptions?: Record<string, unknown> }
      rendererThis.currentOptions = options as Record<string, unknown>
      const result = renderer.apply(rendererThis, [scheduler.props])
      delete rendererThis.currentOptions
      return result
    })
  }
  scheduler.commit = (result: unknown, options): void => {
    delete options?.force
    setValue(
      isDirectiveResult(result) ? html`${result}` : result,
      options as Record<string, unknown>,
    )
  }
  const superTeardown = scheduler.teardown
  scheduler.teardown = (): void => {
    superTeardown()
    const schedulerToPart = RENDERER_TO_SCHEDULER.get(renderer)
    const partToScheduler = RENDERER_TO_CHILDPART.get(renderer)
    const part = schedulerToPart?.get(scheduler)
    if (part) partToScheduler?.delete(part)
  }

  return scheduler
}

export type DirectiveResult<P extends unknown[]> = (...args: P) => unknown

export type ComponentDirective<P = {}> = DirectiveResult<
  keyof P extends never ? [] : Parameters<Component<P>>
>

export interface ComponentCreator {
  <P = {}>(
    renderer: Component<P>,
    propsAreEqual?: PropsAreEqual<P>,
  ): ComponentDirective<P>
}

export function component<P = {}>(
  renderer: Component<P>,
  propsAreEqual?: PropsAreEqual<P>,
): ComponentDirective<P> {
  let prevRenderer: Component<P> | null = null
  let componentScheduler: ComponentScheduler<P> | null = null
  let isRendered = false
  class AsyncDirectiveComponent extends AsyncDirective {
    constructor(partInfo: PartInfo) {
      super(partInfo)
    }

    update(part: ChildPart, args: DirectiveParameters<this>, options: SchedulerUpdateOptions = {}) {
      componentScheduler = RENDERER_TO_CHILDPART.get(renderer)?.get(
        part,
      ) as ComponentScheduler<P> | null
      if (!componentScheduler || prevRenderer !== renderer) {
        prevRenderer = renderer
        componentScheduler = createComponentScheduler(renderer, part, this.setValue.bind(this))
        isRendered = false
        if (!RENDERER_TO_CHILDPART.has(renderer)) RENDERER_TO_CHILDPART.set(renderer, new WeakMap())
        const partToScheduler = RENDERER_TO_CHILDPART.get(renderer) as WeakMap<
          ChildPart,
          ComponentScheduler<any>
        >
        partToScheduler.set(part, componentScheduler)
        if (!RENDERER_TO_SCHEDULER.has(renderer)) RENDERER_TO_SCHEDULER.set(renderer, new WeakMap())
        const schedulerToPart = RENDERER_TO_SCHEDULER.get(renderer) as WeakMap<
          ComponentScheduler<any>,
          ChildPart
        >
        schedulerToPart.set(componentScheduler, part)
      }
      const prevProps = componentScheduler.props ?? ({} as P)
      const nextProps = (args[0] ?? {}) as P
      let shouldReturnCachedResult = false
      componentScheduler.props = nextProps
      if (isRendered && propsAreEqual) {
        if (typeof propsAreEqual === 'function' && propsAreEqual(prevProps, nextProps))
          shouldReturnCachedResult = true
        else if (propsAreEqual === true && shallow(prevProps, nextProps))
          shouldReturnCachedResult = true
      }
      componentScheduler.shouldReturnCachedResult = shouldReturnCachedResult
      isRendered = true
      componentScheduler.update(options)
      return this.render(args)
    }

    render(args: unknown) {
      return noChange
    }

    protected disconnected(): void {
      if (componentScheduler) {
        componentScheduler.teardown()
        componentScheduler = null
      }
    }
  }
  return directive(AsyncDirectiveComponent) as ComponentDirective<P>
}

export const c = component
export interface ComponentValue<P = {}> {
  values: keyof P extends never ? [] : Parameters<Component<P>>
  _$litDirective$: typeof AsyncDirective
}

export const isVaildComponent = <P = {}>(component: unknown): component is ComponentValue<P> => {
  if (isDirectiveResult(component)) {
    const directiveClass = getDirectiveClass(component)
    return directiveClass?.prototype instanceof AsyncDirective
  }
  return false
}

export interface TemplateStringsValue {
  strings: TemplateStringsArray
  values: unknown[]
}

export const isTemplateStringsValue = (component: unknown): component is TemplateStringsValue => {
  if (isTemplateResult(component)) {
    return 'strings' in component && 'values' in component
  }
  return false
}

export const getVaildComponentFromTemplateValue = <P = unknown>(
  component: TemplateStringsValue,
): ComponentValue<P>[] => {
  const { strings, values } = component
  const components: ComponentValue<P>[] = []
  for (let i = 0; i < values.length; i++) {
    const value = values[i]
    if (isVaildComponent(value)) {
      if (strings[i + 1] === '') {
        components.push(value as ComponentValue<P>)
      }
    }
  }
  return components
}

export const getPropsFromComponentValue = <P = {}>(component: ComponentValue<P>): P => {
  const { values } = component
  return (values.length > 0 ? values[0] : {}) as P
}
