import { directive, DirectiveParameters, ChildPart, PartInfo } from './lit-html/directive'
import {
  getDirectiveClass,
  isDirectiveResult,
  isTemplateResult,
} from './lit-html/directive-helpers'
import { noChange } from './lit-html/html'
import { AsyncDirective } from './lit-html/async-directive'
import { shallow } from '@editablejs/utils/shallow'
import { createScheduler, Scheduler } from './scheduler'
import { FC } from './core'

type PropsAreEqual<P> = ((prevProps: Readonly<P>, nextProps: Readonly<P>) => boolean) | true

interface VirtualScheduler<P = {}> extends Scheduler<P, ChildPart, ChildPart> {
  props: P
  shouldReturnCachedResult?: boolean
}

const RENDERER_TO_CHILDPART: WeakMap<
  Function,
  WeakMap<ChildPart, VirtualScheduler<any>>
> = new WeakMap()
const RENDERER_TO_SCHEDULER: WeakMap<
  Function,
  WeakMap<VirtualScheduler<any>, ChildPart>
> = new WeakMap()

const createVirtualScheduler = <P = {}, C extends FC<P> = FC<P>>(
  renderer: C,
  part: ChildPart,
  setValue: Function,
) => {
  const scheduler = createScheduler<P, ChildPart, ChildPart>(part) as VirtualScheduler<P>
  scheduler.state.virtual = true
  let prevResult: unknown
  scheduler.render = (): unknown => {
    if (scheduler.shouldReturnCachedResult) {
      return prevResult
    }
    prevResult = scheduler.state.run(() => renderer.apply(part, [scheduler.props]))
    return prevResult
  }
  scheduler.commit = (result: unknown): void => {
    setValue(result)
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

export type VirtualDirectiveResult<P extends unknown[]> = (...args: P) => unknown

export type VirtualDirectiveComponent<P = {}> = VirtualDirectiveResult<
  keyof P extends never ? [] : Parameters<FC<P>>
>

export interface VirtualCreator {
  <P = {}>(
    renderer: FC<P, ChildPart>,
    propsAreEqual?: PropsAreEqual<P>,
  ): VirtualDirectiveComponent<P>
}

export function virtual<P = {}>(
  renderer: FC<P, ChildPart>,
  propsAreEqual?: PropsAreEqual<P>,
): VirtualDirectiveComponent<P> {
  let prevRenderer: FC<P> | null = null
  let virtualScheduler: VirtualScheduler<P> | null = null
  let isRendered = false
  class VirtualDirective extends AsyncDirective {
    constructor(partInfo: PartInfo) {
      super(partInfo)
    }

    update(part: ChildPart, args: DirectiveParameters<this>) {
      virtualScheduler = RENDERER_TO_CHILDPART.get(renderer)?.get(
        part,
      ) as VirtualScheduler<P> | null
      if (!virtualScheduler || prevRenderer !== renderer) {
        prevRenderer = renderer
        virtualScheduler = createVirtualScheduler(renderer, part, this.setValue.bind(this))
        isRendered = false
        if (!RENDERER_TO_CHILDPART.has(renderer)) RENDERER_TO_CHILDPART.set(renderer, new WeakMap())
        const partToScheduler = RENDERER_TO_CHILDPART.get(renderer) as WeakMap<
          ChildPart,
          VirtualScheduler<any>
        >
        partToScheduler.set(part, virtualScheduler)
        if (!RENDERER_TO_SCHEDULER.has(renderer)) RENDERER_TO_SCHEDULER.set(renderer, new WeakMap())
        const schedulerToPart = RENDERER_TO_SCHEDULER.get(renderer) as WeakMap<
          VirtualScheduler<any>,
          ChildPart
        >
        schedulerToPart.set(virtualScheduler, part)
      }
      const prevProps = virtualScheduler.props ?? ({} as P)
      const nextProps = (args[0] ?? {}) as P
      let shouldReturnCachedResult = false
      virtualScheduler.props = nextProps
      if (isRendered && propsAreEqual) {
        if (typeof propsAreEqual === 'function' && propsAreEqual(prevProps, nextProps))
          shouldReturnCachedResult = true
        else if (propsAreEqual === true && shallow(prevProps, nextProps))
          shouldReturnCachedResult = true
      }
      virtualScheduler.shouldReturnCachedResult = shouldReturnCachedResult
      isRendered = true
      virtualScheduler.update()
      return this.render(args)
    }

    render(args: unknown) {
      return noChange
    }

    protected disconnected(): void {
      if (virtualScheduler) {
        virtualScheduler.teardown()
        virtualScheduler = null
      }
    }
  }
  const v = directive(VirtualDirective) as VirtualDirectiveComponent<P>
  return v
}

export interface VirtualResult<P = {}> {
  values: keyof P extends never ? [] : Parameters<FC<P>>
  _$litDirective$: typeof AsyncDirective
}

export const isVaildVirtual = <P = {}>(component: unknown): component is VirtualResult<P> => {
  if (isDirectiveResult(component)) {
    const directiveClass = getDirectiveClass(component)
    return directiveClass?.prototype instanceof AsyncDirective
  }
  return false
}

export interface TemplateStringsResult {
  strings: TemplateStringsArray
  values: unknown[]
}

export const isTemplateStringsResult = (component: unknown): component is TemplateStringsResult => {
  if (isTemplateResult(component)) {
    return 'strings' in component && 'values' in component
  }
  return false
}

export const getVaildVirtualFromTemplateResult = <P = unknown>(
  component: TemplateStringsResult,
): VirtualResult<P>[] => {
  const { strings, values } = component
  const virtuals: VirtualResult<P>[] = []
  for (let i = 0; i < values.length; i++) {
    const value = values[i]
    if (isVaildVirtual(value)) {
      if (strings[i + 1] === '') {
        virtuals.push(value as VirtualResult<P>)
      }
    }
  }
  return virtuals
}

export const getVirtualResultProps = <P = {}>(component: VirtualResult<P>): P => {
  const { values } = component
  return (values.length > 0 ? values[0] : {}) as P
}
