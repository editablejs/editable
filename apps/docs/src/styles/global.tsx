import { createGlobalStyle } from 'styled-components'
import tw, { GlobalStyles as BaseStyles } from 'twin.macro'
import { AlgoliaStyle } from './algolia'

const CustomStyles = createGlobalStyle({
  html: {
    colorScheme: 'light',
    WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)',
  },
  body: {
    WebkitTapHighlightColor: 'transparent',
    ...tw`bg-wash dark:bg-wash-dark text-secondary dark:text-secondary-dark leading-base font-sans antialiased text-lg`,
    '@media screen and (max-width: 1023px)': {
      ...tw`overflow-x-hidden`,
    },
  },
  a: {
    cursor: 'pointer',
  },
})

const GlobalStyles = () => (
  <>
    <BaseStyles />
    <CustomStyles />
    <AlgoliaStyle />
  </>
)

export default GlobalStyles
