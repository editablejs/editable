import { ImageLocale } from './types'

const locale: ImageLocale = {
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

export default locale
