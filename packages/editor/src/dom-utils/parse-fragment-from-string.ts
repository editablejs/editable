
export const parseFragmentFromString = (fragment: string) => {
  const string = decodeURIComponent(window.atob(fragment))
  try {
    return JSON.parse(string)
  } catch (error) {
    return []
  }
}
