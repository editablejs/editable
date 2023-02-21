import * as React from 'react'
import { useRouteMeta } from 'components/layout/use-route-meta'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'

function Breadcrumbs() {
  const { breadcrumbs } = useRouteMeta()
  const { t } = useTranslation()
  if (!breadcrumbs) return null
  return (
    <div tw="flex">
      {breadcrumbs.map(
        (crumb, i) =>
          crumb.path && (
            <div tw="mb-3 mt-0.5 flex items-center" key={i}>
              <React.Fragment key={crumb.path}>
                <Link href={crumb.path}>
                  <a tw="text-link dark:text-link-dark mr-1 text-sm font-bold uppercase tracking-wide hover:underline">
                    {t(crumb.title)}
                  </a>
                </Link>
                <span tw="text-link dark:text-link-dark mr-1 inline-block text-lg">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M6.86612 13.6161C6.37796 14.1043 6.37796 14.8957 6.86612 15.3839C7.35427 15.872 8.14572 15.872 8.63388 15.3839L13.1339 10.8839C13.622 10.3957 13.622 9.60428 13.1339 9.11612L8.63388 4.61612C8.14572 4.12797 7.35427 4.12797 6.86612 4.61612C6.37796 5.10428 6.37796 5.89573 6.86612 6.38388L10.4822 10L6.86612 13.6161Z"
                      fill="currentColor"
                    />
                  </svg>
                </span>
              </React.Fragment>
            </div>
          ),
      )}
    </div>
  )
}

export default Breadcrumbs
