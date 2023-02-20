import * as React from 'react'
import ButtonLink from 'components/button-link'
import { IconNavArrow } from 'components/icon/nav-arrow'
import { useTranslation } from 'react-i18next'

interface YouWillLearnCardProps {
  title: string
  path: string
  children: React.ReactNode
}

function YouWillLearnCard({ title, path, children }: YouWillLearnCardProps) {
  const { t } = useTranslation()
  return (
    <div tw="bg-card dark:bg-card-dark mt-3 flex h-full flex-col justify-between rounded-lg p-6 pb-8 shadow-inner xl:p-8">
      <div>
        <h4 tw="dark:text-primary-dark text-2xl font-bold leading-tight text-primary">{title}</h4>
        <div tw="my-4">{children}</div>
      </div>
      <div>
        <ButtonLink href={path} tw="mt-1" type="primary" size="md" label={title}>
          {t('docs.read-more')}
          <IconNavArrow displayDirection="right" tw="ml-1 inline" />
        </ButtonLink>
      </div>
    </div>
  )
}

export default YouWillLearnCard
