// types/twin.d.ts
import 'twin.macro'
import { keyframes as keyframesImport, css as cssImport } from '@emotion/css'

declare module 'twin.macro' {
  // The styled and css imports
  const keyframes: typeof keyframesImport
  const css: typeof cssImport
}

