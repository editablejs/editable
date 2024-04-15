
export const isActiveElementInShadowRoot = () => {
  const activeElement = globalThis.document.activeElement
  return activeElement?.getRootNode() instanceof ShadowRoot
}
