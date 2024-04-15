export function createSvg(name: keyof SVGElementTagNameMap) {
  return document.createElementNS('http://www.w3.org/2000/svg', name);
}
