---
title: Image
---

<Intro>

这个页面将向您展示如何使用 `Image` 插件。

</Intro>

## 安装 Image {/*image-install*/}

<TerminalBlock>

npm install @editablejs/plugin-image

</TerminalBlock>

## 使用 Image {/*image-using*/}

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

## 可选项 {/*image-options*/}

`withImage` 接受一个可选的参数，用于配置 `Image` 插件。

```js
withImage(editor, options)
```

### locale {/*image-options-locale*/}

`locale` 用于配置 `Image` 插件的国际化。

- 类型：`Record<string, ImageLocale>`
- 默认值：
  ```ts
  const defaultLocale: Record<string, ImageLocale> ={
    locale: 'zh-CN',
    image: {
      viewer: {
        arrowLeft: '上一张',
        arrowRight: '下一张',
        arrowLeftDisabled: '已经是第一张',
        arrowRightDisabled: '已经是最后一张',
        close: '关闭',
        zoomIn: '放大',
        zoomOut: '缩小',
        oneToOne: '原始尺寸',
        rotateLeft: '向左旋转',
        rotateRight: '向右旋转',
        download: '下载',
      },
      style: {
        title: '样式',
        tooltip: '图片样式',
        none: '无样式',
        stroke: '图片描边',
        shadow: '图片阴影',
      },
    },
  }
  ```

### hotkey {/*image-options-hotkey*/}

`hotkey` 用于配置 `Image` 插件的快捷键。

- 类型：`ImageHotkey`
- 默认值: `无`

- 示例：

```ts
withImage(editor, {
  hotkey: {
    'image': 'mod+shift+i',
  }
})
```

### shortcuts {/*image-options-shortcuts*/}

`shortcuts` 用于配置 `Image` 插件快捷方式。

- 类型：`boolean`
- 默认值：`true`

- 示例：

```ts
withImage(editor, {
  shortcuts: true
})
```

### allowRotate {/*image-options-allowrotate*/}

`allowRotate` 用于配置 `Image` 插件是否允许旋转。

- 类型：`boolean`
- 默认值：`true`

- 示例：

```ts
withImage(editor, {
  allowRotate: true
})
```

### onBeforeRender {/*image-options-onbeforerender*/}

`onBeforeRender` 用于配置 `Image` 插件渲染前的回调。

- 类型：`(url: string) => Promise<string>`
- 默认值：`无`

- 示例：

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

`onUploadBefore` 用于配置 `Image` 插件上传前的回调。

- 类型：`(files: (File | string)[]) => (File | string)[]`
- 默认值：`无`

- 示例：

```ts
withImage(editor, {
  onUploadBefore: files => {
    return files
  }
})
```

### onUpload {/*image-options-onupload*/}

`onUpload` 用于配置 `Image` 插件上传的回调。

- 类型：`(file: File | string, update: (options: Record<'percentage', number>) => void) => Promise<string>`
- 默认值: `toBase64`

- 示例：

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

`onRotate` 用于配置 `Image` 插件旋转的回调。

- 类型：`(file: File) => Promise<string | { url: string; rotate?: number }>`
- 默认值：`无`

- 示例：

```ts
withImage(editor, {
  onRotate: file => {
    return new Promise(resolve => {
      resolve('https://raw.githubusercontent.com/editablejs/editable/main/assets/sparticle-logo.png')
    })
  }
})
```
