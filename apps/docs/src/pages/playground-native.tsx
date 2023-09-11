import * as React from 'react'
import NextLink from 'next/link'
import { Seo } from 'components/seo'
import { createGlobalStyle } from 'styled-components'
import { ExternalLink } from 'components/external-link'
import { IconGitHub } from 'components/icon/github'
import Image from 'next/image'
import { IconLogo } from 'components/icon/logo'
import tw, { css, styled } from 'twin.macro'
import {
  Placeholder,
  isTouchDevice,
  Editable,
  withEditable,
  parseDataTransfer,
} from '@editablejs/editor-native'
import { Editor, createEditor, Range, Transforms } from '@editablejs/models'

import { initialValue } from 'configs/initial-value'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'
import { withHistory } from '@editablejs/plugin-history'

const CustomStyles = createGlobalStyle({
  body: {
    ...tw`bg-gray-100`,
  },
})

const StyledHeader = tw.div`bg-white text-base`

const StyledContainer = styled.div`
  ${tw`mt-2 md:mt-5 min-h-[80vh] bg-white shadow w-full md:w-[800px] m-auto px-4 py-4 md:px-10 md:py-16 text-sm`}
  line-height: 1.7;
`

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      YJS_SERVER: string
    }
  }
}

export default function PlaygroundNative() {
  const router = useRouter()
  const local = router.locale
  const { t } = useTranslation()
  const continaerRef = React.useRef<HTMLDivElement>(null)

  const editor = React.useMemo(() => {
    let editor = withEditable(createEditor())

    return editor
  }, [])

  React.useEffect(() => {
    if (!continaerRef.current) return
    const unmount = Editable.mount(editor, continaerRef.current, {
      initialValue: [
        {
          type: 'paragraph',
          children: [
            {
              text: 'Hello World',
            },
          ],
        },
      ],
    })
    let i = 0
    setInterval(() => {
      Editor.insertText(editor, i.toString())
      i++
    }, 3000)

    return () => {
      unmount()
    }
  }, [editor])

  return (
    <>
      <CustomStyles />
      <Seo title={t('playground.title')} />
      <StyledHeader>
        <div tw="flex justify-between py-3 px-6 text-base">
          <div tw="flex text-2xl text-link flex-1 gap-3">
            <NextLink href="/">
              <a>
                <IconLogo />
              </a>
            </NextLink>
            <ExternalLink
              aria-label="Editable on Github"
              href="https://github.com/editablejs/editable/blob/main/apps/docs/src/pages/playground.tsx"
            >
              <IconGitHub />
            </ExternalLink>
          </div>
        </div>
      </StyledHeader>
      <StyledContainer>
        <div ref={continaerRef} lang={local ?? 'en-US'} />
      </StyledContainer>
    </>
  )
}
