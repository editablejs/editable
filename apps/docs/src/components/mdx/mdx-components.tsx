import { Children, useContext, useMemo } from 'react'
import * as React from 'react'

import CodeBlock from './code-block'
import { CodeDiagram } from './code-diagram'
import ConsoleBlock from './console-block'
import ExpandableCallout from './expandable-callout'
import ExpandableExample from './expandable-example'
import { H1, H2, H3, H4 } from './heading'
import HomepageHero from './homepage-hero'
import InlineCode from './inline-code'
import Intro from './intro'
import Link from './link'
import { PackageImport } from './package-import'
import Recap from './recap'
import Sandpack from './sandpack'
import Diagram from './diagram'
import DiagramGroup from './diagram-group'
import SimpleCallout from './simple-callout'
import TerminalBlock from './terminal-block'
import YouWillLearnCard from './you-will-learn-card'
import { Challenges, Hint, Solution } from './challenges'
import { IconNavArrow } from '../icon/nav-arrow'
import ButtonLink from 'components/button-link'
import { TocContext } from './toc-context'
import type { Toc, TocItem } from './toc-context'
import tw from 'twin.macro'

function CodeStep({ children, step }: { children: any; step: number }) {
  return (
    <span
      data-step={step}
      css={[
        tw`relative rounded border-b-2 border-opacity-60 bg-opacity-10 px-[6px] py-[1.5px] dark:bg-opacity-20`,
        step === 1 && tw`bg-blue-40 border-blue-40 text-blue-60 dark:text-blue-30`,
        step === 2 && tw`bg-yellow-40 border-yellow-40 text-yellow-60 dark:text-yellow-30`,
        step === 3 && tw`bg-purple-40 border-purple-40 text-purple-60 dark:text-purple-30`,
        step === 4 && tw`bg-green-40 border-green-40 text-green-60 dark:text-green-30`,
      ]}
      className="code-step"
    >
      {children}
    </span>
  )
}

const P = (p: JSX.IntrinsicElements['p']) => <p tw="my-4 whitespace-pre-wrap" {...p} />

const Strong = (strong: JSX.IntrinsicElements['strong']) => <strong tw="font-bold" {...strong} />

const OL = (p: JSX.IntrinsicElements['ol']) => <ol tw="my-3 ml-6 list-decimal" {...p} />
const LI = (p: JSX.IntrinsicElements['li']) => <li tw="mb-1 leading-relaxed" {...p} />
const UL = (p: JSX.IntrinsicElements['ul']) => <ul tw="my-3 ml-6 list-disc" {...p} />

const Divider = () => <hr tw="border-border dark:border-border-dark my-6 block border-b" />
const Wip = ({ children }: { children: React.ReactNode }) => (
  <ExpandableCallout type="wip">{children}</ExpandableCallout>
)
const Pitfall = ({ children }: { children: React.ReactNode }) => (
  <ExpandableCallout type="pitfall">{children}</ExpandableCallout>
)
const Deprecated = ({ children }: { children: React.ReactNode }) => (
  <ExpandableCallout type="deprecated">{children}</ExpandableCallout>
)
const Note = ({ children }: { children: React.ReactNode }) => (
  <ExpandableCallout type="note">{children}</ExpandableCallout>
)

const Blockquote = ({ children, ...props }: JSX.IntrinsicElements['blockquote']) => {
  return (
    <blockquote
      tw="bg-highlight dark:bg-highlight-dark relative my-8 flex rounded-lg bg-opacity-50 py-4 px-8 leading-6 shadow-inner"
      className="mdx-blockquote"
      {...props}
    >
      <span tw="relative block">{children}</span>
    </blockquote>
  )
}

function LearnMore({ children, path }: { title: string; path?: string; children: any }) {
  return (
    <>
      <section tw="bg-card dark:bg-card-dark mt-16 mb-16 flex flex-row items-center justify-between rounded-lg p-8 shadow-inner">
        <div tw="flex-col">
          <h2 tw="dark:text-primary-dark text-2xl font-bold leading-tight text-primary">
            Ready to learn this topic?
          </h2>
          {children}
          {path ? (
            <ButtonLink tw="mt-1" label="Read More" href={path} type="primary">
              Read More
              <IconNavArrow displayDirection="right" tw="ml-1 inline" />
            </ButtonLink>
          ) : null}
        </div>
      </section>
      <hr tw="border-border dark:border-border-dark mb-14" />
    </>
  )
}

function Math({ children }: { children: any }) {
  return (
    <span
      style={{
        fontFamily: 'STIXGeneral-Regular, Georgia, serif',
        fontSize: '1.2rem',
      }}
    >
      {children}
    </span>
  )
}

function MathI({ children }: { children: any }) {
  return (
    <span
      style={{
        fontFamily: 'STIXGeneral-Italic, Georgia, serif',
        fontSize: '1.2rem',
      }}
    >
      {children}
    </span>
  )
}

function YouWillLearn({ children, isChapter }: { children: any; isChapter?: boolean }) {
  let title = isChapter ? 'In this chapter' : 'You will learn'
  return <SimpleCallout title={title}>{children}</SimpleCallout>
}

// TODO: typing.
function Recipes(props: any) {
  return <Challenges {...props} isRecipes={true} />
}

function AuthorCredit({
  author = 'Rachel Lee Nabors',
  authorLink = 'http://rachelnabors.com/',
}: {
  author: string
  authorLink: string
}) {
  return (
    <div tw="sr-only hover:sr-only group-focus-within:not-sr-only group-hover:not-sr-only">
      <p tw="bg-card dark:bg-card-dark text-secondary dark:text-secondary-dark dark:text-secondary-dark after:border-t-card after:dark:border-t-card-dark absolute left-1/2 top-0 -translate-x-1/2 -translate-y-full rounded-lg p-2 text-center text-sm leading-tight opacity-0 transition-opacity duration-300 after:absolute after:left-1/2 after:top-[95%] after:-translate-x-1/2 after:border-8 after:border-x-transparent after:border-b-transparent after:content-[''] group-hover:flex group-hover:opacity-100">
        <cite>
          Illustrated by{' '}
          {authorLink ? (
            <a
              target="_blank"
              rel="noreferrer"
              tw="text-link dark:text-link-dark"
              href={authorLink}
            >
              {author}
            </a>
          ) : (
            author
          )}
        </cite>
      </p>
    </div>
  )
}

const IllustrationContext = React.createContext<{
  isInBlock?: boolean
}>({
  isInBlock: false,
})

function Illustration({
  caption,
  src,
  alt,
  author,
  authorLink,
}: {
  caption: string
  src: string
  alt: string
  author: string
  authorLink: string
}) {
  const { isInBlock } = React.useContext(IllustrationContext)

  return (
    <div
      tw=" relative my-16 mx-0 max-w-4xl before:absolute before:-inset-y-16 before:inset-x-0 2xl:mx-auto 2xl:max-w-6xl"
      className="group"
    >
      <figure tw="my-8 flex justify-center">
        <img src={src} alt={alt} style={{ maxHeight: 300 }} tw="rounded-lg bg-white" />
        {caption ? <figcaption tw="mt-4 text-center leading-tight">{caption}</figcaption> : null}
      </figure>
      {!isInBlock && <AuthorCredit author={author} authorLink={authorLink} />}
    </div>
  )
}

const isInBlockTrue = { isInBlock: true }

function IllustrationBlock({
  sequential,
  author,
  authorLink,
  children,
}: {
  author: string
  authorLink: string
  sequential: boolean
  children: any
}) {
  const imageInfos = Children.toArray(children).map((child: any) => child.props)
  const images = imageInfos.map((info, index) => (
    <figure key={index}>
      <div tw="my-4 flex flex-1 items-center justify-center rounded-lg bg-white p-4 xl:p-6">
        <img src={info.src} alt={info.alt} height={info.height} />
      </div>
      {info.caption ? (
        <figcaption tw="text-secondary dark:text-secondary-dark mt-4 text-center leading-tight">
          {info.caption}
        </figcaption>
      ) : null}
    </figure>
  ))
  return (
    <IllustrationContext.Provider value={isInBlockTrue}>
      <div
        tw="relative my-16 mx-0 max-w-4xl before:absolute before:-inset-y-16 before:inset-x-0 2xl:mx-auto 2xl:max-w-6xl"
        className="group"
      >
        {sequential ? (
          <ol tw="flex" className="mdx-illustration-block">
            {images.map((x: any, i: number) => (
              <li tw="flex-1" key={i}>
                {x}
              </li>
            ))}
          </ol>
        ) : (
          <div className="mdx-illustration-block">{images}</div>
        )}
        <AuthorCredit author={author} authorLink={authorLink} />
      </div>
    </IllustrationContext.Provider>
  )
}

type NestedTocRoot = {
  item: null
  children: Array<NestedTocNode>
}

type NestedTocNode = {
  item: TocItem
  children: Array<NestedTocNode>
}

function calculateNestedToc(toc: Toc): NestedTocRoot {
  const currentAncestors = new Map<number, NestedTocNode | NestedTocRoot>()
  const root: NestedTocRoot = {
    item: null,
    children: [],
  }
  const startIndex = 1 // Skip "Overview"
  for (let i = startIndex; i < toc.length; i++) {
    const item = toc[i]
    const currentParent: NestedTocNode | NestedTocRoot =
      currentAncestors.get(item.depth - 1) || root
    const node: NestedTocNode = {
      item,
      children: [],
    }
    currentParent.children.push(node)
    currentAncestors.set(item.depth, node)
  }
  return root
}

function InlineToc() {
  const toc = useContext(TocContext)
  const root = useMemo(() => calculateNestedToc(toc), [toc])
  return <InlineTocItem items={root.children} />
}

function InlineTocItem({ items }: { items: Array<NestedTocNode> }) {
  return (
    <UL>
      {items.map(node => (
        <LI key={node.item.url}>
          <Link href={node.item.url}>{node.item.text}</Link>
          {node.children.length > 0 && <InlineTocItem items={node.children} />}
        </LI>
      ))}
    </UL>
  )
}

function LinkWithTodo({ href, children, ...props }: JSX.IntrinsicElements['a']) {
  if (href?.startsWith('TODO')) {
    return children
  }

  return (
    <Link href={href} {...props}>
      {children}
    </Link>
  )
}

export const MDXComponents = {
  p: P,
  strong: Strong,
  blockquote: Blockquote,
  ol: OL,
  ul: UL,
  li: LI,
  h1: H1,
  h2: H2,
  h3: H3,
  h4: H4,
  hr: Divider,
  a: LinkWithTodo,
  code: InlineCode,
  pre: CodeBlock,
  CodeDiagram,
  ConsoleBlock,
  DeepDive: (props: { children: React.ReactNode; title: string; excerpt: string }) => (
    <ExpandableExample {...props} type="DeepDive" />
  ),
  Diagram,
  DiagramGroup,
  FullWidth({ children }: { children: any }) {
    return children
  },
  MaxWidth({ children }: { children: any }) {
    return <div tw="ml-0 max-w-4xl 2xl:mx-auto">{children}</div>
  },
  Pitfall,
  Deprecated,
  Wip,
  HomepageHero,
  Illustration,
  IllustrationBlock,
  Intro,
  InlineToc,
  LearnMore,
  Math,
  MathI,
  Note,
  PackageImport,
  Recap,
  Recipes,
  Sandpack,
  TerminalBlock,
  YouWillLearn,
  YouWillLearnCard,
  Challenges,
  Hint,
  Solution,
  CodeStep,
}

for (let key in MDXComponents) {
  if (MDXComponents.hasOwnProperty(key)) {
    const MDXComponent: any = (MDXComponents as any)[key]
    MDXComponent.mdxName = key
  }
}
