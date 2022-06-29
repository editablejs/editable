import { Text, Element, createModel } from '@editablejs/model';
import { Range, createSelection } from '..'

const model = createModel();

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

const paragraph3 = {
  key: 'paragraph3',
  type: 'paragraph',
  children: [
    {
      key: 'text3',
      type: 'text',
      text: 'Hello789'
    }
  ]
}

const testValue = {
  key: 'default',
  type: 'page',
  children: [
    paragraph1,
    paragraph2,
    paragraph3
  ]
}

model.insertNode(Element.create(testValue));


describe('selection.getSubRanges', () => {
  it("Selection of the same node", () => {
    const selection = createSelection(model);
    const ranges = selection.getSubRanges(new Range('text1', 2, 'text1', 6))
    expect(ranges.length).toBe(1);
    expect(ranges[0].anchor).toEqual({
      key: 'text1',
      offset: 2
    });
    expect(ranges[0].focus).toEqual({ 
      key: 'text1',
      offset: 6
    });
  });
  it("Selection of different nodes", () => {
    const selection = createSelection(model)
    const ranges = selection.getSubRanges(new Range('text1', 1, 'text3', 5))
    expect(ranges.length).toBe(3);
    expect(ranges[0].anchor).toEqual({
      key: 'text1',
      offset: 1
    });
    expect(ranges[0].focus).toEqual({ 
      key: 'text1',
      offset: 8
    });
    expect(ranges[1].anchor).toEqual({
      key: 'default',
      offset: 1
    });
    expect(ranges[1].focus).toEqual({ 
      key: 'default',
      offset: 2
    });
    expect(ranges[2].anchor).toEqual({
      key: 'text3',
      offset: 0
    });
    expect(ranges[2].focus).toEqual({ 
      key: 'text3',
      offset: 5
    });
  })
})

describe('selection.getContents', () => {
  it("Selection of the same node", () => {
    const selection = createSelection(model)
    const contents = selection.getContents(new Range('text1', 2, 'text1', 6))
    expect(contents.length).toBe(1);
    expect(contents[0].toJSON()).toEqual(Text.create({
      parent: contents[0].getParentKey(),
      key: contents[0].getKey(),
      text: 'llo1'
    }).toJSON());
  });
  it("Selection of different nodes", () => {
    const selection = createSelection(model)
    const contents = selection.getContents(new Range('text1', 1, 'text3', 5))
    expect(contents.length).toBe(3);
    expect(contents[0].toJSON()).toEqual(Element.create({ ...paragraph1, parent: contents[0].getParentKey(), children: [{  
      parent: contents[0].getParentKey(),
      key: 'text1',
      text: 'ello123'}]}).toJSON());
    expect(contents[1].toJSON()).toEqual(Element.create({ ...paragraph2, parent: contents[1].getParentKey(),}).toJSON());
    expect(contents[2].toJSON()).toEqual(Element.create({ ...paragraph3, parent: contents[2].getParentKey(), children: [{  
      parent: contents[2].getParentKey(),
      key: 'text3',
      text: 'Hello'}]}).toJSON());
  })
})