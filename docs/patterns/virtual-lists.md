# Virtual lists

`react-beautiful-dnd` supports drag and drop within and between virtual lists. This lets you have fantastic performance with very large data sets. As a general rule, you will want to start using a virtual list when your list size is more than 500 items.

![virtual-board](https://user-images.githubusercontent.com/2182637/66453948-e0044d00-eab1-11e9-88db-3e5165dde69b.gif)

## Background: what are virtual lists?

A "virtual list" is the name given to a _windowing_ performance optimisation technique where only the **visible** list items are rendered. See [Rendering large lists with react-window](https://addyosmani.com/blog/react-window/) by Addy Osmani for more background on virtual lists

<img src="https://user-images.githubusercontent.com/2182637/65490523-a7307980-def0-11e9-9991-a7e0c2a6e30a.gif" alt="windowing" width="200px"/>

> Diagram from [Creating more efficient React views with windowing](https://bvaughn.github.io/forward-js-2017/#/0/0) by Brain Vaughn

There are drawbacks with using virtual lists. They stem from the fact that with a virtual list not all of the page content is rendered into the DOM.

- Accessibility: screenreaders cannot read out all of the content of a page
- Findability: native find (<kbd>meta</kbd> + <kbd>f</kbd>) will not find things that are not rendered in the DOM.

## Support

`react-beautiful-dnd` is designed to work with existing virtual list solutions and does not have it's own virtual list abstraction. There is no official "virtual list" specification or implementation for the web. Different virtual list libraries achieve windowing through various techniques. So we cannot guarentee that `react-beautiful-dnd` will work with every virtual list library. We have created examples for `react-window` and `react-virtualized` which are the two most popular virtual list libraries for `react`.

## Premade examples 🎁

Please raise a pull request if you would like to add examples for other virtualization libraries! ❤

### [`react-window`](https://github.com/bvaughn/react-window)

- [List](https://react-beautiful-dnd.netlify.com/?path=/story/virtual-react-window--list) ([source](/stories/src/virtual/react-window/list.jsx))
- [Board](https://react-beautiful-dnd.netlify.com/?path=/story/virtual-react-window--board) ([source](/stories/src/virtual/react-window/board.jsx))
- [Basic list on `codesandbox.io`](https://codesandbox.io/s/simple-virtual-list-dark-c6wqc)
- [Basic board on `codesandbox.io`](https://codesandbox.io/s/simple-virtual-list-board-vgvzt)

### [`react-virtualized`](https://github.com/bvaughn/react-virtualized)

- [List](https://react-beautiful-dnd.netlify.com/?path=/story/virtual-react-virtualized--list) ([source](/stories/src/virtual/react-virtualized/list.jsx))
- [Board](https://react-beautiful-dnd.netlify.com/?path=/story/virtual-react-virtualized--board) ([source](/stories/src/virtual/react-virtualized/board.jsx))
- [List](https://react-beautiful-dnd.netlify.com/?path=/story/virtual-react-virtualized--window-list) with [`WindowScroller`](https://github.com/bvaughn/react-virtualized/blob/master/docs/WindowScroller.md) ([source](/stories/src/virtual/react-virtualized/window-list.jsx))

### [`react-virtuoso`](https://github.com/petyosi/react-virtuoso)
React Virtuoso comes with automatic item measurement out of the box.
- [List with source](https://virtuoso.dev/react-beautiful-dnd/)
- [Basic list on `codesandbox.io`](https://codesandbox.io/s/react-virutoso-with-react-beautiful-dnd-e6vmq)

## Usage

`react-beautiful-dnd` does not provide its own virtual list abstraction so there is a bit of wiring that you will need to do in order to get going with existing virtual list solutions 🛠

### Enable overscanning

> Virtualisation libraries often have overscanning enabled by default

Most virtual list libraries support the concept of **overscanning**. Overscanning is where a small about of non-visible items are rendered near the boundary of the window. When a scroll occurs the overscanned item can be immediately moved into view and does not need to be created. Overscanning generally leads to a more fluid experience.

It is required that overscanning be enabled for `react-beautiful-dnd` to work correctly. If overscanning is not enabled, `rbd` cannot tell if there are more items in the list when an item is in the last visual position. We require an overscanning value of one or more.

### Set `<Droppable /> | mode` to `virtual`

Virtual lists behave differently to regular lists. You will need to tell `rbd` that your list is a virtual one.

```js
<Droppable droppableId="droppable" mode="virtual">
  {/*...*/}
</Droppable>
```

### Use the `<Droppable /> | renderClone` API

When using a virtual list the original dragging item can be unmounted during a drag if it becomes invisible. To get around this we require that you drag a clone of the dragging item. See our [reparenting guide](/docs/guides/reparenting.md) for more details.

```js
<Droppable
  droppableId="droppable"
  mode="virtual"
  renderClone={(provided, snapshot, rubric) => (
    <div
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      ref={provided.innerRef}
    >
      Item id: {items[rubric.source.index].id}
    </div>
  )}
>
  {/*...*/}
</Droppable>
```

### Stand in for the placeholder

> 👋 This is only required when you have multiple connected lists. This is not required when using a single list

Usually we require consumers to put a `placeholder` (`<Droppable /> | DroppableProvided | placeholder`) into the list so that we can insert space into a list as needing during a drag.

```js
<Droppable droppableId="droppable">
  {(provided, snapshot) => (
    <div ref={provided.innerRef} {...provided.droppableProps}>
      {/* Usually needed. But not for virtual lists! */}
      {provided.placeholder}
    </div>
  )}
</Droppable>
```

However, a `placeholder` does not make sense in the context of a virtual list as the dimensions of the list is not based on collective size of the visual items, but rather is calculated based on things like `itemCount` and `itemSize`. (eg `height` = `itemSize` \* `itemCount`). For virtual lists, inserting our own node into it would not increase the size of the list. **So we need you to insert the space for us!**

A simple way to add extra space to a virtual list is to add a non-visible item to your list. It is important that this extra item is not a `<Draggable />`.

```js
// This example uses the `react-window` API

const Row = ({ data, index, style }: RowProps) => {
  const item = data[index];

   // We are rendering an extra item for the placeholder
  if (!item) {
    return null;
  }

  return (
    <Draggable draggableId={item.id} index={index} key={item.id}>
      {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
        {/*...*/}
      )}
    </Draggable>
  );
});

function render(provided: DroppableProvided, snapshot: DroppableStateSnapshot) {
  // Add an extra item to our list to make space for a dragging item
  // Usually the DroppableProvided.placeholder does this, but that won't
  // work in a virtual list
  const itemCount: number = snapshot.isUsingPlaceholder
    ? quotes.length + 1
    : quotes.length;

  return (
    <List
      height={500}
      itemCount={itemCount}
      itemSize={110}
      width={300}
      outerRef={provided.innerRef}
      itemData={quotes}
    >
      {Row}
    </List>
  );
}
```

[← Back to documentation](/README.md#documentation-)
