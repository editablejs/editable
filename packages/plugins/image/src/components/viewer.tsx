import { isTouchDevice, SlotComponentProps } from '@editablejs/editor'
import { Icon } from '@editablejs/ui'
import React, { FC, useMemo } from 'react'
import { PhotoSlider } from 'react-image-previewer'
import { useViewer } from '../hooks/use-viewer'
import { useViewerIndex } from '../hooks/use-viewer-index'
import { useViewerVisible } from '../hooks/use-viewer-visible'
import { ViewerToolbar } from './viewer-toolbar'

export interface ImageViewerProps extends SlotComponentProps {}

export const ImageViewer: FC<ImageViewerProps> = React.memo(() => {
  const viewer = useViewer()
  const [visible, setVisible] = useViewerVisible()
  const [index, setIndex] = useViewerIndex()
  const images = useMemo(() => {
    return visible ? viewer.images() : []
  }, [visible, viewer])

  return (
    <PhotoSlider
      mode="drag"
      images={images}
      visible={visible}
      index={index}
      onIndexChange={setIndex}
      onClose={() => setVisible(false)}
      loop={true}
      pullClosable={false}
      maskOpacity={isTouchDevice ? 1 : 0.9}
      loadingElement={<Icon tw="text-white text-2xl" name="loading" />}
      overlayRender={props => {
        return <ViewerToolbar {...props} />
      }}
    />
  )
})

ImageViewer.displayName = 'ImageViewer'
