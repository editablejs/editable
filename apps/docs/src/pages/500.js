import { Page } from 'components/layout/page'
import { MarkdownPage } from 'components/layout/markdown-page'
import { MDXComponents } from 'components/mdx/mdx-components'

const { Intro, MaxWidth, p: P, a: A } = MDXComponents

export default function NotFound() {
  return (
    <Page toc={[]}>
      <MarkdownPage toc={[]} meta={{ title: 'Something Went Wrong' }}>
        <MaxWidth>
          <Intro>
            <P>Something went very wrong.</P>
            <P>Sorry about that.</P>
            <P>
              If you’d like, please{' '}
              <A href="https://github.com/editablejs/editable/issues/new">report a bug.</A>
            </P>
          </Intro>
        </MaxWidth>
      </MarkdownPage>
    </Page>
  )
}
