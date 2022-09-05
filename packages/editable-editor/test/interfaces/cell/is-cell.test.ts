import { GridCell } from '../../../src/interfaces/cell';
import { createEditor } from '../../../src/plugin/custom';
import { Editable } from '../../../src/plugin/editable';

describe('interfaces/cell', () => {
  const editor = createEditor();
  editor.isGridCell = (value): value is GridCell => {
    return value.type === 'grid-cell';
  };

  it('is-cell', () => {
    expect(
      Editable.isGridCell(editor, { type: 'grid-cell', children: [] })
    ).toBe(true);
  });
  it('is-cell-not-equal', () => {
    expect(Editable.isGridCell(editor, { children: [] })).toBe(false);
  });
});
