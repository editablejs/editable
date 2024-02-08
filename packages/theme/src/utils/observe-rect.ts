import { createStore } from "@editablejs/store";
import { Measurable, observeElementRect } from "./observe-element-rect";

export const observeRect = (measurable: Measurable) => {
  const store = createStore(() => measurable.getBoundingClientRect())
  const unobserve = observeElementRect(measurable, rect => {
    store.setState(rect)
  })

  return {
    subscribe: store.subscribe,
    unsubscribe: unobserve
  }
}
