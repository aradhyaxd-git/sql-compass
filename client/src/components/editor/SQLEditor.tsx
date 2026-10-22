import { useEffect, useRef } from 'react'
import { EditorState } from '@codemirror/state'
import { EditorView, keymap, lineNumbers, highlightActiveLine } from '@codemirror/view'
import { defaultKeymap, historyKeymap, history } from '@codemirror/commands'
import { sql } from '@codemirror/lang-sql'
import { oneDark } from '@codemirror/theme-one-dark'
import { autocompletion, closeBrackets } from '@codemirror/autocomplete'
import { useTheme } from '@/context/ThemeContext'

interface SQLEditorProps {
  value: string
  onChange: (value: string) => void
  onRun?: () => void
}

export default function SQLEditor({ value, onChange, onRun }: SQLEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const { theme } = useTheme()

  useEffect(() => {
    if (!containerRef.current) return

    const runKeymap = keymap.of([
      {
        key: 'Mod-Enter',
        run: () => {
          onRun?.()
          return true
        },
      },
    ])

    const isDark = theme === 'dark'

    const editorTheme = EditorView.theme({
      '&': {
        backgroundColor: 'var(--bg-card)',
        height: '100%',
        fontSize: '13px',
        fontFamily: 'var(--font-mono)',
        color: 'var(--text-primary)',
      },
      '.cm-scroller': { overflow: 'auto' },
      '.cm-content': { padding: '12px 0' },
      '.cm-line': { padding: '0 16px' },
      '.cm-gutters': {
        backgroundColor: 'var(--bg-card)',
        borderRight: '1px solid var(--border-default)',
        color: 'var(--text-muted)',
      },
      '.cm-activeLine': {
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)',
      },
      '.cm-activeLineGutter': {
        backgroundColor: 'transparent',
        color: 'var(--brand-primary)',
      },
      '.cm-cursor': {
        borderLeftColor: 'var(--brand-primary)',
      },
    })

    const extensions = [
      editorTheme,
      ...(isDark ? [oneDark] : []),
      sql(),
      history(),
      autocompletion(),
      closeBrackets(),
      lineNumbers(),
      highlightActiveLine(),
      keymap.of([...defaultKeymap, ...historyKeymap]),
      runKeymap,
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          onChange(update.state.doc.toString())
        }
      }),
    ]

    const state = EditorState.create({
      doc: value,
      extensions,
    })

    const view = new EditorView({ state, parent: containerRef.current })
    viewRef.current = view

    return () => {
      view.destroy()
      viewRef.current = null
    }
  }, [theme])

  useEffect(() => {
    const view = viewRef.current
    if (!view) return

    const current = view.state.doc.toString()
    if (current === value) return

    view.dispatch({
      changes: { from: 0, to: current.length, insert: value },
    })
  }, [value])

  return (
    <div
      ref={containerRef}
      style={{
        height: '100%',
        width: '100%',
        background: 'var(--bg-card)',
        overflow: 'hidden',
      }}
    />
  )
}