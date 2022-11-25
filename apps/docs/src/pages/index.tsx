import { EditableComposer, ContentEditable, createEditor } from '@editablejs/editor'
import {
  withPlugins,
  withInlineToolbar,
  withToolbar,
  useContextMenuEffect,
  useInlineToolbarEffect,
} from '@editablejs/plugins'
import { withHTMLSerializer, withTextSerializer } from '@editablejs/plugins/serializer'
import { withHTMLDeserializer } from '@editablejs/plugins/deserializer'
import React, { useLayoutEffect, useState } from 'react'
import tw, { styled } from 'twin.macro'
import { Toolbar } from '../components/toolbar'
import { createContextMenuItems } from '../configs/context-menu'
import { createToolbarConfig } from '../configs/toolbar'

const initialValue = [
  {
    type: 'paragraph',
    children: [
      {
        text: 'Hello, ',
      },
      {
        text: 'This',
        fontSize: '28px',
      },
      {
        text: ' is a Paragraph',
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
]

const StyledWrapper = styled.div`
  cursor: default;
  width: 600px;
  margin: 60px auto;
`

const StyledContainer = tw.div`mt-5`

export default function Docs() {
  const [editor] = useState(
    withInlineToolbar(
      withToolbar(
        withPlugins(createEditor(), {
          'font-size': { defaultSize: '14px' },
        }),
      ),
    ),
  )

  useLayoutEffect(() => {
    withHTMLSerializer(editor)
    withHTMLDeserializer(editor)
    withTextSerializer(editor)
  }, [editor])

  useContextMenuEffect(createContextMenuItems, editor)

  useInlineToolbarEffect(createToolbarConfig, editor)

  return (
    <StyledWrapper>
      <EditableComposer editor={editor} value={initialValue}>
        <Toolbar />
        <StyledContainer>
          <ContentEditable placeholder="Please enter content..." />
        </StyledContainer>
      </EditableComposer>
    </StyledWrapper>
  )
}
