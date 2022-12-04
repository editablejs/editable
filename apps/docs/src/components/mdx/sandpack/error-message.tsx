interface ErrorType {
  title?: string
  message: string
  column?: number
  line?: number
  path?: string
}

export function ErrorMessage({ error, ...props }: { error: ErrorType }) {
  const { message, title } = error

  return (
    <div tw="bg-white border-2 border-red-40 rounded-lg p-6" {...props}>
      <h2 tw="text-red-40 text-xl mb-4">{title || 'Error'}</h2>
      <pre tw="text-secondary whitespace-pre-wrap break-words leading-tight">{message}</pre>
    </div>
  )
}
