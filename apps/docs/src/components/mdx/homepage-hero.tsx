import { IconLogo } from 'components/icon/logo'
import YouWillLearnCard from 'components/mdx/you-will-learn-card'
import { useTranslation } from 'react-i18next'

function HomepageHero() {
  const { t } = useTranslation()

  return (
    <>
      <div tw="mx-auto mt-8 mb-0 flex max-w-4xl grow flex-col items-start justify-start sm:mt-8 sm:mb-8 sm:flex-row sm:items-center lg:mt-10 lg:mb-6">
        <IconLogo tw="text-link dark:text-link-dark mr-4 mb-4 sm:mb-0 text-5xl" />
        <div tw="flex flex-wrap">
          <h1 tw="dark:text-primary-dark mr-4 mt-1 flex text-5xl font-bold leading-tight text-primary">
            Editable Docs
          </h1>
        </div>
      </div>
      <section tw="my-8 grid grid-cols-1 gap-x-8 gap-y-4 sm:my-10 lg:grid-cols-2">
        <div tw="flex flex-col justify-center">
          <YouWillLearnCard title={t('docs.learn-editable')} path="/learn">
            <p>{t('docs.learn-editable-detail')}</p>
          </YouWillLearnCard>
        </div>
        <div tw="flex flex-col justify-center">
          <YouWillLearnCard title={t('docs.api-reference')} path="/apis/editable">
            <p>{t('docs.api-reference-detail')}</p>
          </YouWillLearnCard>
        </div>
      </section>
    </>
  )
}

export default HomepageHero
