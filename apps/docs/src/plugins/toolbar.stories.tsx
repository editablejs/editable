import { ComponentStory, ComponentMeta } from '@storybook/react';
import {
  BlockquoteEditor,
  FontSizeEditor,
  Icon,
  Toolbar,
  withPlugins,
} from '@editablejs/editable-plugins';
import { createEditor, EditableComposer } from '@editablejs/editable-editor';
import { defaultToolbarConfig } from './primary.config';

const editor = withPlugins(createEditor(), {
  fontSize: { defaultSize: '14px' },
});

export default {
  component: Toolbar,
  title: 'Toolbar',
  decorators: [
    (Story) => (
      <EditableComposer editor={editor} value={[]}>
        <Story />
      </EditableComposer>
    ),
  ],
} as ComponentMeta<typeof Toolbar>;

const Template: ComponentStory<typeof Toolbar> = (args) => (
  <Toolbar {...args} />
);

export const primary = Template.bind({});
primary.args = {
  items: defaultToolbarConfig,
};
primary.storyName = 'Default';

export const custom = Template.bind({});
custom.args = {
  items: [
    [
      {
        type: 'dropdown',
        items: [
          {
            key: '12px',
            content: '12px',
          },
          {
            key: '16px',
            content: '16px',
          },
          {
            key: '20px',
            content: '20px',
          },
          {
            key: '22px',
            content: '22px',
          },
          {
            key: '24px',
            content: '24px',
          },
          {
            key: '28px',
            content: '28px',
          },
        ],
        onActive: (editor) => {
          return FontSizeEditor.queryActive(editor) || '';
        },
        onToggle: (editor, { key }) => {
          if (FontSizeEditor.isFontSizeEditor(editor))
            FontSizeEditor.toggle(editor, key);
        },
      },
      {
        type: 'button',
        onActive: (editor) => {
          return BlockquoteEditor.isActive(editor);
        },
        onToggle: (editor) => {
          if (BlockquoteEditor.isBlockquoteEditor(editor))
            BlockquoteEditor.toggle(editor);
        },
        children: <Icon name="blockquote" />,
      },
    ],
  ],
};
custom.storyName = 'With plugins';
