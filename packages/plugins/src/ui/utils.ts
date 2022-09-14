export const unbundleFocusRadixUi = (
  el: HTMLElement | null,
  ref?: React.MutableRefObject<HTMLElement | null>,
) => {
  if (el) el.focus = () => {}
  if (ref) ref.current = el
}
