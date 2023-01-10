import * as React from 'react'
import { useCallbackRef } from './hooks/use-callback-ref'
import { Root } from './root'
import { useIsomorphicLayoutEffect } from './utils'

/* -------------------------------------------------------------------------------------------------
 * Avatar
 * -----------------------------------------------------------------------------------------------*/

const AVATAR_NAME = 'Avatar'

type ImageLoadingStatus = 'idle' | 'loading' | 'loaded' | 'error'

type AvatarContextValue = {
  imageLoadingStatus: ImageLoadingStatus
  onImageLoadingStatusChange(status: ImageLoadingStatus): void
}

const AvatarContext = React.createContext<AvatarContextValue>(null as any)
const useAvatarContext = () => React.useContext(AvatarContext)

type AvatarElement = React.ElementRef<typeof Root.span>
type PrimitiveSpanProps = React.ComponentPropsWithoutRef<typeof Root.span>
interface AvatarProps extends PrimitiveSpanProps {}

const Avatar = React.forwardRef<AvatarElement, AvatarProps>((props: AvatarProps, forwardedRef) => {
  const [imageLoadingStatus, setImageLoadingStatus] = React.useState<ImageLoadingStatus>('idle')
  return (
    <AvatarContext.Provider
      value={{
        imageLoadingStatus,
        onImageLoadingStatusChange: setImageLoadingStatus,
      }}
    >
      <Root.span {...props} ref={forwardedRef} />
    </AvatarContext.Provider>
  )
})

Avatar.displayName = AVATAR_NAME

/* -------------------------------------------------------------------------------------------------
 * AvatarImage
 * -----------------------------------------------------------------------------------------------*/

const IMAGE_NAME = 'AvatarImage'

type AvatarImageElement = React.ElementRef<typeof Root.img>
type PrimitiveImageProps = React.ComponentPropsWithoutRef<typeof Root.img>
interface AvatarImageProps extends PrimitiveImageProps {
  onLoadingStatusChange?: (status: ImageLoadingStatus) => void
}

const AvatarImage = React.forwardRef<AvatarImageElement, AvatarImageProps>(
  (props: AvatarImageProps, forwardedRef) => {
    const { src, onLoadingStatusChange = () => {}, ...imageProps } = props
    const context = useAvatarContext()
    const imageLoadingStatus = useImageLoadingStatus(src)
    const handleLoadingStatusChange = useCallbackRef((status: ImageLoadingStatus) => {
      onLoadingStatusChange(status)
      context.onImageLoadingStatusChange(status)
    })

    useIsomorphicLayoutEffect(() => {
      if (imageLoadingStatus !== 'idle') {
        handleLoadingStatusChange(imageLoadingStatus)
      }
    }, [imageLoadingStatus, handleLoadingStatusChange])

    return imageLoadingStatus === 'loaded' ? (
      <Root.img {...imageProps} ref={forwardedRef} src={src} />
    ) : null
  },
)

AvatarImage.displayName = IMAGE_NAME

/* -------------------------------------------------------------------------------------------------
 * AvatarFallback
 * -----------------------------------------------------------------------------------------------*/

const FALLBACK_NAME = 'AvatarFallback'

type AvatarFallbackElement = React.ElementRef<typeof Root.span>
interface AvatarFallbackProps extends PrimitiveSpanProps {
  delayMs?: number
}

const AvatarFallback = React.forwardRef<AvatarFallbackElement, AvatarFallbackProps>(
  (props: AvatarFallbackProps, forwardedRef) => {
    const { delayMs, ...fallbackProps } = props
    const context = useAvatarContext()
    const [canRender, setCanRender] = React.useState(delayMs === undefined)

    React.useEffect(() => {
      if (delayMs !== undefined) {
        const timerId = window.setTimeout(() => setCanRender(true), delayMs)
        return () => window.clearTimeout(timerId)
      }
    }, [delayMs])

    return canRender && context.imageLoadingStatus !== 'loaded' ? (
      <Root.span {...fallbackProps} ref={forwardedRef} />
    ) : null
  },
)

AvatarFallback.displayName = FALLBACK_NAME

/* -----------------------------------------------------------------------------------------------*/

function useImageLoadingStatus(src?: string) {
  const [loadingStatus, setLoadingStatus] = React.useState<ImageLoadingStatus>('idle')

  React.useEffect(() => {
    if (!src) {
      setLoadingStatus('error')
      return
    }

    let isMounted = true
    const image = new window.Image()

    const updateStatus = (status: ImageLoadingStatus) => () => {
      if (!isMounted) return
      setLoadingStatus(status)
    }

    setLoadingStatus('loading')
    image.onload = updateStatus('loaded')
    image.onerror = updateStatus('error')
    image.src = src

    return () => {
      isMounted = false
    }
  }, [src])

  return loadingStatus
}

export {
  //
  Avatar,
  AvatarImage,
  AvatarFallback,
}
export type { AvatarProps, AvatarImageProps, AvatarFallbackProps }
