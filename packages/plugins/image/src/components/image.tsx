import {
  Editable,
  Editor,
  ElementAttributes,
  Transforms,
  useLocale,
  useNodeFocused,
} from '@editablejs/editor'
import {
  Icon,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Resizer,
  RotateLeftIcon,
  Toolbar,
  ToolbarButton,
  ToolbarDropdown,
  Tooltip,
  useIsomorphicLayoutEffect,
} from '@editablejs/plugin-ui'
import React, { forwardRef, ReactNode, useMemo, useRef, useState } from 'react'
import tw, { css } from 'twin.macro'
import { DATA_IMAGE_KEY } from '../constants'
import { ImageEditor } from '../editor'
import { useViewer } from '../hooks/use-viewer'
import { Image, ImageStyle } from '../interfaces/image'
import { ImageLocale } from '../locale'
import { getOptions } from '../options'
import { readImageInfo, uploadImage } from '../utils'

export interface ImageComponentProps extends ElementAttributes {
  element: Image
  editor: ImageEditor
  children?: ReactNode
}

export const ImageComponent = forwardRef<HTMLImageElement, ImageComponentProps>(
  ({ children, element, editor, ...props }, ref) => {
    const { url, state, errorMessage, percentage, width, height } = element
    const [error, setError] = useState(errorMessage)
    const [loading, setLoading] = useState(true)
    const [loaded, setLoaded] = useState(false)
    const [src, setSrc] = useState('')

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
            setError(err.message)
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
        readImageInfo(src)
          .then(() => {
            setLoaded(true)
          })
          .catch(err => {
            if (state === 'done') setError(err.message)
          })
      }
    }, [src, state])

    const [maxWidth, setMaxWidth] = useState(0)

    useIsomorphicLayoutEffect(() => {
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

    const isError = state === 'error' || !!error

    const renderError = () => {
      if (!isError) return null
      return (
        <span tw="px-2 py-0.5 text-red-500 align-baseline border border-gray-300 rounded">
          <span>Image Error: {error}</span>
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
          css={[tw`inline-block align-baseline w-full h-full`, isUploading && tw`opacity-30`]}
          src={src}
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
      if (isFocusedMouseDownBefore.current && !event.defaultPrevented) {
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
      <Popover open={popoverOpen} onOpenChange={handlePopoverOpenChange} actions={[]}>
        <PopoverTrigger asChild>
          <div
            {...props}
            ref={ref}
            css={[
              tw`relative inline-block max-w-full cursor-default rounded`,
              css`
                line-height: 0;
                transform: rotate(${element.rotate ?? 0}deg);
              `,
              element.style === 'shadow' && tw`shadow-outer`,
              focused && isDone && tw`cursor-zoom-in`,
              !loaded && tw`bg-gray-100`,
            ]}
          >
            <div
              tw="inline-block min-w-[24px] min-h-[24px] h-auto max-w-full"
              style={{ width: size[0], height: loaded ? undefined : size[1] }}
            >
              <div onMouseDown={handleImageDown} onClick={handleImageClick}>
                {renderImage()}
                {renderStyleStroke()}
                <div tw="hidden absolute">{children}</div>
                {renderUploading()}
                {renderError()}
                {renderLoading()}
              </div>
              {focused && (
                <Resizer
                  onChange={handleResizeChange}
                  previewImage={isDone && loaded ? src : undefined}
                  holders={isDone ? undefined : []}
                  tw="rounded"
                />
              )}
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent autoUpdate={true} side="top" sideOffset={5}>
          <Toolbar mode="inline">
            <Tooltip content={viewerLocale.arrowLeft} side="top" sideOffset={5} arrow={false}>
              <ToolbarButton onToggle={() => changeRotate((element.rotate ?? 0) - 90)}>
                <RotateLeftIcon />
              </ToolbarButton>
            </Tooltip>
            <Tooltip content={styleLocale.tooltip} side="top" sideOffset={5} arrow={false}>
              <ToolbarDropdown
                onToggle={value => changeStyle(value as ImageStyle)}
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
