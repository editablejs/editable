---
title: Installation
---

<Intro>

This page will show you how to integrate the Editable editor into your React project.

</Intro>

## Step 1: Install Editable {/*step-1*/}

<TerminalBlock>

npm install @editablejs/models @editablejs/editor

</TerminalBlock>

You also need React as a dependency

<TerminalBlock>

npm install react react-dom

</TerminalBlock>

## Step 2: Import Editable {/*step-2*/}

```js
// Import React dependencies
import * as React from 'react'
// Import the Editable package
import { createEditor } from '@editablejs/models'
// Import the Editable package
import { EditableProvider, ContentEditable, withEditable } from '@editablejs/editor'

```

## Step 3: Create an Editor object {/*step-3*/}

Before we use these imports, let's start with an empty `<App />`

We want the editor to be stable across renders, so we use the `useRemo` hook with an empty dependency

```js
const App = () => {
   // Create an Editable editor object that won't change across renders.
   const editor = React.useMemo(() => {
     return withEditable(createEditor())
   }, [])
   return null
}

```

Of course we're not rendering anything, so you won't see any changes.

## Step 4: Use the editor's context provider `EditableProvider`

You can think of the `<EditableProvider>` component as providing context for every component below it.

```js
const App = () => {
   const editor = React.useMemo(() => {
     return withEditable(createEditor())
   }, [])
   return <EditableProvider editor={editor} />
}

```

By sharing the context, you can access the editor object in other components using the `useEditable` and `useEditableStatic` hooks.

## Step 5: Render the editable area `ContentEditable`

The `ContentEditable` component is an editable area that behaves like `contenteditable`.

The difference is that we don't use the `contenteditable` attribute, and any behavior of it is expected and controllable.

Editable takes over most keystrokes and mouse events to simulate editable interactive behaviors (including input behaviors).

```js
const App = () => {
   const editor = React.useMemo(() => {
     return withEditable(createEditor())
   }, [])
   return <EditableProvider editor={editor}>
     <ContentEditable placeholder="Please enter content..." />
   </EditableProvider>
}

```

Finally, you can see that there is an editable area in your page, and you can try to edit it. Also, there isn't any `contenteditable` or native editable property on the page to support it.

## Next steps {/*next-steps*/}

Go to the [Using Plugins](/learn/using-plugins) guide to learn how to use plugins for Editable.
