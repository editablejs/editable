import {
  ContentEditable,
  createEditor,
  Descendant,
  EditableComposer,
} from '@editablejs/editable-editor';
import { withPlugins } from '@editablejs/editable-plugins';
import { ComponentMeta, ComponentStory } from '@storybook/react';

const editor = withPlugins(createEditor(), {
  fontSize: { defaultSize: '14px' },
});

export default {
  component: EditableComposer,
  title: 'EditableComposer',
  args: {
    editor,
  },
} as ComponentMeta<typeof EditableComposer>;

const Template: ComponentStory<typeof EditableComposer> = (args) => (
  <EditableComposer {...args}>
    <div className={'container'}>
      <ContentEditable placeholder="Please enter content..." />
    </div>
  </EditableComposer>
);

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
        text: '拉萨扩大解放是的方式来的过节费打过来快递费建国饭店给对方dlsfjsdlfjsdlfjsdlfjsdlfjsdlfsdjlfdslkfsdlf',
      },
    ],
  },
];

export const primary = Template.bind({});
primary.args = {
  value: initialValue,
};
primary.storyName = 'Default';

export const primary2 = Template.bind({});
primary2.args = {
  value: [
    {
      text: 'hello world!',
    },
  ] as Descendant[],
};
primary2.storyName = 'Hello World';
