---
title: Installation
---

<Intro>

TODO

</Intro>

## Try Editable {/*try-editable*/}

You don't need to install anything to play with Editable. Try editing this sandbox!

<Sandpack>

```js
import * as React from 'react'
import {
  EditableProvider,
  ContentEditable,
  createEditor,
} from '@editablejs/editor'


export default function Docs() {
  const editor = React.useMemo(() => {
    return createEditor()
  }, [])

  return (
    <div>
      <EditableProvider editor={editor}>
        <ContentEditable placeholder="Please enter content..." />
      </EditableProvider>
    </div>
  )
}

```

</Sandpack>

You can edit it directly or open it in a new tab by pressing the "Fork" button in the upper right corner.

## Next steps {/*next-steps*/}

Head to the [Quick Start](/learn) guide for a tour of the most important Editable concepts you will encounter.

