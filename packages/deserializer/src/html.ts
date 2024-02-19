import { DOMNode, Descendant, Editor, Element, Text, isDOMText } from '@editablejs/models'

export interface HTMLDeserializerOptions {
  element?: Omit<Element, 'children'>
  text?: Omit<Text, 'text'>
  matchNewline?: true | ((text: string) => boolean)
}

export type HTMLDeserializerTransform = typeof HTMLDeserializer.transform

export type HTMLDeserializerWithTransform<T = HTMLDeserializerOptions> = (
  next: HTMLDeserializerTransform,
  deserializer: typeof HTMLDeserializer,
  options: T,
) => HTMLDeserializerTransform

export interface EditorHTMLDeserializerWithTransform<T = HTMLDeserializerOptions> {
  transform: HTMLDeserializerWithTransform<T>
  options: T
}

const HTML_DESERIALIZER_TRANSFORMS: WeakMap<Editor, EditorHTMLDeserializerWithTransform[]> =
  new WeakMap()

export const HTMLDeserializer = {
  transform(node: DOMNode, options: HTMLDeserializerOptions = {}): Descendant[] {
    const { element, text, matchNewline } = options
    if (isDOMText(node)) {
      const content = node.textContent ?? ''
      if (
        matchNewline &&
        /^\s{0,}(\r\n|\n)+\s{0,}$/.test(content) &&
        (typeof matchNewline === 'boolean' || matchNewline(content))
      ) {
        return []
      }
      const dataArray = content.split(/\r\n|\n/)
      return dataArray.map(data => ({ ...text, text: data }))
    }

    const children = []
    for (const child of node.childNodes) {
      children.push(...this.transform(child, { text }))
    }

    switch (node.nodeName) {
      case 'P':
      case 'DIV':
        if (children.length === 0) children.push({ text: '' })
        return [{ ...element, type: 'paragraph', children }]
      default:
        return children
    }
  },

  with<T = HTMLDeserializerOptions>(transform: HTMLDeserializerWithTransform<T>, options: T) {
    const { transform: t } = this
    this.transform = transform(t.bind(this), this, options)
  },

  withEditor<T = HTMLDeserializerOptions>(
    editor: Editor,
    transform: HTMLDeserializerWithTransform<T>,
    options: T,
  ) {
    const fns = HTML_DESERIALIZER_TRANSFORMS.get(editor) ?? []
    if (fns.find(fn => fn.transform === transform)) return
    fns.push({
      transform: transform as HTMLDeserializerWithTransform,
      options: options as HTMLDeserializerOptions,
    })
    HTML_DESERIALIZER_TRANSFORMS.set(editor, fns)
  },

  transformWithEditor(editor: Editor, node: DOMNode, options: HTMLDeserializerOptions = {}) {
    const HTMLDeserializerEditor = Object.assign({}, HTMLDeserializer)
    const transforms = HTML_DESERIALIZER_TRANSFORMS.get(editor) ?? []

    for (const { transform, options } of transforms) {
      HTMLDeserializerEditor.with(transform, options)
    }
    
    
    // handle table cell merging
    // 对node的children进行遍历，寻找里面的children,判断children里是否有table，并对table做处理
    // 如果有table，那么就对table里的cell进行遍历，判断cell的colspan和rowspan是否为1
    // 如果不为1，那么就对cell的colspan和rowspan进行处理，使其都为1
    // 如果为1，那么就不做处理
    // 如果cell的colspan和rowspan都为1，那么就不做处理
    const children = node.children;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (child.nodeName === 'TABLE') {
        let colCount = 0;
        for (let rowIndex = 0; rowIndex < child.rows.length; rowIndex++) {
          const row = child.rows[rowIndex];
          // 计算第一行的列数，用colspan累加
          if (rowIndex === 0) {
            for (let cellIndex = 0; cellIndex < row.cells.length; cellIndex++) {
              const cell = row.cells[cellIndex];
              const colspan = cell.getAttribute('colspan') ?? 1
              colCount += colspan - 0;
            }
          }
          
          
          for (let cellIndex = 0; cellIndex < row.cells.length; cellIndex++) {
            const cell = row.cells[cellIndex];
            if (rowIndex === 0 && cell.nodeName === 'TH') {
              cell.style.fontWeight = '700';
            }
            const colspan = cell.getAttribute('colspan') ?? 1
            const rowspan = cell.getAttribute('rowspan') ?? 1
            if (colspan > 1) {
              for (let i = 1; i < colspan; i++) {
                const newCell = document.createElement('TD')
                // 设置当前newCell的colspan和rowspan都为1
                newCell.setAttribute('colspan', '1')
                newCell.setAttribute('rowspan', '1')
                // 设置当前newCell的文本为displaynone
                newCell.textContent = 'displaynone||||||' + rowIndex + '||||||' + cellIndex
                row.insertBefore(newCell, cell.nextSibling)
              }
            }
            if (rowspan > 1) {
              for (let i = 1; i < rowspan; i++) {
                // 获取当前行的下i行
                const nextRow = child.rows[rowIndex + i]
                // 获取当前行的下i行的第cellIndex个cell
                for (let i = 0; i < colspan; i++) {
                  const newCell = nextRow.insertCell(cellIndex);
                  // 设置当前newCell的colspan和rowspan都为1
                  newCell.setAttribute('colspan', '1')
                  newCell.setAttribute('rowspan', '1')
                  // 设置当前newCell的文本为displaynone
                  newCell.textContent = 'displaynone||||||' + rowIndex + '||||||' + cellIndex
                }
              }
            }
          }
          let cellsLength = row.cells.length;
          if (cellsLength < colCount) {
            for (let i = 0; i < colCount - cellsLength; i++) {
              const newCell = row.insertCell();
              // 设置当前newCell的colspan和rowspan都为1
              newCell.setAttribute('colspan', '1')
              newCell.setAttribute('rowspan', '1')
              // 设置当前newCell的文本为空
              newCell.textContent = '';
            }
          }
        }
      }
      // 解析child的innerHTML，并循环遍历内部的所有strike，并增加style：text-decoration:line-through;
      if (child.innerHTML.indexOf('<strike') !== -1) {
        const strikes = child.getElementsByTagName('strike');
        for (let strike of strikes) {
          // 将当前的strike元素替换为span元素
          const span = document.createElement('span');
          span.innerHTML = strike.innerHTML;
          // 将 strike 元素的所有样式复制到 span 元素
          for (let property of strike.style) {
            span.style.setProperty(property, strike.style.getPropertyValue(property));
          }
          span.style.textDecoration = 'line-through';
          // 将当前元素作为兄弟元素插入到strike后面
          strike.insertAdjacentElement('afterend', span);
        }
        while (strikes.length > 0) {
          strikes[0].remove();
        }
      }
    }

    return HTMLDeserializerEditor.transform(node, options)
  },
}
