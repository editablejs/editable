import startServer from '@editablejs/yjs-websocket/server'

startServer({
  initialValue: {
    children: [
      // 启用标题插件下的默认值
      {
        type: 'title',
        children: [{ text: '' }],
      },
      {
        type: 'paragraph',
        children: [{ text: '' }],
      },
    ],
  },
})
