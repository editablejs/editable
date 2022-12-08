import * as React from 'react'
import { IconNote } from '../icon/note'
import { IconWarning } from '../icon/warning'
import { IconPitfall } from '../icon/pitfall'
import tw, { styled } from 'twin.macro'

type CalloutVariants = 'deprecated' | 'pitfall' | 'note' | 'wip'

interface ExpandableCalloutProps {
  children: React.ReactNode
  type: CalloutVariants
}

const styledIcon = tw`inline mr-3 mb-1 text-lg`

const variantMap = {
  deprecated: {
    title: 'Deprecated',
    Icon: styled(IconWarning)(() => [styledIcon, tw`text-red-50 dark:text-red-40`]),
    containerClasses: tw`bg-red-5 dark:bg-red-60 dark:bg-opacity-20`,
    textColor: tw`text-red-50 dark:text-red-40`,
  },
  note: {
    title: 'Note',
    Icon: styled(IconNote)(() => [styledIcon, tw`text-green-60 dark:text-green-40`]),
    containerClasses: tw`bg-green-5 dark:bg-green-60 dark:bg-opacity-20 text-primary dark:text-primary-dark text-lg`,
    textColor: tw`text-green-60 dark:text-green-40`,
  },
  pitfall: {
    title: 'Pitfall',
    Icon: styled(IconPitfall)(() => [styledIcon, tw`text-yellow-50 dark:text-yellow-40`]),
    containerClasses: tw`bg-yellow-5 dark:bg-yellow-60 dark:bg-opacity-20`,
    textColor: tw`text-yellow-50 dark:text-yellow-40`,
  },
  wip: {
    title: 'Under Construction',
    Icon: styled(IconNote)(() => [styledIcon, tw`text-yellow-50 dark:text-yellow-40`]),
    containerClasses: tw`bg-yellow-5 dark:bg-yellow-60 dark:bg-opacity-20`,
    textColor: tw`text-yellow-50 dark:text-yellow-40`,
  },
}

function ExpandableCallout({ children, type }: ExpandableCalloutProps) {
  const contentRef = React.useRef<HTMLDivElement>(null)
  const variant = variantMap[type]
  const { Icon } = variant
  return (
    <div
      css={[
        tw`relative my-8 -mx-5 rounded-none px-5 pt-8 pb-4 shadow-inner sm:mx-auto sm:rounded-lg sm:px-8`,
        variant.containerClasses,
      ]}
      className="expandable-callout"
    >
      <h3 css={[tw`mb-2 text-2xl font-bold`, variant.textColor]}>
        <Icon />
        {JSON.stringify(variant)}
        {variant.title}
      </h3>
      <div tw="relative">
        <div ref={contentRef} tw="py-2">
          {children}
        </div>
      </div>
    </div>
  )
}

ExpandableCallout.defaultProps = {
  type: 'note',
}

export default ExpandableCallout
