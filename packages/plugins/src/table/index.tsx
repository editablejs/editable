import { Editable, RenderElementProps, Transforms, Node, Grid } from '@editablejs/editor';
import { withTableCell } from './cell';
import { TableOptions } from './context';
import { withTableRow } from './row';
import { TableEditor, TableComponent, TABLE_OPTIONS_WEAKMAP, Table } from './table';

export const withTable = <T extends Editable>(editor: T, options: TableOptions = {}) => {
  let newEditor = editor as T & TableEditor;

  TABLE_OPTIONS_WEAKMAP.set(newEditor, options);

  newEditor = withTableCell(newEditor);
  newEditor = withTableRow(newEditor);

  const { isGrid } = editor;

  newEditor.isGrid = (node: Node): node is Table => {
    return TableEditor.isTable(newEditor, node) || isGrid(node);
  };

  newEditor.toggleTable = options => {
    const table = TableEditor.create(newEditor, options);
    Transforms.insertNodes(newEditor, table);
    Grid.focus(newEditor, {
      point: [0, 0],
    });
  };

  const { renderElement } = newEditor;

  newEditor.renderElement = props => {
    if (TableEditor.isTable(newEditor, props.element)) {
      return <TableComponent editor={newEditor} {...(props as RenderElementProps<Table>)} />;
    }
    return renderElement(props);
  };
  return newEditor;
};

export { TableEditor };

export type { TableOptions };
