import { Logo } from 'components/logo'
import YouWillLearnCard from 'components/mdx/you-will-learn-card'

function HomepageHero() {
  return (
    <>
      <div tw="mx-auto mt-8 mb-0 flex max-w-4xl grow flex-col items-start justify-start sm:mt-8 sm:mb-8 sm:flex-row sm:items-center lg:mt-10 lg:mb-6">
        <Logo tw="text-link dark:text-link-dark mr-4 mb-4 h-auto w-20 sm:mb-0 sm:w-28" />
        <div tw="flex flex-wrap">
          <h1 tw="dark:text-primary-dark mr-4 -mt-1 flex text-5xl font-bold leading-tight text-primary">
            Editable Docs
          </h1>
          <div tw="bg-highlight dark:bg-highlight-dark text-link dark:text-link-dark mt-1 inline-flex w-auto self-center whitespace-nowrap rounded px-2 text-base font-bold uppercase tracking-wide">
            Beta
          </div>
        </div>
      </div>
      <section tw="my-8 grid grid-cols-1 gap-x-8 gap-y-4 sm:my-10 lg:grid-cols-2">
        <div tw="flex flex-col justify-center">
          <YouWillLearnCard title="Learn Editable" path="/learn">
            <p>
              Learn how to think in Editable with step-by-step explanations and interactive
              examples.
            </p>
          </YouWillLearnCard>
        </div>
        <div tw="flex flex-col justify-center">
          <YouWillLearnCard title="API Reference" path="/apis/editable">
            <p>Look up the API of Editable, and see their shape with color-coded signatures.</p>
          </YouWillLearnCard>
        </div>
      </section>
    </>
  )
}

export default HomepageHero
