---
id: Editable
title: Editable
permalink: index.html
---

## EditableProvider {/*editable-provider*/}

`EditableProvider` 是一个React上下文提供者，为 Editable 组件提供必要的上下文。通常将其放置在编辑器程序的根部。

你可以在`EditableProvider`下的组件中使用`useEditable`钩子。

```tsx
<EditableProvider>
  <ContentEditable />
</EditableProvider>
```

### Props {/*editable-provider-props*/}

- editor: `Editor` 编辑器实例
- value?: `Descendant[]` 编辑器的初始值
- children: `ReactNode` 子组件
- onChange?: `(value: Descendant[]) => void` 编辑器的值发生变化时的回调

## ContentEditable {/*content-editable*/}

`ContentEditable` 是Editable的主要组件。它用于呈现编辑器并提供编辑能力。

```tsx
<EditableProvider>
  <ContentEditable />
</EditableProvider>
```

### Props {/*content-editable-props*/}

- readOnly?: `boolean` 是否只读，默认为`false`
- lang?: `string` 语言，默认为`en-US`
- autoFocus?: `boolean` 是否自动聚焦，默认为`true`
- placeholder?: `string` 占位符
- role?: `string` ARIA 角色
- style?: `React.CSSProperties` 样式
- as?: `React.ElementType` 根元素的类型，默认为`div`
- selectionDrawingStyle?: `SelectionDrawingStyle` 选区样式
