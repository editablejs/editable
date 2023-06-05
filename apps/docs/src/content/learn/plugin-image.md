---
title: Image
---

<Intro>

This page will show you how to use the `Image` plugin.

</Intro>

## Installation {/*image-install*/}

<TerminalBlock>

npm install @editablejs/plugin-image

</TerminalBlock>

## Usage {/*image-using*/}

<Sandpack deps={['@editablejs/plugin-image']}>

```js
import * as React from 'react'
import { createEditor } from '@editablejs/models'
import { EditableProvider, ContentEditable, withEditable } from '@editablejs/editor'
import { withImage } from '@editablejs/plugin-image'

const defaultValue = [
  {
    children: [
      { text: 'This is a' },
      {
        url: 'https://raw.githubusercontent.com/editablejs/editable/main/assets/sparticle-logo.png',
        state: 'done',
        width: 386,
        height: 82,
        type: 'image',
        children: [
          {
            text: '',
          },
        ],
        percentage: 100,
      },
      { text: ' image.'}
    ]
  },
]
export default function App() {
  const editor = React.useMemo(() => {
    const editor = withEditable(createEditor())
    return withImage(editor)
  }, [])

  return (
    <EditableProvider editor={editor} value={defaultValue}>
      <ContentEditable />
    </EditableProvider>
  )
}

```

</Sandpack>

## Options {/*image-options*/}

`withImage` accepts an optional parameter to configure the `Image` plugin.

```js
withImage(editor, options)
```

### locale {/*image-options-locale*/}

`locale` is used to configure internationalization for the `Image` plugin.

- Type: `Record<string, ImageLocale>`
- Default:
  ```ts
  const defaultLocale: Record<string, ImageLocale> ={
    locale: 'en-US',
    image: {
      viewer: {
        arrowLeft: 'Previous',
        arrowRight: 'Next',
        arrowLeftDisabled: 'Already the first one',
        arrowRightDisabled: 'Already the last one',
        close: 'Close',
        zoomIn: 'Zoom in',
        zoomOut: 'Zoom out',
        oneToOne: 'Original size',
        rotateLeft: 'Rotate left',
        rotateRight: 'Rotate right',
        download: 'Download',
      },
      style: {
        title: 'Style',
        tooltip: 'Image style',
        none: 'None',
        stroke: 'Stroke',
        shadow: 'Shadow',
      },
    },
  }
  ```

### hotkey {/*image-options-hotkey*/}

`hotkey` is used to configure the shortcut keys for the `Image` plugin.

- Type: `ImageHotkey`
- Default:  `None`

- Example:

```ts
withImage(editor, {
  hotkey: {
    'image': 'mod+shift+i',
  }
})
```

### shortcuts {/*image-options-shortcuts*/}

`shortcuts` is used to configure shortcuts for the `Image` plugin.

- Type: `boolean`
- Default: `true`

- Example:

```ts
withImage(editor, {
  shortcuts: true
})
```

### allowRotate {/*image-options-allowrotate*/}

`allowRotate` is used to configure whether the `Image` plugin allows rotation.

- Type: `boolean`
- Default: `true`

- Example:

```ts
withImage(editor, {
  allowRotate: true
})
```

### onBeforeRender {/*image-options-onbeforerender*/}

`onBeforeRender`  is used to configure the callback before rendering the `Image` plugin.

- Type: `(url: string) => Promise<string>`
- Default: `None`

- Example:

```ts
withImage(editor, {
  onBeforeRender: url => {
    return new Promise(resolve => {
      resolve(url)
    })
  }
})
```

### onUploadBefore {/*image-options-onuploadbefore*/}

`onUploadBefore` is used to configure the callback before uploading images with the `Image` plugin.

- Type: `(files: (File | string)[]) => (File | string)[]`
- Default: `None`

- Example:

```ts
withImage(editor, {
  onUploadBefore: files => {
    return files
  }
})
```

### onUpload {/*image-options-onupload*/}

`onUpload` is used to configure the callback for uploading images with the `Image` plugin.

- Type: `(file: File | string, update: (options: Record<'percentage', number>) => void) => Promise<string>`
- Default:  `toBase64`

- Example:

```ts
withImage(editor, {
  onUpload: (file, update) => {
    return new Promise(resolve => {
      resolve('https://raw.githubusercontent.com/editablejs/editable/main/assets/sparticle-logo.png')
    })
  }
})
```

### onRotate {/*image-options-onrotate*/}

`onRotate` is used to configure the callback for rotating images with the `Image` plugin.

- Type: `(file: File) => Promise<string | { url: string; rotate?: number }>`
- Default: `None`

- Example:

```ts
withImage(editor, {
  onRotate: file => {
    return new Promise(resolve => {
      resolve('https://raw.githubusercontent.com/editablejs/editable/main/assets/sparticle-logo.png')
    })
  }
})
```
