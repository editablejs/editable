import { useState } from 'react'

export interface OpenFileDialogOptions {
  accept?: string
  multiple?: boolean
  onChange?: (file: File[]) => void
  onError?: (error: Error) => void
}

export const openFileDialog = ({
  accept = '*',
  multiple = false,
  onChange,
  onError,
}: OpenFileDialogOptions) => {
  const input = document.createElement('input')
  input.type = 'file'
  if (accept !== '*') input.accept = accept
  input.style.display = 'none'
  document.body.appendChild(input)
  input.multiple = multiple

  input.addEventListener('change', e => {
    if (onChange) onChange(Array.from(input.files ?? []))
    // remove element
    document.body.removeChild(input)
  })
  try {
    // dispatch a click event to open the file dialog
    input.dispatchEvent(new MouseEvent('click'))
  } catch (error) {
    if (onError) onError(error as Error)
    document.body.removeChild(input)
  }
}

export const useFilePicker = (
  options: Omit<OpenFileDialogOptions, 'onChange' | 'onError'> = {},
) => {
  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState<Error | null>(null)
  const open = () => {
    openFileDialog({
      ...options,
      onChange: setFiles,
      onError: error => {
        setFiles([])
        setError(error)
      },
    })
  }

  const clear = () => {
    setFiles([])
    setError(error)
  }
  return [open, { files, clear }]
}
