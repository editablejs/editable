export const initialValue = [
  {
    children: [
      {
        text: 'Welcome to ',
      },
      {
        text: 'Editable',
        bold: true,
      },
      {
        text: '! Editable is an extensible rich text editing framework that focuses on stability, controllability, and performance.',
      },
    ],
  },
  {
    children: [
      {
        text: '',
      },
    ],
  },
  {
    children: [
      {
        text: 'Currently, it is still in beta version and the API may undergo significant changes, so related documents are not yet complete.',
      },
    ],
  },
  {
    type: 'hr',
    children: [
      {
        text: '',
      },
    ],
  },
  {
    children: [
      {
        text: "Here's what you can do with the note editor:",
      },
    ],
  },
  {
    type: 'heading-one',
    children: [
      {
        text: 'H1 Heading',
        fontSize: '28px',
        bold: true,
      },
    ],
  },
  {
    type: 'heading-two',
    children: [
      {
        text: 'H2 Heading',
        fontSize: '24px',
        bold: true,
      },
    ],
  },
  {
    type: 'heading-three',
    children: [
      {
        text: 'H3 Heading',
        fontSize: '20px',
        bold: true,
      },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: '',
      },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: 'You can write in ',
      },
      {
        bold: true,
        text: 'bold',
      },
      {
        text: ', write in ',
      },
      {
        italic: true,
        text: 'italics',
      },
      {
        text: ', write in ',
      },
      {
        underline: true,
        text: 'underline',
      },
      {
        text: ', and ',
      },
      {
        text: 'strikethrough',
        strikethrough: true,
      },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: '',
      },
    ],
  },
  {
    key: 'lrlclhsxrds',
    type: 'unordered-list',
    start: 1,
    children: [
      {
        type: 'paragraph',
        children: [
          {
            text: 'Structure your points in bullets',
          },
        ],
      },
    ],
    level: 0,
  },
  {
    key: 'lrlclhsxrds',
    type: 'unordered-list',
    start: 2,
    children: [
      {
        type: 'paragraph',
        children: [
          {
            text: 'And more bullets',
          },
        ],
      },
    ],
    level: 0,
  },
  {
    key: 'lrlclhsxrds',
    type: 'unordered-list',
    start: 1,
    children: [
      {
        type: 'paragraph',
        children: [
          {
            text: 'And some sub-bullets',
          },
        ],
      },
    ],
    level: 1,
    lineIndent: 32,
  },
  {
    type: 'paragraph',
    children: [
      {
        text: '',
      },
    ],
  },
  {
    key: 'r8118yz79wg',
    type: 'task-list',
    checked: false,
    start: 1,
    children: [
      {
        type: 'paragraph',
        children: [
          {
            text: 'Sometimes a checkbox is better',
          },
        ],
      },
    ],
    level: 0,
  },
  {
    key: 'r8118yz79wg',
    type: 'task-list',
    checked: false,
    start: 2,
    children: [
      {
        type: 'paragraph',
        children: [
          {
            text: 'So that things can be checked off when complete',
          },
        ],
      },
    ],
    level: 0,
  },
  {
    type: 'paragraph',
    children: [
      {
        text: '',
      },
    ],
  },
  {
    type: 'blockquote',
    children: [
      {
        children: [
          {
            text: 'And block quotes are handy for making references',
          },
        ],
      },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: '',
      },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: 'Use ',
      },
      {
        code: true,
        text: 'code',
      },
      {
        text: ' for writing technical documents',
      },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: 'Create links to ',
      },
      {
        href: 'http://docs.editablejs.com',
        target: '_blank',
        children: [
          {
            text: 'external webpages',
          },
        ],
        type: 'link',
      },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: 'Insert ',
      },
      {
        bold: true,
        text: 'images',
      },
      {
        text: ' by copy-pasting from clipboard or drag-dropping them:',
      },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: '',
      },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: '',
      },
      {
        url: 'https://itellyou-image.oss-cn-hangzhou.aliyuncs.com/10012/avatar/img29.jpg',
        state: 'done',
        width: 850,
        height: 356,
        type: 'image',
        children: [
          {
            text: '',
          },
        ],
        percentage: 100,
      },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: '',
      },
    ],
  },
  {
    type: 'table',
    children: [
      {
        type: 'table-row',
        children: [
          {
            colspan: 1,
            rowspan: 1,
            type: 'table-cell',
            children: [
              {
                children: [
                  {
                    text: 'this is a table',
                  },
                ],
              },
            ],
          },
          {
            colspan: 1,
            rowspan: 1,
            type: 'table-cell',
            children: [
              {
                children: [
                  {
                    text: '',
                  },
                ],
              },
            ],
          },
          {
            colspan: 1,
            rowspan: 1,
            type: 'table-cell',
            children: [
              {
                children: [
                  {
                    text: '',
                  },
                ],
              },
            ],
          },
        ],
        height: 35,
        contentHeight: 36.458335876464844,
      },
      {
        type: 'table-row',
        children: [
          {
            colspan: 1,
            rowspan: 1,
            type: 'table-cell',
            children: [
              {
                children: [
                  {
                    text: '',
                  },
                ],
              },
            ],
          },
          {
            colspan: 1,
            rowspan: 1,
            type: 'table-cell',
            children: [
              {
                children: [
                  {
                    text: '',
                  },
                ],
              },
            ],
          },
          {
            colspan: 1,
            rowspan: 1,
            type: 'table-cell',
            children: [
              {
                children: [
                  {
                    text: '',
                  },
                ],
              },
            ],
          },
        ],
        height: 35,
        contentHeight: 36.458335876464844,
      },
      {
        type: 'table-row',
        children: [
          {
            colspan: 1,
            rowspan: 1,
            type: 'table-cell',
            children: [
              {
                children: [
                  {
                    text: '',
                  },
                ],
              },
            ],
          },
          {
            colspan: 1,
            rowspan: 1,
            type: 'table-cell',
            children: [
              {
                children: [
                  {
                    text: '',
                  },
                ],
              },
            ],
          },
          {
            colspan: 1,
            rowspan: 1,
            type: 'table-cell',
            children: [
              {
                children: [
                  {
                    text: '',
                  },
                ],
              },
            ],
          },
        ],
        height: 35,
        contentHeight: 36.458335876464844,
      },
    ],
    colsWidth: [239, 239, 241],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: '',
      },
    ],
  },
  {
    lineWrapping: false,
    theme: 'light',
    tabSize: 2,
    language: 'javascript',
    id: '3hgnpv1vbp40',
    type: 'codeblock',
    code: '// this is a code block\nconst some_string = "hello world";\nconsole.log(some_string);',
    children: [
      {
        text: '',
      },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: '',
      },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: 'Press ',
      },
      {
        code: true,
        text: '@',
      },
      {
        text: '  to at-mention teammates or collaborators ',
      },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: 'Press ',
      },
      {
        code: true,
        text: '⌘/',
      },
      {
        text: ' (or ',
      },
      {
        code: true,
        text: 'Ctrl/',
      },
      {
        text: ') to see ',
      },
      {
        bold: true,
        text: 'keyboard shortcuts',
      },
      {
        text: ' or ',
      },
      {
        bold: true,
        text: 'markdown syntax',
      },
    ],
  },
]
