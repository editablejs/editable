import * as React from 'react'
import NextLink from 'next/link'
import ButtonLink from 'components/button-link'
import { ExternalLink } from 'components/external-link'
import { IconGitHub } from 'components/icon/github'
import { IconNavArrow } from 'components/icon/nav-arrow'
import tw from 'twin.macro'

export function Footer() {
  const socialLinkClasses = 'hover:text-primary dark:text-primary-dark'
  return (
    <>
      <div tw="w-full self-stretch">
        <div tw="mx-auto w-full px-5 pt-10 sm:px-12 md:px-12 md:pt-12 lg:pt-10">
          <hr tw="border-border dark:border-border-dark mx-auto max-w-7xl" />
          <div tw="m-4 flex flex-col items-center p-4">
            <p tw="dark:text-primary-dark mb-4 text-lg font-bold text-primary">
              How do you like these docs?
            </p>
            <div>
              <ButtonLink
                href="https://www.surveymonkey.co.uk"
                tw="mt-1"
                type="primary"
                size="md"
                target="_blank"
              >
                Take our survey!
                <IconNavArrow displayDirection="right" tw="ml-1 inline" />
              </ButtonLink>
            </div>
          </div>
          <hr tw="border-border dark:border-border-dark mx-auto max-w-7xl" />
        </div>
        <footer tw="text-secondary dark:text-secondary-dark py-12 px-5 sm:px-12 sm:py-12 md:px-12 md:py-16 lg:py-14">
          <div tw="mx-auto grid max-w-7xl grid-cols-2 gap-x-12 gap-y-8 sm:grid-cols-3 xl:grid-cols-5 ">
            <ExternalLink
              href="https://github.com/editablejs"
              tw="col-span-2 w-44 justify-items-start text-left sm:col-span-1"
            >
              <div>Editable JS</div>
              <div>Open Source</div>
              <div tw="mt-2 pr-0.5 text-left text-xs">&copy;{new Date().getFullYear()}</div>
            </ExternalLink>
            <div tw="flex flex-col">
              <FooterLink href="/learn" isHeader={true}>
                Learn Editable
              </FooterLink>
              <FooterLink href="/learn/">Quick Start</FooterLink>
              <FooterLink href="/learn/installation">Installation</FooterLink>
            </div>
            <div tw="flex flex-col">
              <FooterLink href="/apis/editor" isHeader={true}>
                API Reference
              </FooterLink>
              <FooterLink href="/apis/editor">Editor APIs</FooterLink>
              <FooterLink href="/apis/plugins">Plugin APIs</FooterLink>
            </div>
            <div tw="flex flex-col sm:col-start-2 xl:col-start-4">
              <FooterLink href="/" isHeader={true}>
                Community
              </FooterLink>
              <FooterLink href="">Code of Conduct</FooterLink>
              <FooterLink href="">Blog</FooterLink>
            </div>
            <div tw="flex flex-col">
              <FooterLink isHeader={true}>More</FooterLink>
              <FooterLink href="">Privacy</FooterLink>
              <FooterLink href="">Terms</FooterLink>
              <div tw="mt-8 flex flex-row gap-x-2">
                <ExternalLink
                  aria-label="Editable on Github"
                  href="https://github.com/editablejs/editable"
                  className={socialLinkClasses}
                >
                  <IconGitHub />
                </ExternalLink>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}

function FooterLink({
  href,
  children,
  isHeader = false,
}: {
  href?: string
  children: React.ReactNode
  isHeader?: boolean
}) {
  const classes = [
    tw`border-b inline-block border-transparent`,
    !isHeader && tw`text-sm text-primary dark:text-primary-dark`,
    isHeader && tw`text-base text-secondary dark:text-secondary-dark my-2 font-bold`,
    href && tw`hover:border-gray-10`,
  ]

  if (!href) {
    return <div css={classes}>{children}</div>
  }

  if (href.startsWith('https://')) {
    return (
      <div>
        <ExternalLink href={href} css={classes}>
          {children}
        </ExternalLink>
      </div>
    )
  }

  return (
    <div>
      <NextLink href={href}>
        <a css={classes}>{children}</a>
      </NextLink>
    </div>
  )
}
