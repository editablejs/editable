---
title: Quick Start
---

<Intro>

Before learning how to use `Editable`, you may need to understand some basic concepts.

- The data model relies on [Slate](https://docs.slatejs.org/), its data model is parallel to the DOM tree structure, almost all of our operations will be applied to it, so you may need to understand [Slate](https://docs.slatejs.org/) for the basic concepts.

- View rendering relies on [React](https://reactjs.org) and [React Hooks](https://reactjs.org/docs/hooks-intro.html), which are responsible for rendering editor data into dom nodes.

</Intro>

<YouWillLearn>

- How to install the Editable package
- How to create an editor instance
- How to render an editable area with React

</YouWillLearn>

## Try Editable {/*try-editable*/}

Before learning, you don't need to install anything to experiment with Editable. Try editing this sandbox!

<Sandpack>

```js
import * as React from 'react'
import { createEditor } from '@editablejs/models'
import {
  EditableProvider,
  ContentEditable,
  withEditable,
} from '@editablejs/editor'

export default function App() {
  const editor = React.useMemo(() => {
    return withEditable(createEditor())
  }, [])

  return (
    <EditableProvider editor={editor}>
      <ContentEditable placeholder="Please enter content..." />
    </EditableProvider>
  )
}

```

</Sandpack>

You can edit it directly or open it in a new tab by pressing the "Fork" button in the upper right corner.

## Next steps {/*next-steps*/}

Go to the [Installation](/learn/installation) guide to learn how to install Editable.

