import tw from 'twin.macro'

interface InlineCodeProps {
  isLink: boolean
}
function InlineCode({ isLink, ...props }: JSX.IntrinsicElements['code'] & InlineCodeProps) {
  return (
    <code
      css={[
        tw`inline text-code text-secondary dark:text-secondary-dark px-1 rounded-md no-underline`,
        !isLink && tw`bg-gray-30 bg-opacity-10 py-px`,
        isLink && tw`bg-highlight dark:bg-highlight-dark py-0`,
      ]}
      {...props}
    />
  )
}

export default InlineCode
