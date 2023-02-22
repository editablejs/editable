import { useTocHighlight } from './use-toc-highlight'
import type { Toc as TocMDX } from '../mdx/toc-context'
import tw from 'twin.macro'
import { useTranslation } from 'react-i18next'

export function Toc({ headings }: { headings: TocMDX }) {
  const { currentIndex } = useTocHighlight()
  const { t } = useTranslation()
  // TODO: We currently have a mismatch between the headings in the document
  // and the headings we find in MarkdownPage (i.e. we don't find Recap or Challenges).
  // Select the max TOC item we have here for now, but remove this after the fix.
  const selectedIndex = Math.min(currentIndex, headings.length - 1)
  return (
    <nav role="navigation" tw="sticky top-16 right-0 pt-[22px]">
      {headings.length > 0 && (
        <h2 tw="text-secondary dark:text-secondary-dark mb-3 w-full px-4 text-sm font-bold uppercase tracking-wide lg:mb-3">
          {t('docs.on-this-page')}
        </h2>
      )}
      <div tw="h-full max-h-[calc(100vh-7.5rem)] overflow-y-auto pl-4">
        <ul tw="space-y-2 pb-16">
          {headings.length > 0 &&
            headings.map((h, i) => {
              if (h.url == null) {
                // TODO: only log in DEV
                console.error('Heading does not have URL')
              }
              return (
                <li
                  key={`heading-${h.url}-${i}`}
                  css={[
                    tw`rounded-l-lg px-2 text-sm`,
                    selectedIndex === i && tw`bg-highlight dark:bg-highlight-dark`,
                    h?.depth === 3 && tw`pl-4`,
                    h.depth && h.depth > 3 && tw`hidden`,
                  ]}
                >
                  <a
                    css={[
                      tw`hover:text-link dark:hover:text-link-dark block py-2 leading-normal`,
                      selectedIndex === i && tw`text-link dark:text-link-dark font-bold`,
                      selectedIndex !== i && tw`text-secondary dark:text-secondary-dark`,
                    ]}
                    href={h.url}
                  >
                    {typeof h.text === 'string' ? t(h.text) : h.text}
                  </a>
                </li>
              )
            })}
        </ul>
      </div>
    </nav>
  )
}
