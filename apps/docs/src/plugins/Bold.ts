import { EditableInterface } from "@editablejs/core";

interface BoldEditor {

  toggleBold: () => void

  queryBold: () => boolean
}

const formatName = 'fontWeight'
const formatValue = 'bold'

const withBold = <T extends EditableInterface>(editor: T) => {
  const newEditor = editor as T & BoldEditor

  const queryBold = () => {
    return newEditor.queryFormat((name, value) => name === formatName && value.indexOf(formatValue) > -1)
  }

  newEditor.toggleBold = () => { 
    if(queryBold()) {
      newEditor.deleteFormat(formatName)
    } else {
      newEditor.setFormat(formatName, formatValue)
    }
  }

  newEditor.queryBold = queryBold

  return newEditor
}

export default withBold