import { useRouter } from 'next/router'

export function useActiveSection(): 'learn' | 'apis' | 'home' | 'playground' {
  const { asPath } = useRouter()
  if (asPath.startsWith('/apis')) {
    return 'apis'
  } else if (asPath.startsWith('/learn')) {
    return 'learn'
  } else if (asPath.startsWith('/playground')) {
    return 'playground'
  } else {
    return 'home'
  }
}
