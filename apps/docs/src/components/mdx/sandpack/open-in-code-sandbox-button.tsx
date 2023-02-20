import { UnstyledOpenInCodeSandboxButton } from '@codesandbox/sandpack-react'
import { useTranslation } from 'react-i18next'
import { IconNewPage } from '../../icon/new-page'

export const OpenInCodeSandboxButton = () => {
  const { t } = useTranslation()

  return (
    <UnstyledOpenInCodeSandboxButton
      tw="dark:text-primary-dark hover:text-link mx-1 ml-2 inline-flex items-center text-sm text-primary transition duration-100 ease-in md:ml-1"
      title={t('docs.sandpack.open-in-code-sandbox') ?? ''}
    >
      <IconNewPage tw="relative top-[1px] ml-1 mr-1 inline" width="1em" height="1em" />
      <span tw="hidden md:block">{t('docs.sandpack.fork')}</span>
    </UnstyledOpenInCodeSandboxButton>
  )
}
