import * as React from 'react'
import { IconTerminal } from '../icon/terminal'
import { IconCopy } from 'components/icon/copy'

type LogLevel = 'info' | 'warning' | 'error'

interface TerminalBlockProps {
  level?: LogLevel
  children: React.ReactNode
}

function LevelText({ type }: { type: LogLevel }) {
  switch (type) {
    case 'warning':
      return <span tw="mr-1 bg-none text-yellow-50">Warning: </span>
    case 'error':
      return <span tw="text-red-40 mr-1">Error: </span>
    default:
      return null
  }
}

const getMessages = (children: React.ReactNode): string => {
  if (typeof children === 'string') {
    return children
  } else if (React.isValidElement(children) && typeof children.props.children === 'string') {
    return children.props.children
  } else if (Array.isArray(children)) {
    return children.map(getMessages).join('\n')
  } else {
    throw Error('Expected TerminalBlock children to be a plain string.')
  }
}

function TerminalBlock({ level = 'info', children }: TerminalBlockProps) {
  let message: string | undefined = getMessages(children)

  const [copied, setCopied] = React.useState(false)
  React.useEffect(() => {
    if (!copied) {
      return
    } else {
      const timer = setTimeout(() => {
        setCopied(false)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [copied])

  return (
    <div tw="bg-secondary h-full rounded-lg dark:bg-gray-50">
      <div tw="bg-gray-90 dark:bg-gray-60 w-full rounded-t-lg">
        <div tw="text-primary-dark dark:text-primary-dark relative flex justify-between px-4 py-0.5 text-sm">
          <div>
            <IconTerminal tw="mr-2 inline-flex self-center" /> Terminal
          </div>
          <div>
            <button
              tw="text-primary-dark dark:text-primary-dark w-full text-left "
              onClick={() => {
                window.navigator.clipboard.writeText(message ?? '')
                setCopied(true)
              }}
            >
              <IconCopy tw="mr-2 inline-flex self-center" /> {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      </div>
      <div tw="text-primary-dark dark:text-primary-dark whitespace-pre px-8 pt-4 pb-6 font-mono text-code">
        <LevelText type={level} />
        {message}
      </div>
    </div>
  )
}

export default TerminalBlock
