import * as React from 'react'
import { IconChevron } from '../icon/chevron'
import { IconDeepDive } from '../icon/deep-dive'
import { IconCodeBlock } from '../icon/code-block'
import { Button } from '../button'
import tw, { styled } from 'twin.macro'
import { useTranslation } from 'react-i18next'

interface ExpandableExampleProps {
  children: React.ReactNode
  title: string
  excerpt?: string
  type: 'DeepDive' | 'Example'
}

const StyledButton = styled(Button)(
  ({ isDeepDive, isExample }: { isDeepDive: boolean; isExample: boolean }) => [
    isDeepDive &&
      tw`hover:bg-purple-40 border-purple-50 bg-purple-50 focus:bg-purple-50 active:bg-purple-50`,
    isExample &&
      tw`hover:bg-yellow-40 border-yellow-50 bg-yellow-50 focus:bg-yellow-50 active:bg-yellow-50`,
  ],
)

function ExpandableExample({ children, title, excerpt, type }: ExpandableExampleProps) {
  const [isExpanded, setIsExpanded] = React.useState(false)
  const isDeepDive = type === 'DeepDive'
  const isExample = type === 'Example'

  const { t } = useTranslation()

  return (
    <details
      open={isExpanded}
      onToggle={(e: any) => {
        setIsExpanded(e.currentTarget!.open)
      }}
      css={[
        tw`relative my-12 rounded-lg shadow-inner`,
        isDeepDive && tw`dark:bg-purple-60 bg-purple-5 dark:bg-opacity-20`,
        isExample && tw`dark:bg-yellow-60 bg-yellow-5 dark:bg-opacity-20`,
      ]}
    >
      <summary
        tw="list-none p-8"
        tabIndex={-1 /* there's a button instead */}
        onClick={e => {
          // We toggle using a button instead of this whole area.
          e.preventDefault()
        }}
      >
        <h5
          css={[
            tw`mb-4 flex items-center text-sm font-bold uppercase`,
            isDeepDive && tw`dark:text-purple-30 text-purple-50`,
            isExample && tw`dark:text-yellow-30 text-yellow-60`,
          ]}
        >
          {isDeepDive && (
            <>
              <IconDeepDive tw="dark:text-purple-30 text-purple-40 mr-2 inline" />
              Deep Dive
            </>
          )}
          {isExample && (
            <>
              <IconCodeBlock tw="dark:text-yellow-30 mr-2 inline text-yellow-50" />
              Example
            </>
          )}
        </h5>
        <div tw="mb-4">
          <h3 tw="dark:text-primary-dark text-xl font-bold text-primary">{title}</h3>
          {excerpt && <div>{excerpt}</div>}
        </div>
        <StyledButton
          active={true}
          onClick={() => setIsExpanded(current => !current)}
          isDeepDive={isDeepDive}
          isExample={isExample}
        >
          <span tw="mr-1">
            <IconChevron displayDirection={isExpanded ? 'up' : 'down'} />
          </span>
          {isExpanded ? t('docs.hide-details') : t('docs.show-details')}
        </StyledButton>
      </summary>
      <div
        css={[
          tw`border-t p-8`,
          isDeepDive && tw`dark:border-purple-60 border-purple-10`,
          isExample && tw`dark:border-yellow-60 border-yellow-50`,
        ]}
      >
        {children}
      </div>
    </details>
  )
}

export default ExpandableExample
