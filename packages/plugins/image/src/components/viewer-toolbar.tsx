import { useLocale } from '@editablejs/editor'
import { CloseIcon, Tooltip } from '@editablejs/ui'
import { FC } from 'react'
import { OverlayRenderProps } from 'react-image-previewer'
import {
  CloseButton,
  SlideToolbar,
  DragToolbar,
  DragArrowLeft,
  DragArrowRight,
  DragZoomOut,
  DragZoomIn,
  DragOneToOne,
  DragDownload,
  DragRotateLeft,
  DragRotateRight,
} from 'react-image-previewer/ui'
import { IMAGE_KEY } from '../constants'
import { ImageLocale } from '../locale'

export const ViewerToolbar: FC<OverlayRenderProps> = props => {
  const { mode, index, images, onClose } = props
  const count = images.length
  const isFirst = index === 0
  const isLast = index === count - 1

  const { viewer: viewerLocale } = useLocale<ImageLocale>(IMAGE_KEY)

  if (mode === 'slide') {
    return (
      <>
        <SlideToolbar {...props} />
        <CloseButton onClick={onClose} />
      </>
    )
  }

  return (
    <>
      <DragToolbar
        {...props}
        items={[
          {
            key: 'arrowLeft',
            component: props => (
              <Tooltip content={isFirst ? viewerLocale.arrowLeftDisabled : viewerLocale.arrowLeft}>
                <a>
                  <DragArrowLeft {...props} />
                </a>
              </Tooltip>
            ),
          },
          'countText',
          {
            key: 'arrowRight',
            component: props => (
              <Tooltip content={isLast ? viewerLocale.arrowRightDisabled : viewerLocale.arrowRight}>
                <a>
                  <DragArrowRight {...props} />
                </a>
              </Tooltip>
            ),
          },
          'split',
          {
            key: 'zoomOut',
            component: props => (
              <Tooltip content={viewerLocale.zoomOut}>
                <a>
                  <DragZoomOut {...props} />
                </a>
              </Tooltip>
            ),
          },
          'scaleCount',
          {
            key: 'zoomIn',
            component: props => (
              <Tooltip content={viewerLocale.zoomIn}>
                <a>
                  <DragZoomIn {...props} />
                </a>
              </Tooltip>
            ),
          },
          {
            key: 'oneToOne',
            component: props => (
              <Tooltip content={viewerLocale.oneToOne}>
                <a>
                  <DragOneToOne {...props} />
                </a>
              </Tooltip>
            ),
          },
          'split',
          {
            key: 'download',
            component: props => (
              <Tooltip content={viewerLocale.download}>
                <a>
                  <DragDownload {...props} />
                </a>
              </Tooltip>
            ),
          },
          'split',
          {
            key: 'rotateLeft',
            component: props => (
              <Tooltip content={viewerLocale.rotateLeft}>
                <a>
                  <DragRotateLeft {...props} />
                </a>
              </Tooltip>
            ),
          },
          {
            key: 'rotateRight',
            component: props => (
              <Tooltip content={viewerLocale.rotateRight}>
                <a>
                  <DragRotateRight {...props} />
                </a>
              </Tooltip>
            ),
          },
        ]}
      />
      <CloseButton onClick={onClose}>
        <Tooltip content={viewerLocale.close}>
          <a>
            <CloseIcon />
          </a>
        </Tooltip>
      </CloseButton>
    </>
  )
}
