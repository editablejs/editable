import { INode, Element } from '@editablejs/model';
import DefaultKeydown from './default';

class Enter extends DefaultKeydown {
	hotkey = 'enter';

	emit(e: KeyboardEvent) {
		const editor = this.editor
		const model = editor.model
		const change = editor.change
		let range = change.getRange()
		if(!range) return
		if(!range.isCollapsed) {
			change.deleteContents()
			range = change.getRange()
			if(!range) return
		}
		const { anchor } = range
		let node = model.getNode(anchor.key);
		if(!node) return
		let offset = anchor.offset;
		while(true) {
			const key = node.getKey()
			if(!node.getParentKey()) break
			model.splitNode(key, offset)
			const parentKey: string | null = node.getParentKey()
      if(!parentKey) break
      const parent: INode | null = model.getNode(parentKey)
      if(!parent) break
      if(!Element.isElement(parent)) break
			offset = parent.indexOf(key)
			if(!~offset) break
			offset += 1
      node = parent
		}
		const key = node.getKey()
		if(key !== anchor.key) { 
			editor.selection.moveToForward()
		}
		e.preventDefault()
	}
}

export default Enter;
