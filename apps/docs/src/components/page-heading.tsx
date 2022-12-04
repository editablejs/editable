import Breadcrumbs from 'components/breadcrumbs'
import Tag from 'components/tag'
import { RouteTag } from './layout/use-route-meta'
import { H1 } from './mdx/heading'

interface PageHeadingProps {
  title: string
  status?: string
  description?: string
  tags?: RouteTag[]
}

function PageHeading({ title, status, description, tags = [] }: PageHeadingProps) {
  return (
    <div tw="px-5 sm:px-12 pt-8 sm:pt-7 lg:pt-5">
      <div tw="max-w-4xl ml-0 2xl:mx-auto">
        {tags ? <Breadcrumbs /> : null}
        <H1 tw="dark:text-primary-dark -mx-0.5 mt-0 break-words text-primary">
          {title}
          {status ? <em>—{status}</em> : ''}
        </H1>
        {description && (
          <p tw="dark:text-primary-dark text-gray-90 leading-large mt-4 mb-6 text-xl text-primary">
            {description}
          </p>
        )}
        {tags?.length > 0 && (
          <div tw="mt-4">
            {tags.map(tag => (
              <Tag key={tag} variant={tag as RouteTag} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default PageHeading
