import { Page } from 'components/layout/page'
import { MarkdownPage } from 'components/layout/markdown-page'
import { MDXComponents } from 'components/mdx/mdx-components'

const { Intro, MaxWidth, p: P, a: A } = MDXComponents

export default function NotFound() {
  return (
    <Page toc={[]}>
      <MarkdownPage toc={[]} meta={{ title: 'Not Found' }}>
        <MaxWidth>
          <Intro>
            <P>This page doesn’t exist.</P>
            <P>
              Quite possibly, it hasn’t been written yet. This beta is a{' '}
              <A href="/#how-much-content-is-ready">work in progress!</A>
            </P>
            <P>Please check back later.</P>
          </Intro>
        </MaxWidth>
      </MarkdownPage>
    </Page>
  )
}
