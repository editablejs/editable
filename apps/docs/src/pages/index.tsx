import { EditableComposer, ContentEditable, createEditor } from '@editablejs/editor'
import { Toolbar, withPlugins } from '@editablejs/plugins'
import React, { useState } from 'react'
import tw, { styled } from 'twin.macro'
import { defaultToolbarConfig } from '../toolbar-config'

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
    withPlugins(createEditor(), {
      'font-size': { defaultSize: '14px' },
    }),
  )

  return (
    <StyledWrapper>
      <EditableComposer editor={editor} value={initialValue}>
        <Toolbar items={defaultToolbarConfig} />
        <StyledContainer>
          <ContentEditable placeholder="Please enter content..." />
        </StyledContainer>
      </EditableComposer>
    </StyledWrapper>
  )
}
