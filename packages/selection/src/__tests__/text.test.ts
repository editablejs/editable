import { getOffset, getCharRange, getCharFromGraphemeBreaker, getCharOffsetBackward, getCharOffsetForward } from '../text'


document.createRange = () => {
  const range = new Range();

  range.getBoundingClientRect = jest.fn();

  range.getClientRects = () => {
    return {
      item: () => {
        return {
          top: 0,
          left: range.startOffset,
          width: range.endOffset - range.startOffset,
          height: 1,
          right: 0,
          bottom: 1,
          x: range.startOffset,
          y: 1,
          toJSON: () => null,
        }
      },
      length: 1,
      [Symbol.iterator]: function* () {
        yield {
          top: 0,
          left: range.startOffset,
          width: range.endOffset - range.startOffset,
          height: 1,
          right: 0,
          bottom: 1,
          x: range.startOffset,
          y: 1,
          toJSON: () => null,
        };
      }
    };
  };

  return range;
}

describe("text-offset", () => {
  it("getCharFromGraphemeBreaker", () => {
    expect(getCharFromGraphemeBreaker('a😥bc', 1)).toEqual('😥');
    expect(getCharFromGraphemeBreaker('a😥bc', 1, true)).toEqual('a');
  });
  it("getCharOffsetBackward", () => {
    expect(getCharOffsetBackward('a😥bc', 1)).toEqual(1);
  });
  it("getCharOffsetForward", () => {
    expect(getCharOffsetForward('a😥bc', 2)).toEqual(1);
  });
  it("getCharRange", () => {
    expect(getCharRange('a😥bc', 2)).toEqual([1, 3]);
  });
  it("getOffset", () => {
    document.body.innerHTML =
    '<div>' +
    '  <span id="test">a😥bc</span>' +
    '</div>';
    const testElement = document.getElementById('test');
    const textElement = testElement?.firstChild as Text;
    if(!textElement) return
    const text = textElement.textContent || ''
    expect(getOffset(textElement, 1, 1, 0, text.length, text.length)).toEqual(1);
  });
});