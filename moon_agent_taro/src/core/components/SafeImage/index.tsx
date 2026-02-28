import { Image, View, Text } from '@tarojs/components'
import { useState, useCallback, memo, useEffect } from 'react'
import type { ImageProps } from '@tarojs/components'

export interface SafeImageProps extends Omit<ImageProps, 'onError' | 'onLoad'> {
  /** Image source URL */
  src: string
  /** Fallback image URL when loading fails */
  fallbackSrc?: string
  /** Custom placeholder component to show while loading */
  placeholder?: React.ReactNode
  /** Custom fallback component to show when loading fails */
  fallbackComponent?: React.ReactNode
  /** Show loading state */
  showLoading?: boolean
  /** Callback when image loads successfully */
  onLoad?: () => void
  /** Callback when image fails to load */
  onError?: (error: unknown) => void
  /** Custom class name for wrapper */
  wrapperClassName?: string
}

/**
 * SafeImage - A cross-platform image component with fallback support
 * 
 * Features:
 * - Automatic fallback component on load error
 * - Optional loading state indicator
 * - Works across H5, WeChat Mini Program, and React Native
 * 
 * @example
 * ```tsx
 * <SafeImage
 *   src="https://example.com/image.jpg"
 *   mode="aspectFit"
 *   className="w-full h-48"
 *   fallbackComponent={<Text>加载失败</Text>}
 * />
 * ```
 */
function SafeImageComponent({
  src,
  fallbackSrc,
  placeholder,
  fallbackComponent,
  showLoading = false,
  onLoad,
  onError,
  wrapperClassName,
  className,
  style,
  lazyLoad = true,
  mode = 'aspectFit',
  ...rest
}: SafeImageProps) {
  const [isLoading, setIsLoading] = useState(showLoading)
  const [hasError, setHasError] = useState(false)

  // Reset state when src changes
  useEffect(() => {
    setHasError(false)
    setIsLoading(showLoading)
  }, [src, showLoading])

  const handleLoad = useCallback(() => {
    setIsLoading(false)
    setHasError(false)
    onLoad?.()
  }, [onLoad])

  const handleError = useCallback(
    (e: unknown) => {
      console.warn('[SafeImage] Load failed:', src, e)
      setIsLoading(false)
      setHasError(true)
      onError?.(e)
    },
    [src, onError]
  )

  // Show fallback component when error
  if (hasError) {
    if (fallbackComponent) {
      return <View className={wrapperClassName}>{fallbackComponent}</View>
    }
    if (fallbackSrc) {
      return (
        <View className={wrapperClassName} style={{ position: 'relative' }}>
          <Image
            src={fallbackSrc}
            mode={mode}
            className={className}
            style={style}
            {...rest}
          />
        </View>
      )
    }
    // Default fallback: show placeholder text
    const fallbackStyle = typeof style === 'object' && style !== null
      ? { ...style, display: 'flex', alignItems: 'center', justifyContent: 'center' }
      : { display: 'flex', alignItems: 'center', justifyContent: 'center' }
    return (
      <View
        className={`${wrapperClassName || ''} ${className || ''}`}
        style={fallbackStyle}
      >
        <Text style={{ fontSize: '12px', color: '#9ca3af' }}>加载失败</Text>
      </View>
    )
  }

  return (
    <View className={wrapperClassName} style={{ position: 'relative' }}>
      {isLoading && placeholder}
      <Image
        src={src}
        mode={mode}
        lazyLoad={lazyLoad}
        className={className}
        style={style}
        onLoad={handleLoad}
        onError={handleError}
        {...rest}
      />
    </View>
  )
}

export const SafeImage = memo(SafeImageComponent)
export default SafeImage

