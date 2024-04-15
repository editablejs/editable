
export const getFilesFromDataTransfer = (dataTransfer: DataTransfer) => {
  let files: File[] = []

  try {
    if (dataTransfer.items && dataTransfer.items.length > 0) {
      for (const item of dataTransfer.items) {
        let file = item.kind === 'file' ? item.getAsFile() : null
        if (file !== null) {
          if (file.type && file.type.indexOf('image/png') > -1 && !file.lastModified) {
            file = new File([file], 'image.png', {
              type: file.type,
            })
          }
        }
        if (file) files.push(file)
      }
    } else if (dataTransfer.files && dataTransfer.files.length > 0) {
      files = Array.from(dataTransfer.files)
    }
  } catch (err) {
    if (dataTransfer.files && dataTransfer.files.length > 0) {
      files = Array.from(dataTransfer.files)
    }
  }
  return files
}
