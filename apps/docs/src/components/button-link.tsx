import NextLink from 'next/link'
import tw from 'twin.macro'

interface ButtonLinkProps {
  size?: 'md' | 'lg'
  type?: 'primary' | 'secondary'
  label?: string
  target?: '_self' | '_blank'
}

function ButtonLink({
  href,
  children,
  type = 'primary',
  size = 'md',
  label,
  target = '_self',
  ...props
}: JSX.IntrinsicElements['a'] & ButtonLinkProps) {
  return (
    <NextLink href={href as string}>
      <a
        css={[
          tw`inline-flex font-bold items-center border-2 border-transparent outline-none focus:ring-1 focus:ring-offset-2 focus:ring-link active:bg-link active:text-white active:ring-0 active:ring-offset-0 leading-normal`,
          type === 'primary' && tw`bg-link text-white hover:bg-opacity-80`,
          type === 'secondary' &&
            tw`bg-secondary-button dark:bg-secondary-button-dark text-primary dark:text-primary-dark hover:text-link focus:bg-link focus:text-white focus:border-link focus:border-2`,
          size === 'lg' && tw`text-lg rounded-lg p-4`,
          size === 'md' && tw`text-base rounded-lg px-4 py-1.5`,
        ]}
        {...props}
        aria-label={label}
        target={target}
      >
        {children}
      </a>
    </NextLink>
  )
}

export default ButtonLink
