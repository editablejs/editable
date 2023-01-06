import { useEffect, useState } from 'react'

const LOCAL_STORAGE_KEY = 'ea_ui_colors'

export const useLocalStore = () => {
  const [colors, setColors] = useState<string[]>([])

  useEffect(() => {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (data) {
      setColors(JSON.parse(data))
    }
  }, [])

  const addColors = (addColors: string[]) => {
    const currentColors = colors.filter(color => !addColors.includes(color))
    const newColors = addColors.concat(currentColors).slice(0, 10)
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newColors))
    setColors(newColors)
  }

  return [colors, addColors] as const
}
