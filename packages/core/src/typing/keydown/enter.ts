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
		const changeNode = model.splitNode(anchor.key, anchor.offset)
		model.applyNode(changeNode)
		e.preventDefault()
	}
}

export default Enter;
