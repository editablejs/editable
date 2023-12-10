import { HTMLAttributes, Ref, flushSync, getVaildVirtualFromTemplateResult, getVirtualResultProps, isTemplateStringsResult, isVaildVirtual, useEffect, useLayoutEffect } from "rezon"

import { composeRefs } from "./compose-refs"

export const composeEventHandlers = <E>(
  originalEventHandler?: (event: E) => void,
  ourEventHandler?: (event: E) => void,
  { checkForDefaultPrevented = true } = {},
) => {
  return function handleEvent(event: E) {
    originalEventHandler?.(event)

    if (checkForDefaultPrevented === false || !(event as unknown as Event).defaultPrevented) {
      return ourEventHandler?.(event)
    }
  }
}

export const dispatchDiscreteCustomEvent = <E extends CustomEvent>(
  target: E['target'],
  event: E,
) => {
  if (target) flushSync(() => target.dispatchEvent(event))
}



export const clamp = (value: number, [min, max]: [number, number]): number => {
  return Math.min(max, Math.max(min, value))
}

export interface MergeChildrenPropsOptions {
  props?: AnyProps
  ref?: Ref<Element>
  merge?: (childProps: AnyProps, mergeProps: AnyProps) => AnyProps
}

export const mergeChildrenProps = (children: unknown, options: MergeChildrenPropsOptions) => {
  const { props, ref, merge = mergeProps } = options
  if (isVaildVirtual<HTMLAttributes>(children)) {
    const childProps = getVirtualResultProps(children)
    children.values = [{ ...(props ? merge(props, childProps) : childProps), ref: composeRefs(ref, childProps?.ref as Ref<HTMLElement>) }]
  } else if (isTemplateStringsResult(children)) {
    const virtuals = getVaildVirtualFromTemplateResult<HTMLAttributes>(children)
    for (const virtual of virtuals) {
      const childProps = getVirtualResultProps(virtual)
      virtual.values = [{ ...(props ? merge(props, childProps) : childProps), ref: composeRefs(ref, childProps?.ref as Ref<HTMLElement>) }]
    }
  } else if (Array.isArray(children)) {
    for (const child of children) {
      mergeChildrenProps(child, options)
    }
  }
  return children
}


type AnyProps = Record<string, any>

function mergeProps(slotProps: AnyProps, childProps: AnyProps) {
  // all child props should override
  const overrideProps = { ...childProps }

  for (const propName in childProps) {
    const slotPropValue = slotProps[propName]
    const childPropValue = childProps[propName]

    const isHandler = /^on[A-Z]/.test(propName)
    // if it's a handler, modify the override by composing the base handler
    if (isHandler) {
      overrideProps[propName] = (...args: unknown[]) => {
        childPropValue?.(...args)
        slotPropValue?.(...args)
      }
    }
    // if it's `style`, we merge them
    else if (propName === 'style') {
      overrideProps[propName] = { ...slotPropValue, ...childPropValue }
    } else if (propName === 'className') {
      overrideProps[propName] = [slotPropValue, childPropValue].filter(Boolean).join(' ')
    }
  }

  return { ...slotProps, ...overrideProps }
}
