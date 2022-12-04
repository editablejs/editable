import tw from 'twin.macro'
import { RouteTag } from './layout/use-route-meta'

const variantMap = {
  foundation: {
    name: 'Foundation',
    classes: tw`bg-yellow-50 text-white`,
  },
  intermediate: {
    name: 'Intermediate',
    classes: tw`bg-purple-40 text-white`,
  },
  advanced: {
    name: 'Advanced',
    classes: tw`bg-green-40 text-white`,
  },
  experimental: {
    name: 'Experimental',
    classes: tw`bg-orange-50 text-white`,
  },
  deprecated: {
    name: 'Deprecated',
    classes: tw`bg-red-40 text-white`,
  },
}

interface TagProps {
  variant: RouteTag
  text?: string
  className?: string
}

function Tag({ text, variant, className }: TagProps) {
  const { name, classes } = variantMap[variant]
  return (
    <span tw="mr-2" className={className}>
      <span css={[classes, tw`inline rounded py-1 px-2 text-sm font-bold uppercase`]}>
        {text || name}
      </span>
    </span>
  )
}

export default Tag
