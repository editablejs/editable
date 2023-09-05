[![zh-CN](https://img.shields.io/badge/lang-%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87-red.svg?longCache=true&style=flat-square 'zh-CN')](README.zh-CN.md)

# Editable

`Editable` is an extensible rich text editor framework that focuses on stability, controllability, and performance. To achieve this, we did not use the native editable attribute [~~contenteditable~~](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/contenteditable), but instead used a custom renderer that allows us to better control the editor's behavior. From now on, you no longer have to worry about cross-platform and browser compatibility issues (such as `Selection`, `Input`), just focus on your business logic.

## preview
![preview](/assets/preview.png)

You can see a demo here: https://docs.editablejs.com/playground


---

- Why not use `canvas` rendering?

  Although `canvas` rendering may be faster than DOM rendering in terms of performance, the development experience of `canvas` is not good and requires writing more code.

- Why use `React` for rendering?

  `React` makes plugins more flexible and has a good ecosystem. However, React's performance is not as good as native DOM.

  In my ideal frontend framework for rich text, it should be like this:

  1. No virtual DOM
  2. No diff algorithm
  3. No proxy object

  Therefore, I compared frontend frameworks such as `Vue`, `Solid-js`, and `SvelteJS` and found that `Solid-js` meets the first two criteria, but each property is wrapped in a `proxy`, which may cause problems when comparing with pure JS objects using `===` during extension development.

  To improve performance, we are likely to refactor it for native DOM rendering in future development.

Currently, React meets the following two standards:

- [x] Development experience
- [x] Plugin extensibility
- [ ] Cross-frontend compatibility
- [ ] Rendering performance

In the subsequent refactoring selection, we will try to balance these four standards as much as possible.

## Quick Start

> Currently, you still need to use it with `React` for the current version, but we will refactor it for native DOM rendering in future versions.

Install `@editablejs/models` and `@editablejs/editor` dependencies:

```bash
npm i --save @editablejs/models @editablejs/editor
```

Here's a minimal text editor that you can edit:

```tsx
import * as React from 'react'
import { createEditor } from '@editablejs/models'
import { EditableProvider, ContentEditable, withEditable } from '@editablejs/editor'

const App = () => {

  const editor = React.useMemo(() => withEditable(createEditor()), [])

  return (
  <EditableProvider editor={editor}>
    <ContentEditable placeholder="Please enter content..." />
  </EditableProvider>)
}
```

## Data Model

`@editablejs/models` provides a data model for describing the state of the editor and operations on the editor state.

```ts
{
  type: 'paragraph',
  children: [
    {
      type: 'text',
      text: 'Hello World'
    }
  ]
}
```

As you can see, its structure is very similar to [`Slate`](https://github.com/ianstormtaylor/slate), and we did not create a new data model, but directly used Slate's data model and extended it (added `Grid`, `List` related data structures and operations). Depending on these mature and excellent data structures can make our editor more stable.

We have encapsulated all of Slate's APIs into `@editablejs/models`, so you can find all of Slate's APIs in @editablejs/models.

If you are not familiar with Slate, you can refer to its documentation: https://docs.slatejs.org/

## Plugins

Currently, we provide some out-of-the-box plugins that not only implement basic functionality, but also provide support for `keyboard shortcuts`, `Markdown syntax`, `Markdown serialization`, `Markdown deserialization`, `HTML serialization`, and `HTML deserialization`.

### Common Plugins

- `@editablejs/plugin-context-menu` provides a right-click menu. Since we do not use some of the functionality of the native contenteditable menu, we need to define our own right-click menu functionality.
- `@editablejs/plugin-align` for text alignment
- `@editablejs/plugin-blockquote` for block quotes
- `@editablejs/plugin-codeblock` for code blocks
- `@editablejs/plugin-font` includes font color, background color, and font size
- `@editablejs/plugin-heading` for headings
- `@editablejs/plugin-hr` for horizontal lines
- `@editablejs/plugin-image` for images
- `@editablejs/plugin-indent` for indentation
- `@editablejs/plugin-leading` for line spacing
- `@editablejs/plugin-link` for links
- `@editablejs/plugin-list` includes ordered lists, unordered lists, and task lists
- `@editablejs/plugin-mark` includes `bold`, `italic`, `strikethrough`, `underline`, `superscript`, `subscript`, and `code`
- `@editablejs/plugin-mention` for mentions
- `@editablejs/plugin-table` for tables

The usage method of a single plugin, taking `plugin-mark` as an example:

```tsx
import { withMark } from '@editablejs/mark'

const editor = React.useMemo(() => {
  const editor = withEditable(createEditor())
  return withMark(editor)
}, [])
```

You can also use the following method to quickly use the above common plugins via `withPlugins` in `@editablejs/plugins`:

```tsx
import { withPlugins } from '@editablejs/plugins'

const editor = React.useMemo(() => {
  const editor = withEditable(createEditor())
  return withPlugins(editor)
}, [])
```

### History Plugin

The `@editablejs/plugin-history` plugin provides undo and redo functionality.

```tsx
import { withHistory } from '@editablejs/plugin-history'

const editor = React.useMemo(() => {
  const editor = withEditable(createEditor())
  return withHistory(editor)
}, [])
```

### Title Plugin

When developing document or blog applications, we usually have a separate title and main content, which is often implemented using an `input` or `textarea` outside of the editor. If in a collaborative environment, since it is independent of the editor, additional work is required to achieve real-time synchronization of the title.

The `@editablejs/plugin-title` plugin solves this problem by using the editor's first child node as the title, integrating it into the editor's entire data structure so that it can have the same features as the editor.

```tsx
import { withTitle } from '@editablejs/plugin-title'
const editor = React.useMemo(() => {
  const editor = withEditable(createEditor())
  return withTitle(editor)
}, [])
```

It also has a separate placeholder property for setting the placeholder for the title.

```tsx
return withTitle(editor, {
  placeholder: 'Please enter a title'
})
```

### Yjs Plugin

The `@editablejs/plugin-yjs` plugin provides support for Yjs, which can synchronize the editor's data in real-time to other clients.

You need to install the following dependencies:

- yjs The core library of Yjs

  @editablejs/yjs-websocket Yjs websocket communication library

  In addition, it also provides the implementation of the nodejs server, which you can use to set up a yjs service:
  ```ts
  import startServer from '@editablejs/yjs-websocket/server'

  startServer()
  ```
- `@editablejs/plugin-yjs` Yjs plugin used with the editor

```bash
npm i yjs @editablejs/yjs-websocket @editablejs/plugin-yjs
```

<details>
  <summary>Instructions:</summary>
<p>

```tsx
import * as Y from 'yjs'
import { withYHistory, withYjs, YjsEditor, withYCursors, CursorData, useRemoteStates } from '@editablejs/plugin-yjs'
import { WebsocketProvider } from '@editablejs/yjs-websocket'

// Create a yjs document
const document = React.useMemo(() => new Y.Doc(), [])
// Create a websocket provider
const provider = React.useMemo(() => {
  return typeof window === 'undefined'
      ? null
      : new WebsocketProvider(yjsServiceAddress, 'editable', document, {
          connect: false,
        })
}, [document])
// Create an editor
const editor = React.useMemo(() => {
  // Get the content field from yjs document, which is of type XmlText
  const sharedType = document.get('content', Y.XmlText) as Y.XmlText
  let editor = withYjs(withEditable(createEditor()), sharedType, { autoConnect: false })
  if (provider) {
    // Synchronize cursors with other clients
    editor = withYCursors(editor, provider.awareness, {
      data: {
        name: 'Test User',
        color: '#f00',
      },
    })
  }
  // History record
  editor = withHistory(editor)
  // yjs history record
  editor = withYHistory(editor)
}, [provider])

// Connect to yjs service
React.useEffect(() => {
  provider?.connect()
  return () => {
    provider?.disconnect()
  }
}, [provider])

```
</p>
</details>

### Custom Plugin

Creating a custom plugin is very simple. We just need to intercept the `renderElement` method, and then determine if the current node is the one we need. If it is, we will render our custom component.

<details>
  <summary>An example of a custom plugin:</summary>
<p>

```tsx
import { Editable } from '@editablejs/editor'
import { Element, Editor } from '@editablejs/models'

// Define the type of the plugin
export interface MyPlugin extends Element {
  type: 'my-plugin'
  // ... You can also define other properties
}

export const MyPlugin = {
  // Determine if a node is a plugin for MyPlugin
  isMyPlugin(editor: Editor, element: Element): element is MyPlugin {
    return Element.isElement(value) && element.type === 'my-plugin'
  }
}

export const withMyPlugin = <T extends Editable>(editor: T) => {
  const { isVoid, renderElement } = editor
  // Intercept the isVoid method. If it is a node for MyPlugin, return true
  // Besides the isVoid method, there are also methods such as `isBlock` `isInline`, which can be intercepted as needed.
  editor.isVoid = element => {
    return MyPlugin.isMyPlugin(editor, element) || isVoid(element)
  }
  // Intercept the renderElement method. If it is a node for MyPlugin, render the custom component
  // attributes are the attributes of the node, we need to pass it to the custom component
  // children are the child nodes of the node, which contains the child nodes of the node. We must render them
  // element is the current node, and you can find your custom properties in it
  editor.renderElement = ({ attributes, children, element }) => {
    if (MyPlugin.isMyPlugin(editor, element)) {
      return <div {...attributes}>
        <div>My Plugin</div>
        {children}
        </div>
    }
    return renderElement({ attributes, children, element })
  }

  return editor
}
```
</p>
</details>

### Serialization

`@editablejs/serializer` provides a serializer that can serialize editor data into `html`, `text`, and `markdown` formats.

The serialization transformers for the plugins provided have already been implemented, so you can use them directly.

<details>
<summary>HTML Serialization</summary>
<p>

```tsx
  // html serializer
import { HTMLSerializer } from '@editablejs/serializer/html'
// import the HTML serializer transformer of the plugin-mark plugin, and other plugins are the same
import { withMarkHTMLSerializerTransform } from '@editablejs/plugin-mark/serializer/html'
// use the transformer
HTMLSerializer.withEditor(editor, withMarkHTMLSerializerTransform, {})
// serialize to HTML
const html = HTMLSerializer.transformWithEditor(editor, { type: 'paragraph', children: [{ text: 'hello', bold: true }] })
// output: <p><strong>hello</strong></p>
```
</p>
</details>

<details>
<summary>Text Serialization</summary>
<p>

```tsx
// text serializer
import { TextSerializer } from '@editablejs/serializer/text'
// import the Text serializer transformer of the plugin-mention plugin
import { withMentionTextSerializerTransform } from '@editablejs/plugin-mention/serializer/text'
// use the transformer
TextSerializer.withEditor(editor, withMentionTextSerializerTransform, {})
// serialize to Text
const text = TextSerializer.transformWithEditor(editor, { type: 'paragraph', children: [{ text: 'hello' }, {
  type: 'mention',
  children: [{ text: '' }],
  user: {
    name: 'User',
    id: '1',
  },
}] })
// output: hello @User
```
</p>
</details>

<details>
<summary>Markdown Serialization</summary>
<p>

```tsx
// markdown serializer
import { MarkdownSerializer } from '@editablejs/serializer/markdown'
// import the Markdown serializer transformer of the plugin-mark plugin
import { withMarkMarkdownSerializerTransform } from '@editablejs/plugin-mark/serializer/markdown'
// use the transformer
MarkdownSerializer.withEditor(editor, withMarkMarkdownSerializerTransform, {})
// serialize to Markdown
const markdown = MarkdownSerializer.transformWithEditor(editor, { type: 'paragraph', children: [{ text: 'hello', bold: true }] })
// output: **hello**
```
</p>
</details>

Every plugin requires importing its own serialization converter, which is cumbersome, so we provide the serialization converters for all built-in plugins in `@editablejs/plugins`.

```tsx
import { withHTMLSerializerTransform } from '@editablejs/plugins/serializer/html'
import { withTextSerializerTransform } from '@editablejs/plugins/serializer/text'
import { withMarkdownSerializerTransform, withMarkdownSerializerPlugin } from '@editablejs/plugins/serializer/markdown'

useLayoutEffect(() => {
  withMarkdownSerializerPlugin(editor)
  withTextSerializerTransform(editor)
  withHTMLSerializerTransform(editor)
  withMarkdownSerializerTransform(editor)
}, [editor])
```

### Deserialization

`@editablejs/serializer` provides a deserializer that can deserialize data in `html`, `text`, and `markdown` formats into editor data.

The deserialization transformers for the plugins provided have already been implemented, so you can use them directly.

The usage is similar to serialization, except that the package path for importing needs to be changed from `@editablejs/serializer` to `@editablejs/deserializer`.

## Contributors ✨

Welcome 🌟 Stars and 📥 PRs! Let's work together to build a better rich text editor!

The [contributing guide](CONTRIBUTING.md) is here, please feel free to read it. If you have a good plugin, please share it with us.

Special thanks to [Sparticle](https://www.sparticle.com) for their support and contribution to the open source community.
[![sparticle](/assets/sparticle-logo.png)](https://www.sparticle.com)

Finally, thank you to everyone who has contributed to this project! ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://claviering.github.io/"><img src="https://avatars.githubusercontent.com/u/16227832?v=4?s=100" width="100px;" alt="Kevin Lin"/><br /><sub><b>Kevin Lin</b></sub></a><br /><a href="https://github.com/big-camel/Editable/commits?author=claviering" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://yaokailun.github.io/"><img src="https://avatars.githubusercontent.com/u/11460856?v=4?s=100" width="100px;" alt="kailunyao"/><br /><sub><b>kailunyao</b></sub></a><br /><a href="https://github.com/big-camel/Editable/commits?author=YaoKaiLun" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/ren-chen2021"><img src="https://avatars.githubusercontent.com/u/88533891?v=4?s=100" width="100px;" alt="ren.chen"/><br /><sub><b>ren.chen</b></sub></a><br /><a href="https://github.com/big-camel/Editable/commits?author=ren-chen2021" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/byoungd"><img src="https://avatars.githubusercontent.com/u/16145783?v=4?s=100" width="100px;" alt="han"/><br /><sub><b>han</b></sub></a><br /><a href="https://github.com/big-camel/Editable/commits?author=byoungd" title="Documentation">📖</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

## Thanks

We would like to thank the following open-source projects for their contributions:

- [Slate](https://github.com/ianstormtaylor/slate) - provides support for data modeling.
- [Yjs](https://github.com/yjs/yjs) - provides basic support for CRDTs, used for collaborative editing support.
- [React](https://github.com/facebook/react) - provides support for the view layer.
- [Zustand](https://github.com/pmndrs/zustand) - a minimal front-end state management tool.
- [Other dependencies](https://github.com/editablejs/editable/network/dependencies)

We use the following open-source projects to help us build a better development experience:

- [Turborepo](https://github.com/vercel/turbo) -- pnpm + turbo is a great monorepo manager and build system.

## License

See [LICENSE](https://github.com/editablejs/editable/blob/main/LICENSE) for details.
