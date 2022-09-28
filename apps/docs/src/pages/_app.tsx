import GlobalStyles from '../styles/global'

export default function App({ Component, pageProps }: any) {
  return (
    <>
      <GlobalStyles />
      <Component {...pageProps} />
    </>
  )
}
