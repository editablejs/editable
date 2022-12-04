import {
  EditableProvider,
  ContentEditable,
  createEditor,
  useIsomorphicLayoutEffect,
  Placeholder,
  Editor,
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
  useSideToolbarMenuEffect,
} from '@editablejs/plugins'
import { withHTMLSerializer, withTextSerializer } from '@editablejs/plugins/serializer'
import { withHTMLDeserializer } from '@editablejs/plugins/deserializer'
import React, { useMemo } from 'react'
import tw, { styled } from 'twin.macro'
import { Toolbar } from '../components/toolbar'
import { createContextMenuItems } from '../configs/context-menu-items'
import { createToolbarItems } from '../configs/toolbar-items'
import { createSideToolbarItems } from '../configs/side-toolbar-items'

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
  const editor = useMemo(() => {
    const editor = withSideToolbar(
      withInlineToolbar(
        withToolbar(
          withPlugins(createEditor(), {
            fontSize: { defaultSize: '14px' },
          }),
        ),
      ),
    )
    Placeholder.add(editor, {
      check: entry => {
        return Editor.isBlock(editor, entry[0])
      },
      render: () => {
        return 'Enter some text...'
      },
    })
    return editor
  }, [])

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

  useSideToolbarMenuEffect((...a) => {
    ToolbarStore.setSideMenuItems(editor, createSideToolbarItems(editor, ...a))
  }, editor)

  return (
    <StyledWrapper>
      <EditableProvider editor={editor} defaultValue={initialValue}>
        <Toolbar />
        <StyledContainer>
          <ContentEditable placeholder="Please enter content..." />
        </StyledContainer>
      </EditableProvider>
    </StyledWrapper>
  )
}
