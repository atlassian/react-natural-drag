# Keyboard dragging

`react-beautiful-dnd` supports dragging with only a keyboard. We have audited how our keyboard shortcuts interact with standard browser keyboard interactions. When the user is not dragging they can use their keyboard as they normally would. While dragging we override and disable certain browser shortcuts (such as `tab`) to ensure a fluid experience for the user.

> To see more indepth information about how we impact standard browser events see our [how we use DOM events guide](/docs/guides/how-we-use-dom-events.md)

## Keyboard shortcuts: keyboard dragging

When a drag is not occurring, the user will be able to navigate through the `<Draggable />`'s on a page using the standard **tab** <kbd>tab ↹</kbd> key to move forward through the tabbable elements and (**shift** + **tab**) (<kbd>shift</kbd> + )<kbd>tab ↹</kbd>) to move backwards. We achieve this by adding a `tab-index` to the `<Draggable />`. When a `<Draggable />` has focus the **spacebar** <kbd>space</kbd> will **lift** a `<Draggable />`. This will start the drag.

Once a drag is started the following keyboard shortcuts can be used:

- **spacebar** <kbd>space</kbd> - drop the `<Draggable />`
- **escape** <kbd>esc</kbd> - cancel the drag

### Moving a draggable within a droppable

The following commands are also available but they depend on the `type` of `<Droppable />` that the `<Draggable />` is _currently_ in:

#### Within a vertical list

- **Up arrow** <kbd>↑</kbd> - move a `<Draggable />` upwards in a `<Droppable />`
- **Down arrow** <kbd>↓</kbd> - move a `<Draggable />` downwards in a `<Droppable />`

#### Within a horizontal list

- **Right arrow** <kbd>→</kbd> - move a `<Draggable />` to the _right_ in the current `<Droppable />`
- **Left arrow** <kbd>←</kbd> - move a `<Draggable />` to the _left_ in the current `<Droppable />`

### Moving a draggable to another droppable

- **Arrows** <kbd>↑</kbd> <kbd>↓</kbd> <kbd>→</kbd> <kbd>←</kbd> - Move draggables to the nearest droppable.  
(If the desired destination draggable exists in the same dimension that the draggables are oriented, the draggable must first reach the outermost position before it can be moved to the droppable.)

During a drag the following standard keyboard events have their default behaviour prevented (through `event.preventDefault()`) to avoid a bad experience:

- **tab** <kbd>tab ↹</kbd> - preventing tabbing
- **enter** <kbd>⏎</kbd> - preventing submission

## Auto scrolling

When dragging with a keyboard, `react-beautiful-dnd` will also perform [auto scrolling](/docs/guides/auto-scrolling.md) operations to ensure the item can be moved around

[auto-scroll-board-keyboard](https://user-images.githubusercontent.com/2182637/36520650-3d3638f8-17e6-11e8-9cba-1fb439070285.gif)

[← Back to documentation](/README.md#documentation-)
