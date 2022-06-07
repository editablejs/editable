import { OP_DELETE_NODE, OP_DELETE_TEXT, OP_INSERT_NODE, OP_INSERT_TEXT } from '@editablejs/constants'
import diff from '../diff'
import Element from '../element'
import Text from '../text'

const paragraph1 = {
  key: 'paragraph1',
  type: 'paragraph',
  children: [
    {
      key: 'text1',
      type: 'text',
      text: 'Hello123'
    }
  ]
}

const paragraph2 = {
  key: 'paragraph2',
  type: 'paragraph',
  children: [
    {
      key: 'text2',
      type: 'text',
      text: 'Hello456'
    }
  ]
}

// const paragraph3 = {
//   key: 'paragraph3',
//   type: 'paragraph',
//   children: [
//     {
//       key: 'text3',
//       type: 'text',
//       text: 'Hello789'
//     }
//   ]
// }

describe("model-diff", () => {
  it("Delete old nodes and add new nodes", () => {
    const newNode = Element.create(paragraph1)
    const oldNode = Element.create(paragraph2)
    expect(diff([newNode], [oldNode])).toEqual([{
        "key": null,
        "offset": 0,
        "type": OP_DELETE_NODE,
        "value": oldNode.toJSON(),
      }, 
      {
        "key": null,
        "offset": 0,
        "type": OP_INSERT_NODE,
        "value": newNode.toJSON()
      }
    ])
  });
  it("Add Text Node", () => {
    const oldNode = Element.create(paragraph1)
    const newNode = Element.create(paragraph1)
    newNode.appendChild(Text.create({
      key: 'text3',
      text: 'Hello789'
    }))
    expect(diff([newNode], [oldNode])).toEqual([
      {
        "key": oldNode.getKey(),
        "offset": 1,
        "type": OP_INSERT_NODE,
        "value": newNode.last()?.toJSON()
      }
    ])
  });
  it("Modify the text", () => {
    const oldNode = Element.create(paragraph1)
    const newNode = Element.create(paragraph1);
    const newText = newNode.first() as Text;
    newText.setText('He456llo')
    const oldText = oldNode.first() as Text;
    expect(diff([newNode], [oldNode])).toEqual([
      {
        "key": oldText.getKey(),
        "offset": 5,
        "type": OP_DELETE_TEXT,
        "value": oldText.getText().substring(5)
      },
      {
        "key": newText.getKey(),
        "offset": 2,
        "type": OP_INSERT_TEXT,
        "value": newText.getText().substring(2, 5)
      }
    ])
  });
});