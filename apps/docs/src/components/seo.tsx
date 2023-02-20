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
    description = 'Editable is a rich text editor for React, built with a plugin architecture and extensible by design.',
    children,
  }: SeoProps & { router: Router }) => (
    <Head>
      {/* DEFAULT */}

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
) as React.FC<SeoProps>
