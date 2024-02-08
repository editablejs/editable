import { createStore } from "@editablejs/store"


export const observeSize = (element: HTMLElement) => {
  const size = { width: element.offsetWidth, height: element.offsetHeight }
  const store = createStore(() => size)
  const resizeObserver = new ResizeObserver(entries => {
    if (!Array.isArray(entries)) {
      return
    }

    // Since we only observe the one element, we don't need to loop over the
    // array
    if (!entries.length) {
      return
    }

    const entry = entries[0]
    let width: number
    let height: number

    if ('borderBoxSize' in entry) {
      const borderSizeEntry = entry['borderBoxSize']
      // iron out differences between browsers
      const borderSize = Array.isArray(borderSizeEntry) ? borderSizeEntry[0] : borderSizeEntry
      width = borderSize['inlineSize']
      height = borderSize['blockSize']
    } else {
      // for browsers that don't support `borderBoxSize`
      // we calculate it ourselves to get the correct border box.
      width = element.offsetWidth
      height = element.offsetHeight
    }

    store.setState({ width, height })
  })

  resizeObserver.observe(element, { box: 'border-box' })
  return {
    subscribe: store.subscribe,
    unsubscribe: () => resizeObserver.unobserve(element),
  }
}
