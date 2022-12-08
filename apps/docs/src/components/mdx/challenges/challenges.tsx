import * as React from 'react'
import { H2 } from 'components/mdx/heading'
import { H4 } from 'components/mdx/heading'
import { Challenge } from './challenge'
import { Navigation } from './navigation'
import tw, { styled } from 'twin.macro'

interface ChallengesProps {
  children: React.ReactElement[]
  isRecipes?: boolean
  titleText?: string
  titleId?: string
}

export interface ChallengeContents {
  id: string
  name: string
  order: number
  content: React.ReactNode
  solution: React.ReactNode
  hint?: React.ReactNode
}

const parseChallengeContents = (children: React.ReactElement[]): ChallengeContents[] => {
  const contents: ChallengeContents[] = []

  if (!children) {
    return contents
  }

  let challenge: Partial<ChallengeContents> = {}
  let content: React.ReactElement[] = []
  React.Children.forEach(children, child => {
    const { props, type } = child
    switch ((type as any).mdxName) {
      case 'Solution': {
        challenge.solution = child
        challenge.content = content
        contents.push(challenge as ChallengeContents)
        challenge = {}
        content = []
        break
      }
      case 'Hint': {
        challenge.hint = child
        break
      }
      case 'h4': {
        challenge.order = contents.length + 1
        challenge.name = props.children
        challenge.id = props.id
        break
      }
      default: {
        content.push(child)
      }
    }
  })

  return contents
}

const headingStyle = (isRecipes?: boolean) => [
  tw`relative mb-2 leading-10`,
  isRecipes && tw`dark:text-purple-30 text-xl text-purple-50`,
  !isRecipes && tw`text-link text-3xl`,
]

const StyledHeading2 = styled(H2)(({ isRecipes }: { isRecipes?: boolean }) =>
  headingStyle(isRecipes),
)

const StyledHeading4 = styled(H4)(({ isRecipes }: { isRecipes?: boolean }) =>
  headingStyle(isRecipes),
)

export function Challenges({
  children,
  isRecipes,
  titleText = isRecipes ? 'Try out some examples' : 'Try out some challenges',
  titleId = isRecipes ? 'examples' : 'challenges',
}: ChallengesProps) {
  const challenges = parseChallengeContents(children)
  const totalChallenges = challenges.length
  const scrollAnchorRef = React.useRef<HTMLDivElement>(null)
  const queuedScrollRef = React.useRef<boolean>(false)
  const [activeIndex, setActiveIndex] = React.useState(0)
  const currentChallenge = challenges[activeIndex]

  React.useEffect(() => {
    if (queuedScrollRef.current === true) {
      queuedScrollRef.current = false
      scrollAnchorRef.current!.scrollIntoView({
        block: 'start',
        behavior: 'smooth',
      })
    }
  })

  const handleChallengeChange = (index: number) => {
    setActiveIndex(index)
  }

  const Heading = isRecipes ? StyledHeading4 : StyledHeading2
  return (
    <div tw="mx-auto max-w-7xl py-4">
      <div tw="border-gray-10 bg-card dark:bg-card-dark -mx-5 rounded-none shadow-inner sm:mx-auto sm:rounded-lg">
        <div ref={scrollAnchorRef} tw="py-2 px-5 pb-0 sm:px-8 md:pb-0">
          <Heading id={titleId} isRecipes={isRecipes}>
            {titleText}
          </Heading>
          {totalChallenges > 1 && (
            <Navigation
              currentChallenge={currentChallenge}
              challenges={challenges}
              handleChange={handleChallengeChange}
              isRecipes={isRecipes}
            />
          )}
        </div>
        <Challenge
          key={currentChallenge.id}
          isRecipes={isRecipes}
          currentChallenge={currentChallenge}
          totalChallenges={totalChallenges}
          hasNextChallenge={activeIndex < totalChallenges - 1}
          handleClickNextChallenge={() => {
            setActiveIndex(i => i + 1)
            queuedScrollRef.current = true
          }}
        />
      </div>
    </div>
  )
}
