import { Editable, ElementAttributes, useLocale, useNodeFocused } from '@editablejs/editor'
import { Editor, Transforms } from '@editablejs/models'
import {
  Icon,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Resizer,
  Toolbar,
  ToolbarButton,
  ToolbarDropdown,
  Tooltip,
  useIsomorphicLayoutEffect,
} from '@editablejs/ui'
import React, { forwardRef, ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import tw, { css } from 'twin.macro'
import { DATA_IMAGE_KEY } from '../constants'
import { ImageEditor } from '../plugin/image-editor'
import { useViewer } from '../hooks/use-viewer'
import { Image, ImageStyle } from '../interfaces/image'
import { ImageLocale } from '../locale'
import { getOptions } from '../options'
import { readImageElement, rotateImgWithCanvas, uploadImage } from '../utils'

export interface ImageComponentProps extends ElementAttributes {
  element: Image
  editor: ImageEditor
  children?: ReactNode
}

export const ImageComponent = forwardRef<HTMLImageElement, ImageComponentProps>(
  ({ children, element, editor, ...props }, ref) => {
    const { url, state, rotate, errorMessage, percentage, width, height } = element
    const [errorMsg, setErrorMsg] = useState(errorMessage)
    const [loading, setLoading] = useState(true)
    const [loaded, setLoaded] = useState(false)
    const [src, setSrc] = useState('')
    const [rotatedUrl, setRotatedUrl] = useState('')
    const [imageDOMElemennt, setImageDOMElement] = useState<HTMLImageElement | null>(null)

    const options = useMemo(() => {
      return getOptions(editor)
    }, [editor])

    const viewer = useViewer()

    useIsomorphicLayoutEffect(() => {
      if (options.onBeforeRender && url && state === 'done') {
        options
          .onBeforeRender(url)
          .then(url => {
            setSrc(url)
          })
          .catch(err => {
            setErrorMsg(err.message)
          })
          .finally(() => {
            setLoading(false)
          })
      } else if (url && state === 'waitingUpload') {
        uploadImage(editor, Editable.findPath(editor, element), url)
      } else if (url) {
        setSrc(url)
        setLoading(false)
      }
    }, [url, state])

    useIsomorphicLayoutEffect(() => {
      if (src) {
        readImageElement(src)
          .then(image => {
            setLoaded(true)
            setImageDOMElement(image)
          })
          .catch(err => {
            if (state === 'done') setErrorMsg(err.message)
          })
      }
    }, [src, state])

    useEffect(() => {
      if (!imageDOMElemennt) {
        return setRotatedUrl('')
      }
      if (rotate !== undefined && loaded && state === 'done') {
        rotateImgWithCanvas(imageDOMElemennt, rotate).then(blob => {
          setRotatedUrl(URL.createObjectURL(blob))
        })
      }
    }, [imageDOMElemennt, rotate, state, loaded])

    useEffect(() => {
      return () => {
        if (rotatedUrl) {
          URL.revokeObjectURL(rotatedUrl)
        }
      }
    }, [rotatedUrl])

    const [maxWidth, setMaxWidth] = useState(0)

    useEffect(() => {
      const path = Editable.findPath(editor, element)
      const parentEntry = Editor.above(editor, {
        at: path,
        match: n => Editor.isBlock(editor, n),
        mode: 'lowest',
      })
      if (parentEntry) {
        const parentEl = Editable.toDOMNode(editor, parentEntry[0])
        setMaxWidth(parentEl.clientWidth)
      }
    }, [editor, element])

    const focused = useNodeFocused()

    const isUploading = state === 'uploading' || state === 'waitingUpload'

    const renderUploading = () => {
      if (!isUploading) return null
      return (
        <div tw="absolute left-0 top-0 w-full h-full flex justify-center items-center text-primary">
          {percentage !== undefined && (
            <div
              css={[
                tw`w-1/3 h-2 rounded bg-gray-400/30 relative overflow-hidden`,
                css`
                  min-width: 8px;
                `,
              ]}
            >
              <div
                tw="absolute left-0 top-0 h-full bg-primary animate-pulse"
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          )}
          {percentage === undefined && <Icon name="loading" />}
        </div>
      )
    }

    const renderLoading = () => {
      if (!loading || loaded) return null
      return (
        <div tw="absolute left-0 top-0 w-full h-full flex justify-center items-center text-primary">
          <Icon name="loading" />
        </div>
      )
    }

    const isError = state === 'error' || !!errorMsg

    const renderError = () => {
      if (!isError) return null
      return (
        <span tw="px-2 py-0.5 text-sm text-red-500 align-baseline border border-gray-300 rounded">
          <span>{errorMsg || 'Image error.'}</span>
        </span>
      )
    }

    const renderImage = () => {
      if (isError || !src || !loaded) return null

      const atts = {
        [DATA_IMAGE_KEY]: Editable.findKey(editor, element).id,
      }
      return (
        <img
          {...atts}
          alt=""
          draggable={false}
          css={[
            tw`inline-block align-baseline rounded w-full h-full`,
            isUploading && tw`opacity-30`,
          ]}
          src={rotatedUrl || src}
        />
      )
    }

    const handleResizeChange = (width: number, height: number) => {
      Transforms.setNodes<Image>(
        editor,
        { width, height },
        { at: Editable.findPath(editor, element) },
      )
    }

    const isFocusedMouseDownBefore = useRef(false)

    const handleImageDown = () => {
      isFocusedMouseDownBefore.current = focused
    }

    const handleImageClick = (event: React.MouseEvent) => {
      if (isFocusedMouseDownBefore.current && !event.defaultPrevented && isDone && loaded) {
        viewer.open(element)
      }
    }

    const renderStyleStroke = () => {
      if (element.style !== 'stroke') return null
      return (
        <div tw="absolute inset-0 w-full h-full border rounded border-gray-300 pointer-events-none" />
      )
    }

    const changeStyle = (style: ImageStyle) => {
      editor.setStyleImage(style, element)
    }

    const changeRotate = (rotate: number) => {
      if (Math.abs(rotate) === 360) {
        rotate = 0
      }
      editor.rotateImage(rotate, element)
    }

    const isDone = state === 'done'

    const autoSize = useMemo(() => {
      if (height === undefined || width === undefined) return undefined
      const ratio = height / width
      if (width > maxWidth) {
        return [maxWidth, maxWidth * ratio]
      }
      return [width, height]
    }, [width, height, loaded, maxWidth])

    const size = autoSize || [width, height]
    const [popoverOpen, setPopoverOpen] = useState(false)

    const handlePopoverOpenChange = (open: boolean) => {
      if (focused) {
        setPopoverOpen(true)
      } else {
        setPopoverOpen(open)
      }
    }

    useIsomorphicLayoutEffect(() => {
      setPopoverOpen(focused)
    }, [focused])

    const { style: styleLocale, viewer: viewerLocale } = useLocale<ImageLocale>('image')

    return (
      <Popover
        open={isDone ? popoverOpen : false}
        onOpenChange={handlePopoverOpenChange}
        trigger="hover"
      >
        <PopoverTrigger asChild>
          <div
            {...props}
            ref={ref}
            css={[
              tw`relative inline-block max-w-full cursor-default rounded border border-transparent leading-[0]`,
              element.style === 'shadow' && tw`shadow-outer`,
              focused && isDone && tw`cursor-zoom-in`,
              !loaded && tw`bg-gray-100`,
              !focused && isDone && popoverOpen && tw`border-primary`,
              (loading || isUploading || isError) && tw`leading-[inherit]`,
            ]}
          >
            <div
              tw="inline-block min-w-[24px] min-h-[24px] h-auto max-w-full"
              style={{
                width: isError ? undefined : size[0],
                height: loaded || isError ? undefined : size[1],
              }}
            >
              <div tw="inline-block" onMouseDown={handleImageDown} onClick={handleImageClick}>
                {renderImage()}
                {renderStyleStroke()}
                <div tw="hidden absolute">{children}</div>
                {renderUploading()}
                {renderError()}
                {renderLoading()}
              </div>
              {focused && !isError && (
                <Resizer
                  onChange={handleResizeChange}
                  previewImage={isDone && loaded ? rotatedUrl || src : undefined}
                  holders={isDone ? undefined : []}
                  tw="rounded"
                />
              )}
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent autoUpdate={true} side="top" sideOffset={5}>
          <Toolbar mode="inline">
            <Tooltip content={viewerLocale.rotateLeft} side="top" sideOffset={5} arrow={false}>
              <ToolbarButton
                icon={<Icon name="rotateLeft" />}
                onToggle={() => changeRotate((rotate ?? 0) - 90)}
              />
            </Tooltip>
            <Tooltip content={viewerLocale.rotateRight} side="top" sideOffset={5} arrow={false}>
              <ToolbarButton
                icon={<Icon name="rotateRight" />}
                onToggle={() => changeRotate((rotate ?? 0) + 90)}
              />
            </Tooltip>
            <Tooltip content={styleLocale.tooltip} side="top" sideOffset={5} arrow={false}>
              <ToolbarDropdown
                onSelect={value => changeStyle(value as ImageStyle)}
                value={element.style || 'none'}
                items={[
                  { value: 'none', content: styleLocale.none },
                  { value: 'stroke', content: styleLocale.stroke },
                  { value: 'shadow', content: styleLocale.shadow },
                ]}
              >
                {styleLocale.title}
              </ToolbarDropdown>
            </Tooltip>
          </Toolbar>
        </PopoverContent>
      </Popover>
    )
  },
)
ImageComponent.displayName = 'ImageComponent'
