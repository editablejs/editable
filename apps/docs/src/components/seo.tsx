import * as React from 'react'
import Head from 'next/head'
import { withRouter, Router } from 'next/router'

export interface SeoProps {
  title: string
  description?: string
  image?: string
  // jsonld?: JsonLDType | Array<JsonLDType>;
  children?: React.ReactNode
}

export const Seo = withRouter(
  ({
    title,
    description = 'A JavaScript library for building user interfaces',
    image = '/logo-og.png',
    router,
    children,
  }: SeoProps & { router: Router }) => (
    <Head>
      {/* DEFAULT */}

      <meta name="viewport" content="width=device-width, initial-scale=1" />

      {title != null && <title key="title">{title}</title>}
      {description != null && <meta name="description" key="description" content={description} />}
      {/* OPEN GRAPH */}
      <meta property="og:type" key="og:type" content="website" />
      {title != null && <meta property="og:title" content={title} key="og:title" />}
      {description != null && (
        <meta property="og:description" key="og:description" content={description} />
      )}

      {children}
    </Head>
  ),
)
