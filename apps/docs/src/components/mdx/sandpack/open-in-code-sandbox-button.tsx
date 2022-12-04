import { UnstyledOpenInCodeSandboxButton } from '@codesandbox/sandpack-react'
import { IconNewPage } from '../../icon/new-page'

export const OpenInCodeSandboxButton = () => {
  return (
    <UnstyledOpenInCodeSandboxButton
      tw="dark:text-primary-dark hover:text-link mx-1 ml-2 inline-flex items-center text-sm text-primary transition duration-100 ease-in md:ml-1"
      title="Open in CodeSandbox"
    >
      <IconNewPage tw="relative top-[1px] ml-1 mr-1 inline" width="1em" height="1em" />
      <span tw="hidden md:block">Fork</span>
    </UnstyledOpenInCodeSandboxButton>
  )
}
