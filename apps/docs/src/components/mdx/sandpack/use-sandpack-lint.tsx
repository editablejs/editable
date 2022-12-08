// @ts-nocheck

import * as React from 'react'
import type { EditorView } from '@codemirror/view'

export type LintDiagnostic = {
  line: number
  column: number
  severity: 'warning' | 'error'
  message: string
}[]

export const useSandpackLint = () => {
  const [lintErrors, setLintErrors] = React.useState<LintDiagnostic>([])
  const [lintExtensions, setLintExtensions] = React.useState<any>([])
  React.useEffect(() => {
    const loadLinter = async () => {
      const { linter } = await import('@codemirror/lint')
      const onLint = linter(async (props: EditorView) => {
        // This is intentionally delayed until CodeMirror calls it
        // so that we don't take away bandwidth from things loading early.
        const { runESLint } = await import('./run-eslint')
        const editorState = props.state.doc
        let { errors, codeMirrorErrors } = runESLint(editorState)
        // Ignore parsing or internal linter errors.
        const isReactRuleError = (error: any) => error.ruleId != null
        setLintErrors(errors.filter(isReactRuleError))
        return codeMirrorErrors.filter(isReactRuleError)
      })
      setLintExtensions([onLint])
    }

    loadLinter()
  }, [])
  return { lintErrors, lintExtensions }
}
