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
} from '@editablejs/editable'
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
        {
          type: 'paragraph',
          children: [
            {
              text: 'A line of text in a paragraph.',
            },
          ],
        },
      ],
    })
    // let i = 0
    // const interval = setInterval(() => {
    //   Editor.insertText(editor, i.toString())
    //   i++
    // }, 3000)

    return () => {
      // clearInterval(interval)
      unmount()
    }
  }, [editor])

  const handleInsertNode = () => {
    Transforms.insertNodes(editor, { text: '[0, 1]' }, {
      at: [0, 1]
    })
    Transforms.insertNodes(editor, {
      type: 'paragraph',
      children: [{ text: 'New Paragraph[1]' }],
    }, {
      at: [1]
    })
    Transforms.insertNodes(editor, {
      type: 'paragraph',
      children: [],
    }, {
      at: [2]
    })
    Transforms.insertNodes(editor, { text: '[2, 0]' }, {
      at: [2, 0]
    })
  }

  const handleDeleteNode = () => {
    Transforms.removeNodes(editor, {
      at: [0]
    })
  }

  const handleMoveNode = () => {
    Transforms.moveNodes(editor, {
      at: [0],
      to: [1]
    })
  }

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
        <div>
          <p tw="text-gray-20">用户测试逻辑</p>
          <div tw="flex gap-4">
            <button onClick={handleInsertNode}>
              插入节点
            </button>
            <button onClick={handleDeleteNode}>
              删除节点
            </button>
            <button onClick={handleMoveNode}>
              移动节点
            </button>
          </div>
        </div>
        </StyledHeader>
        <StyledContainer>
        <div
          ref={continaerRef}
            lang={local ?? 'en-US'}
          />
        </StyledContainer>
    </>
  )
}
