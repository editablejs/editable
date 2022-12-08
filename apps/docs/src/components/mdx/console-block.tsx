import * as React from 'react'
import { IconWarning } from '../icon/warning'
import { IconError } from '../icon/error'
import tw from 'twin.macro'

type LogLevel = 'warning' | 'error' | 'info'

interface ConsoleBlockProps {
  level?: LogLevel
  children: React.ReactNode
}

const Box = ({
  width = '60px',
  height = '17px',
  className,
  customStyles,
}: {
  width?: string
  height?: string
  className?: string
  customStyles?: Record<string, string>
}) => <div className={className} style={{ width, height, ...customStyles }}></div>

function ConsoleBlock({ level = 'error', children }: ConsoleBlockProps) {
  let message: React.ReactNode | null
  if (typeof children === 'string') {
    message = children
  } else if (React.isValidElement(children)) {
    message = children.props.children
  }

  return (
    <div tw="text-secondary mb-4" translate="no">
      <div tw="dark:bg-gray-80 flex w-full rounded-t-lg bg-gray-200">
        <div tw="dark:border-gray-90 border-r border-gray-300 px-4 py-2">
          <Box tw="dark:bg-gray-90 bg-gray-300" width="15px" />
        </div>
        <div tw="flex px-4 text-sm">
          <div tw="dark:border-gray-90 border-b-2 border-gray-300">Console</div>
          <div tw="flex px-4 py-2">
            <Box tw="dark:bg-gray-90 mr-2 bg-gray-300" />
            <Box tw="dark:bg-gray-90 mr-2 hidden bg-gray-300 md:block" />
            <Box tw="dark:bg-gray-90 hidden bg-gray-300 md:block" />
          </div>
        </div>
      </div>
      <div
        css={[
          tw`flex content-center items-center rounded-b-md px-4 pt-4 pb-6 font-mono text-code`,
          level === 'error' && tw`bg-red-30 text-red-40 bg-opacity-10`,
          level === 'warning' && tw`bg-yellow-5 text-yellow-50`,
          level === 'info' && tw`bg-gray-5 text-secondary dark:text-secondary-dark`,
        ]}
      >
        {level === 'error' && <IconError tw="mt-1.5 self-start" />}
        {level === 'warning' && <IconWarning tw="mt-1 self-start" />}
        <div tw="px-3">{message}</div>
      </div>
    </div>
  )
}

export default ConsoleBlock
