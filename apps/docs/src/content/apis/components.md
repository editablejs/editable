---
id: Editable
title: Editable
permalink: index.html
---

## EditableProvider {/*editable-provider*/}

`EditableProvider` is a React context provider that provides the `Editable` component with the necessary context. It is usually placed at the root of the application.

You can use the `useEditable` hook in components under the `EditableProvider`.

```tsx
<EditableProvider>
  <ContentEditable />
</EditableProvider>
```

### Props {/*editable-provider-props*/}

- editor: `Editor` instance of the editor.
- value?: `Descendant[]` the initial value of the editor.
- children: `ReactNode` the child components.
- onChange?: `(value: Descendant[]) => void` callback function called when the value of the editor changes.

## ContentEditable {/*content-editable*/}

`ContentEditable` is the main component of Editable. It is used to render the editor and provide the editing experience.

```tsx
<EditableProvider>
  <ContentEditable />
</EditableProvider>
```

### Props {/*content-editable-props*/}

- readOnly?: `boolean` whether the editor is read-only. Default to `false`
- lang?: `string` the language of the editor. Default to `en-US`
- autoFocus?: `boolean` whether the editor should be auto-focused. Default to `true`
- placeholder?: `string` the placeholder text.
- role?: `string` ARIA the ARIA role.
- style?: `React.CSSProperties` the style.
- as?: `React.ElementType` the type of the root element. Default to `div`
- selectionDrawingStyle?: `SelectionDrawingStyle` the style of the selection.
