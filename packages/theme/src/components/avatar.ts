
import { useCallbackRef } from '@/hooks/use-callback-ref'
import { useIsomorphicLayoutEffect } from '@/hooks/use-isomorphic-layout-effect'
import { HTMLAttributes, ImgHTMLAttributes, createContext, html, nothing, useContext, useEffect, useState, virtual } from 'rezon'
import { spread } from 'rezon/directives/spread'

/* -------------------------------------------------------------------------------------------------
 * Avatar
 * -----------------------------------------------------------------------------------------------*/

type ImageLoadingStatus = 'idle' | 'loading' | 'loaded' | 'error'

type AvatarContextValue = {
  imageLoadingStatus: ImageLoadingStatus
  onImageLoadingStatusChange(status: ImageLoadingStatus): void
}

const AvatarContext = createContext<AvatarContextValue>(null as any)

const useAvatarContext = () => useContext(AvatarContext)


interface AvatarProps extends HTMLAttributes<HTMLSpanElement> { }


const Avatar = virtual<AvatarProps>((props) => {
  const [imageLoadingStatus, setImageLoadingStatus] = useState<ImageLoadingStatus>('idle')
  return AvatarContext.Provider({
    value: {
      imageLoadingStatus,
      onImageLoadingStatusChange: setImageLoadingStatus,
    },
    children: html`<span ${spread(props)}></span>`,
  })
})


/* -------------------------------------------------------------------------------------------------
 * AvatarImage
 * -----------------------------------------------------------------------------------------------*/

interface AvatarImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  onLoadingStatusChange?: (status: ImageLoadingStatus) => void
}

const AvatarImage = virtual<AvatarImageProps>((props) => {
  const { src, onLoadingStatusChange = () => { }, ...imageProps } = props
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

  return imageLoadingStatus === 'loaded' ? html`<img src=${src} ${spread(imageProps)} />` : nothing
})

/* -------------------------------------------------------------------------------------------------
 * AvatarFallback
 * -----------------------------------------------------------------------------------------------*/


interface AvatarFallbackProps extends HTMLAttributes<HTMLSpanElement> {
  delayMs?: number
}

const AvatarFallback = virtual<AvatarFallbackProps>(
  (props: AvatarFallbackProps) => {
    const { delayMs, ...fallbackProps } = props
    const context = useAvatarContext()
    const [canRender, setCanRender] = useState(delayMs === undefined)

    useEffect(() => {
      if (delayMs !== undefined) {
        const timerId = window.setTimeout(() => setCanRender(true), delayMs)
        return () => window.clearTimeout(timerId)
      }
    }, [delayMs])

    return canRender && context.imageLoadingStatus !== 'loaded' ? html`<span ${spread(fallbackProps)}></span>` : nothing
  },
)

/* -----------------------------------------------------------------------------------------------*/

function useImageLoadingStatus(src?: string) {
  const [loadingStatus, setLoadingStatus] = useState<ImageLoadingStatus>('idle')

  useEffect(() => {
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
  Avatar,
  AvatarImage,
  AvatarFallback,
}
export type { AvatarProps, AvatarImageProps, AvatarFallbackProps }
