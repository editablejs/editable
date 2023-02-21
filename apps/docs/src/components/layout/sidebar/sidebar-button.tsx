import * as React from 'react'
import { IconNavArrow } from 'components/icon/nav-arrow'
import tw from 'twin.macro'
import { useTranslation } from 'react-i18next'

interface SidebarButtonProps {
  title: string
  heading: boolean
  level: number
  onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
  isExpanded?: boolean
  isBreadcrumb?: boolean
}

export function SidebarButton({
  title,
  heading,
  level,
  onClick,
  isExpanded,
  isBreadcrumb,
}: SidebarButtonProps) {
  const { t } = useTranslation()
  return (
    <div css={[(heading || level === 1) && tw`my-1`, level > 1 && tw`my-3`]}>
      <button
        css={[
          tw`hover:bg-gray-5 dark:hover:bg-gray-80 relative flex w-full items-center justify-between rounded-r-lg p-2 pr-2 pl-5 text-left`,
          level > 1 && tw`p-2 text-base`,
          !heading &&
            isBreadcrumb &&
            !isExpanded &&
            tw`text-link bg-highlight dark:bg-highlight-dark hover:bg-highlight dark:hover:bg-highlight-dark hover:text-link dark:hover:text-link-dark text-base font-bold`,
          heading && tw`my-6 p-4 text-2xl font-bold lg:my-auto lg:text-sm`,
          !heading &&
            !isBreadcrumb &&
            tw`hover:text-gray-70 dark:text-primary-dark p-2 text-base font-bold text-primary`,
          heading && !isBreadcrumb && tw`dark:text-primary-dark text-primary`,
          !heading &&
            isExpanded &&
            tw`dark:text-primary-dark bg-card dark:bg-card-dark text-base font-bold text-primary`,
        ]}
        onClick={onClick}
      >
        {t(title)}
        {typeof isExpanded && !heading && (
          <span tw="text-gray-30 pr-2">
            <IconNavArrow displayDirection={isExpanded ? 'down' : 'right'} />
          </span>
        )}
      </button>
    </div>
  )
}
