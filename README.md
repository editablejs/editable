[![zh-CN](https://img.shields.io/badge/lang-%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87-red.svg?longCache=true&style=flat-square "zh-CN")](README.zh-CN.md)

# Editable

An experimental rich text editor framework which aims to replace the native `contenteditable` attribute with a self-drawn cursor to provide richer and more stable editing capabilities.

## Development

Use `nextjs` & `turbo` to build a development environment, use `typescript` for development, and use jest for unit testing.

```bash
# Install
pnpm install

# start up
pnpm dev

```

## Directory Structure

All source codes are in packages, and the apps directory is mainly used for documentation and test cases. Now, in the initial development phase, a React rendering editor model and the logic of model update are written for visual testing.

Essentially, it is expected that all `packages` will be developed using `js`, which is separated from the view layer. Different view layers can be implemented through `Dom`, `React`, and `Vue` to achieve the purpose not limited to a certain front-end library.

### packages/constants

All constants that need to be used globally are placed here for unified management

- `EVENT_` starts with the event name
- `DATA_` starts with the definition of the data name that the DOM node needs to use
- `OP_` is defined for some operation names that will be operated through the co-editor in the future

### packages/utils

Toolkit

- `ua` provides terminal type judgment, such as mobile phone, Android, iOS, etc.
- `log` provides log output, defines some common errors and exceptions, and can be used to throw exceptions

### packages/grapheme-breaker

Mainly index some `unicode` characters. Because the number of bytes occupied by some characters is uncertain, resulting in inaccurate indexes of some characters after splitting, this toolkit is needed to solve this problem.

### packages/event-emitter

A simple event handler, with a slight difference, the bound event returning non-undefined in processing can interrupt subsequent event firing.

### packages/model

The data model, which uses the `Map` structure to store data, supports nesting.

Each acquired `node` object is a copy, and operations and modifications to it will not affect the original data.

- `keys` can generate a unique key through the generateRandomKey method
- `node` node, each node has a unique key, you can get the node by key.
- The text node defined by `text`, inherits node, and its `type` attribute is fixed `text`. `text` and `format` are provided to modify the content and formatting of the text.
- `element` is a non-text node, inherits node, its `type` is specified by the user plugin, and can have unlimited child nodes
- The model json data stored by `map` provides two Maps, one Map records all node data, and the other Map provides the corresponding relationship between parent and child
- `op` provides some methods of modifying the model to generate operation commands
- `index` can convert map data to node objects. And provides some methods for manipulating map data. Every time data is manipulated, an `EVENT_NODE_UPDATE` event is triggered.

### packages/selection

Cursor and selection selection, drawing, text input events

- `layer` render layer, which renders some boxes as shadows. Mainly used for cursor, selection, text input box position rendering
- `input` renders a textarea input box to provide input interception at the cursor position, with input triggering text change events, as well as focus and blur events
- `typing` selection-related event processing, and find the nearest node by coordinates to trigger the event of drawing the cursor and selection
- `utils` provides some coordinates and selection calculations and judgments
- `range` single selection object, emulating some of the same methods as native Range
- `text` provides methods to find the nearest text index by coordinates
- `index` simulates some methods of native `selection`, as well as methods for drawing cursor and selection

### packages/core

Mainly integrates `model` and `selection` to provide operation methods, event handling, etc.

- `typing` encapsulates some common event hooks
- `index` plugin registration. Logic for handling model changes -> view rendering -> cursor selection rendering

### apps/docs

- `components` defines rendering views for three different types of nodes, and methods for registering plugins. Text also handles rendering logic for combined input methods
- `hooks` encapsulates editor model changes -> view rendering -> logic processing of cursor selection rendering

## Task

### Selection

- [x] English keyboard input
- [x] Combination input method input
- [x] Cursor selection rendering
- [x] Text input box rendering
- [x] Drag mouse to select selection and cursor
- [x] Get all selected content api
- [x] Switch cursor and selection by keyboard left and right keys
- [x] Switch cursor and selection by keyboard Shift+left and right keys
- [ ] Use the keyboard up and down keys to switch the cursor and selection
- [ ] Double-click, triple-click to select text
- [ ] touch to select selection and cursor
- [ ] Full coverage of unit tests

### Model

- [x] Insert text
- [x] delete text
- [ ] Modify text format
- [x] insert node
- [x] delete node
- [ ] Modify node style
- [ ] Modify node DATA
- [ ] Grid node type design

### Core

- [x] plugin registration
- [x] Rendering plugin
- [ ] plugin hook
- [ ] Non-rendering plugin handling
- [ ] Design the definition and processing of block and inline types
- [x] Insert text at cursor
- [x] Insert node at cursor
- [x] delete the current selection
- [x] Delete text before and after the cursor position by pressing backspace & delete
- [ ] carriage return

### View

- [ ] DOM view rendering design
- [ ] React view rendering design (part)
- [ ] Vue view rendering design