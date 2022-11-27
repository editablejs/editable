import {
  EditableComposer,
  ContentEditable,
  createEditor,
  useIsomorphicLayoutEffect,
} from '@editablejs/editor'
import {
  withPlugins,
  withSideToolbar,
  withInlineToolbar,
  withToolbar,
  useContextMenuEffect,
  useInlineToolbarEffect,
  ContextMenuStore,
  ToolbarStore,
} from '@editablejs/plugins'
import { withHTMLSerializer, withTextSerializer } from '@editablejs/plugins/serializer'
import { withHTMLDeserializer } from '@editablejs/plugins/deserializer'
import React, { useState } from 'react'
import tw, { styled } from 'twin.macro'
import { Toolbar } from '../components/toolbar'
import { createContextMenuItems } from '../configs/context-menu-items'
import { createToolbarItems } from '../configs/toolbar-items'

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
    withSideToolbar(
      withInlineToolbar(
        withToolbar(
          withPlugins(createEditor(), {
            'font-size': { defaultSize: '14px' },
          }),
        ),
      ),
    ),
  )

  useIsomorphicLayoutEffect(() => {
    withHTMLSerializer(editor)
    withHTMLDeserializer(editor)
    withTextSerializer(editor)
  }, [editor])

  useContextMenuEffect(() => {
    ContextMenuStore.setItems(editor, createContextMenuItems(editor))
  }, editor)

  useInlineToolbarEffect(() => {
    ToolbarStore.setInlineItems(editor, createToolbarItems(editor))
  }, editor)

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
