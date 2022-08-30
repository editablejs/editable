import { GridCell } from '../../../src/interfaces/cell';
import { createEditor } from '../../../src/plugin/custom';
import { Editable } from '../../../src/plugin/editable';

describe('interfaces/cell', () => {
  const editor = createEditor();
  editor.isCell = (value): value is GridCell => {
    return value.type === 'grid-cell';
  };

  it('is-cell', () => {
    expect(Editable.isCell(editor, { type: 'grid-cell', children: [] })).toBe(
      true
    );
  });
  it('is-cell-not-equal', () => {
    expect(Editable.isCell(editor, { children: [] })).toBe(false);
  });
});
