import * as React from 'react'
import { Button } from 'components/button'
import { ChallengeContents } from './challenges'
import { IconHint } from '../../icon/hint'
import { IconSolution } from '../../icon/solution'
import { IconArrowSmall } from '../../icon/arrow-small'
import tw, { styled } from 'twin.macro'
import { useTranslation } from 'react-i18next'

interface ChallengeProps {
  isRecipes?: boolean
  totalChallenges: number
  currentChallenge: ChallengeContents
  hasNextChallenge: boolean
  handleClickNextChallenge: () => void
}

const StyledButton = styled(Button)(({ isRecipes }: { isRecipes?: boolean }) => [
  isRecipes &&
    tw`border-purple-50 bg-purple-50 hover:bg-purple-50 focus:bg-purple-50 active:bg-purple-50`,
  !isRecipes && tw`bg-link dark:bg-link-dark`,
])

const StyledNextChallengeButton = styled(Button)(({ isRecipes }: { isRecipes?: boolean }) => [
  isRecipes && tw`bg-purple-50`,
  !isRecipes && tw`bg-link dark:bg-link-dark`,
])

export function Challenge({
  isRecipes,
  totalChallenges,
  currentChallenge,
  hasNextChallenge,
  handleClickNextChallenge,
}: ChallengeProps) {
  const [showHint, setShowHint] = React.useState(false)
  const [showSolution, setShowSolution] = React.useState(false)

  const toggleHint = () => {
    if (showSolution && !showHint) {
      setShowSolution(false)
    }
    setShowHint(hint => !hint)
  }

  const toggleSolution = () => {
    if (showHint && !showSolution) {
      setShowHint(false)
    }
    setShowSolution(solution => !solution)
  }

  const { t } = useTranslation()
  return (
    <div tw="p-5 sm:py-8 sm:px-8">
      <div>
        <h3 tw="dark:text-primary-dark mb-2 text-xl text-primary">
          <div tw="block font-bold md:inline">
            {isRecipes ? t('docs.example') : t('docs.challenge')} {currentChallenge.order} of{' '}
            {totalChallenges}
            <span tw="dark:text-primary-dark text-primary">: </span>
          </div>
          {currentChallenge.name}
        </h3>
        {currentChallenge.content}
      </div>
      <div tw="mt-4 flex items-center justify-between">
        {currentChallenge.hint ? (
          <div>
            <Button tw="mr-2" onClick={toggleHint} active={showHint}>
              <IconHint tw="mr-1.5" /> {showHint ? t('docs.hide-hint') : t('docs.show-hint')}
            </Button>
            <Button tw="mr-2" onClick={toggleSolution} active={showSolution}>
              <IconSolution tw="mr-1.5" />{' '}
              {showSolution ? t('docs.hide-solution') : t('docs.show-solution')}
            </Button>
          </div>
        ) : (
          !isRecipes && (
            <Button tw="mr-2" onClick={toggleSolution} active={showSolution}>
              <IconSolution tw="mr-1.5" />{' '}
              {showSolution ? t('docs.hide-solution') : t('docs.show-solution')}
            </Button>
          )
        )}

        {hasNextChallenge && (
          <StyledButton isRecipes={isRecipes} onClick={handleClickNextChallenge} active>
            {t('docs.next')} {isRecipes ? t('docs.example') : t('docs.challenge')}
            <IconArrowSmall displayDirection="right" tw="ml-1.5 block" />
          </StyledButton>
        )}
      </div>
      {showHint && currentChallenge.hint}

      {showSolution && (
        <div tw="mt-6">
          <h3 tw="dark:text-primary-dark text-2xl font-bold text-primary">Solution</h3>
          {currentChallenge.solution}
          <div tw="mt-4 flex items-center justify-between">
            <Button onClick={() => setShowSolution(false)}>Close solution</Button>
            {hasNextChallenge && (
              <StyledNextChallengeButton onClick={handleClickNextChallenge} active>
                {t('docs.next')} {t('docs.challenge')}
                <IconArrowSmall displayDirection="right" tw="ml-1.5 block" />
              </StyledNextChallengeButton>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
