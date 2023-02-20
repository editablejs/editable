import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { IconRestart } from '../../icon/restart'
export interface ResetButtonProps {
  onReset: () => void
}

export function ResetButton({ onReset }: ResetButtonProps) {
  const { t } = useTranslation()
  return (
    <button
      tw="dark:text-primary-dark hover:text-link mx-1 inline-flex items-center text-sm text-primary transition duration-100 ease-in"
      onClick={onReset}
      title={t('docs.sandpack.reset') ?? ''}
      type="button"
    >
      <IconRestart tw="relative ml-1 mr-1 inline" /> {t('docs.sandpack.reset')}
    </button>
  )
}
