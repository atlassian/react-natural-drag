# `<Draggable />`

`<Draggable />` components can be dragged around and dropped onto `<Droppable />`s. A `<Draggable />` must always be contained within a `<Droppable />`. It is **possible** to reorder a `<Draggable />` within its home `<Droppable />` or move to another `<Droppable />`. It is **possible** because a `<Droppable />` is free to control what it allows to be dropped on it.

Every `<Draggable />` has a _drag handle_. A _drag handle_ is the element that the user interacts with in order to drag a `<Draggable />`. A _drag handle_ can be the `<Draggable />` element itself, or a child of the `<Draggable />`. Note that by default a _drag handle_ cannot be an interactive element, since [event handlers are blocked on nested interactive elements](#interactive-child-elements-within-a-draggable-). Proper semantics for accessibility are added to the _drag handle_ element. If you wish to use an interactive element, `disableInteractiveElementBlocking` must be set.

```js
import { Draggable } from 'react-beautiful-dnd';

<Draggable draggableId="draggable-1" index={0}>
  {(provided, snapshot) => (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
    >
      <h4>My draggable</h4>
    </div>
  )}
</Draggable>;
```

## Draggable Props

```js
import type { Node } from 'react';

type Props = {|
  // required
  draggableId: DraggableId,
  index: number,
  children: DraggableChildrenFn,
  // optional
  isDragDisabled: ?boolean,
  disableInteractiveElementBlocking: ?boolean,
  shouldRespectForcePress: ?boolean,
|};
```

### Required props

> `react-beautiful-dnd` will throw an error if a required prop is not provided

- `draggableId`: A _required_ `DraggableId(string)`. See our [identifiers guide](/docs/guides/identifiers.md) for more information.
- `index`: A _required_ `number` that matches the order of the `<Draggable />` in the `<Droppable />`. It is simply the index of the `<Draggable />` in the list.

`index` rule:

- Must be unique within a `<Droppable />` (no duplicates)
- Must be consecutive. `[0, 1, 2]` and not `[1, 2, 8]`

Indexes do not need to start from `0` (this is often the case in [virtual lists](/docs/patterns/virtual-lists.md)). In development mode we will log warnings to the `console` if any of these rules are violated. See [Setup problem detection and error recovery](/docs/guides/setup-problem-detection-and-error-recovery.md)

Typically the `index` value will simply be the `index` provided by a `Array.prototype.map` function:

```js
{
  this.props.items.map((item, index) => (
    <Draggable draggableId={item.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          {item.content}
        </div>
      )}
    </Draggable>
  ));
}
```

### Optional props

- `isDragDisabled`: A flag to control whether or not the `<Draggable />` is permitted to drag. You can use this to implement your own conditional drag logic. It will default to `false`.
- `disableInteractiveElementBlocking`: A flag to opt out of blocking a drag from interactive elements. For more information refer to the section _Interactive child elements within a `<Draggable />`_
- `shouldRespectForcePress`: Whether or not the _drag handle_ should respect force press interactions. See [Force press](#force-press).

## Children function (render props / function as child)

The `React` children of a `<Draggable />` must be a function that returns a `ReactNode`.

```js
<Draggable draggableId="draggable-1" index={0}>
  {(provided, snapshot) => (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
    >
      Drag me!
    </div>
  )}
</Draggable>
```

```js
type DraggableChildrenFn = (
  DraggableProvided,
  DraggableStateSnapshot,
  DraggableRubric,
) => Node;
```

The function is provided with three arguments:

### 1. provided: (DraggableProvided)

```js
type DraggableProvided = {|
  innerRef: (HTMLElement) => void,
  draggableProps: DraggableProps,
  // will be null if the draggable is disabled
  dragHandleProps: ?DragHandleProps,
|};
```

> For more type information please see [our types guide](/docs/guides/types.md).

Everything within the _provided_ object must be applied for the `<Draggable />` to function correctly.

- `provided.innerRef (innerRef: (HTMLElement) => void)`: In order for the `<Draggable />` to function correctly, **you must** bind the `innerRef` function to the `ReactElement` that you want to be considered the `<Draggable />` node. We do this in order to avoid needing to use `ReactDOM` to look up your DOM node.

> For more information on using `innerRef` see our [using `innerRef` guide](/docs/guides/using-inner-ref.md)

#### `innerRef` Example

```js
<Draggable draggableId="draggable-1" index={0}>
  {(provided, snapshot) => <div ref={provided.innerRef}>Drag me!</div>}
</Draggable>

// Note: this will not work directly as we are not applying draggableProps or dragHandleProps
```

- `provided.draggableProps (DraggableProps)`: This is an Object that contains a `data` attribute and an inline `style`. This Object needs to be applied to the same node that you apply `provided.innerRef` to. This controls the movement of the draggable when it is dragging and not dragging. You are welcome to add your own styles to `DraggableProps.style` – but please do not remove or replace any of the properties.

#### `draggableProps` type information

```js
// Props that can be spread onto the element directly
export type DraggableProps = {|
  // inline style
  style: ?DraggableStyle,
  // used for shared global styles
  'data-rbd-draggable-context-id': string,
  'data-rbd-draggable-id': string,
  // used to know when a transition ends
  onTransitionEnd: ?(event: TransitionEvent) => void,
|};
```

> For more type information please see [our types guide](/docs/guides/types.md).

#### `draggableProps` Example

```js
<Draggable draggableId="draggable-1" index={0}>
  {(provided, snapshot) => (
    <div ref={provided.innerRef} {...provided.draggableProps}>
      Drag me!
    </div>
  )}
</Draggable>

// Note: this will not work directly as we are not applying dragHandleProps
```

#### `key`s for a list of `<Draggable />`

If you are rendering a list of `<Draggable />`s then it is important that you add a `key` prop to each `<Draggable />`.

```js
return items.map((item, index) => (
  <Draggable
    // adding a key is important!
    key={item.id}
    draggableId={item.id}
    index={index}
  >
    {(provided, snapshot) => (
      <div
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
      >
        {item.content}
      </div>
    )}
  </Draggable>
));
```

Rules:

- Your `key` needs to be unique within the list
- Your `key` should not include the `index` of the item

Usually you will want to just use the `draggableId` as the `key`

`React` will warn you if your list is missing `keys`. It will not warn you if you are using `index` as a part of your `key`.

Not using `keys` correctly will cause really bad times 💥

[`React` docs about `keys`](https://reactjs.org/docs/lists-and-keys.html)

#### Positioning ownership

It is a contract of this library that it owns the positioning logic of the dragging element. This includes properties such as `top`, `right`, `bottom`, `left` and `transform`. The library may change how it positions things and which properties it uses without performing a major version bump. It is also recommended that you do not apply your own `transition` property to the dragging element.

#### Warning: `position: fixed`

`react-beautiful-dnd` uses `position: fixed` to position the dragging element. This is quite robust and allows for you to have `position: relative | absolute | fixed` parents. However, unfortunately `position:fixed` is [impacted by `transform`](http://meyerweb.com/eric/thoughts/2011/09/12/un-fixing-fixed-elements-with-css-transforms/) (such as `transform: rotate(10deg);`). This means that if you have a `transform: *` on one of the parents of a `<Draggable />` then the positioning logic will be incorrect while dragging. Lame! For most consumers this will not be an issue.

To get around this you can [reparent your <Draggable />](/docs/guides/reparenting.md). We do not enable this functionality by default as it has performance problems.

#### Force press

> Safari only

In Safari, it is possible for a user to perform a force press action. This is possible with a touch device (`touchforcechange`) and with a mouse (`webkitmouseforcechanged`).

We have found that in order to give the most consistent drag and drop experience we need to _opt out_ of force press interactions on a _drag handle_. However, it is possible to have `react-beautiful-dnd` work while also respecting force press interactions. The trade off is that if we register a force press interaction a drag will be cancelled.

In order to control this behaviour you set the `shouldRespectForcePress` prop on a `<Draggable />`. By default we set this value to `false` to prevent heavy presses from cancelling a drag.

##### Enabling `shouldRespectForcePress`

If you set `shouldRespectForcePress` to `true` then the following will occur:

###### Touch dragging

If the user force presses on the element before they have moved the element (even if a drag has already started) then the drag is cancelled and the standard force press action occurs. For an anchor this is a website preview.

###### Mouse dragging

Any force press action will cancel an existing or pending drag

#### Focus retention

See [our focus guide](/docs/guides/browser-focus.md)

#### Extending `DraggableProps.style`

If you are using inline styles you are welcome to extend the `DraggableProps.style` object. You are also welcome to apply the `DraggableProps.style` object using inline styles and use your own styling solution for the component itself. You can use anything you like to style the `<Draggable />` such as

- css-in-js such as [`styled-components`](https://www.styled-components.com) or [`emotion`](https://emotion.sh)
- sass, less
- vanilla css

If you are overriding inline styles be sure to do it after you spread the `provided.draggableProps` or the spread will override your inline style.

```js
<Draggable draggable="draggable-1" index={0}>
  {(provided, snapshot) => {
    // extending the DraggableStyle with our own inline styles
    const style = {
      backgroundColor: snapshot.isDragging ? 'blue' : 'white',
      fontSize: 18,
      ...provided.draggableProps.style,
    };
    return (
      <div ref={provided.innerRef} {...provided.draggableProps} style={style}>
        Drag me!
      </div>
    );
  }}
</Draggable>
```

#### Unsupported `margin` setups

Avoid margin collapsing between `<Draggable />`s. [margin collapsing](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Box_Model/Mastering_margin_collapsing) is one of those really hard parts of CSS. For our purposes, if you have one `<Draggable />` with a `margin-bottom: 10px` and the next `<Draggable />` has a `margin-top: 12px` these margins will _collapse_ and the resulting space between the elements will be the greater of the two: `12px`. When we do our calculations we are currently not accounting for margin collapsing. If you do want to have a margin on the siblings, wrap them both in a `div` and apply the margin to the inner `div` so they are not direct siblings.

#### `<Draggable />`s should be visible siblings

It is an assumption that `<Draggable />`s are _visible siblings_ of one another. There can be other elements in between, but these elements should not take up any additional space. You probably will not do this anyway, but just calling it out to be super clear.

```js
// Direct siblings ✅
<Draggable draggableId="draggable-1" index={0}>
  {() => {}}
</Draggable>
<Draggable draggableId="draggable-2" index={1}>
  {() => {}}
</Draggable>

// Not direct siblings, but are visible siblings ✅
<div>
  <Draggable draggableId="draggable-1" index={0}>
    {() => {}}
  </Draggable>
</div>
<div>
  <Draggable draggableId="draggable-2" index={1}>
    {() => {}}
  </Draggable>
</div>

// Spacer elements ❌
<Draggable draggableId="draggable-1" index={0}>
    {() => {}}
</Draggable>
<p>I will break things!</p>
<Draggable draggableId="draggable-2" index={1}>
    {() => {}}
</Draggable>

// Spacing on non sibling wrappers ❌
<div style={{padding: 10}}>
  <Draggable draggableId="draggable-1" index={0}>
    {() => {}}
  </Draggable>
</div>
<div style={{padding: 10}}>
  <Draggable draggableId="draggable-2" index={1}>
    {() => {}}
  </Draggable>
</div>
```

- `provided.dragHandleProps (?DragHandleProps)` every `<Draggable />` has a _drag handle_. This is what is used to drag the whole `<Draggable />`. Often this will be the same node as the `<Draggable />`, but sometimes it can be a child of the `<Draggable />`. `DragHandleProps` need to be applied to the node that you want to be the drag handle. This is a number of props that need to be applied to the `<Draggable />` node. The simplest approach is to spread the props onto the draggable node (`{...provided.dragHandleProps}`). However, you are also welcome to [monkey patch](https://davidwalsh.name/monkey-patching) these props if you also need to respond to them. DragHandleProps will be `null` when `isDragDisabled` is set to `true`.

#### `dragHandleProps` Type information

```js
type DragHandleProps = {|
  // what draggable the handle belongs to
  'data-rbd-drag-handle-draggable-id': DraggableId,

  // What DragDropContext the drag handle is in
  'data-rbd-drag-handle-context-id': ContextId,

  // Id of hidden element that contains the lift instruction (nicer screen reader text)
  'aria-labelledby': ElementId,

  // Allow tabbing to this element
  tabIndex: number,

  // Stop html5 drag and drop
  draggable: boolean,
  onDragStart: (event: DragEvent) => void,
|};
```

#### `dragHandleProps` Example: standard

```js
<Draggable draggableId="draggable-1" index={0}>
  {(provided, snapshot) => (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
    >
      Drag me!
    </div>
  )}
</Draggable>
```

#### `dragHandleProps` example: custom drag handle

Controlling a whole draggable by just a part of it

```js
<Draggable draggableId="draggable-1" index={0}>
  {(provided, snapshot) => (
    <div ref={provided.innerRef} {...provided.draggableProps}>
      <h2>Hello there</h2>
      <div {...provided.dragHandleProps}>Drag handle</div>
    </div>
  )}
</Draggable>
```

### 2. Snapshot: (DraggableStateSnapshot)

```js
type DraggableStateSnapshot = {|
  // Set to true if a Draggable is being actively dragged, or if it is drop animating
  // Both active dragging and the drop animation are considered part of the drag
  // *Generally this is the only property you will be using*
  isDragging: boolean,
  // Set to true if a Draggable is drop animating. Not every drag and drop interaction
  // as a drop animation. There is no drop animation when a Draggable is already in its final
  // position when dropped. This is commonly the case when dragging with a keyboard
  isDropAnimating: boolean,
  // Information about a drop animation
  dropAnimation: ?DropAnimation
  // What Droppable (if any) the Draggable is currently over
  draggingOver: ?DroppableId,
  // the id of a draggable that you are combining with
  combineWith: ?DraggableId,
  // if something else is dragging and you are a combine target, then this is the id of the item that is dragging
  combineTargetFor: ?DraggableId,
  // There are two modes that a drag can be in
  // 'FLUID': everything is done in response to highly granular input (eg mouse)
  // 'SNAP': items snap between positions (eg keyboard);
  mode: ?MovementMode,
|};
```

> See our [type guide](/docs/guides/types.md) for more details

The `children` function is also provided with a small amount of state relating to the current drag state. This can be optionally used to enhance your component. A common use case is changing the appearance of a `<Draggable />` while it is being dragged. Note: if you want to change the cursor to something like `grab` you will need to add the style to the draggable. (See [Extending `DraggableProps.style`](#extending-draggableprops-style) above)

```js
<Draggable draggableId="draggable-1" index={0}>
  {(provided, snapshot) => {
    const style = {
      backgroundColor: snapshot.isDragging ? 'blue' : 'grey',
      ...provided.draggableProps.style,
    };

    return (
      <div
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        style={style}
      >
        Drag me!
      </div>
    );
  }}
</Draggable>
```

### 3. rubric: (DraggableRubric)

```js
type DraggableRubric = {|
  draggableId: DraggableId,
  type: TypeId,
  source: DraggableLocation,
|};
```

`rubric` represents all of the information associated with a `<Draggable />`. `rubric` is helpful for looking up the data associated with your `<Draggable />` when it is not available in the current scope. This is useful when using the `<Droppable /> | renderClone` API. The `rubric` is the same lookup information that is provided to the [`Responder`s](/docs/guides/responders.md).

## Adding an `onClick` handler to a `<Draggable />` or a _drag handle_

You are welcome to add your own `onClick` handler to a `<Draggable />` or a _drag handle_ (which might be the same element). `onClick` events handlers will always be called if a click occurred. If we are preventing the click, then the `event.defaultPrevented` property will be set to `true`. We prevent click events from occurring when the user was dragging an item. See [sloppy clicks and click prevention](/docs/sensors/mouse.md#sloppy-clicks-and-click-prevention-) for more information.

## Interactive child elements within a `<Draggable />`

It is possible for your `<Draggable />` to contain interactive elements. By default we block dragging on these elements. By doing this we allow those elements to function in the usual way. Here is the list of interactive elements that we block dragging from by default:

- `input`
- `button`
- `textarea`
- `select`
- `option`
- `optgroup`
- `video`
- `audio`
- [`contenteditable`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/contenteditable) (any elements that are `contenteditable` or are within a `contenteditable` container)
- Any elements that have a `data-rbd-is-interactive-element` property set to true, or any element that is contained in such element.

You can opt out of this behavior by adding the `disableInteractiveElementBlocking` prop to a `<Draggable />`. However, it is questionable as to whether you should be doing so because it will render the interactive element unusable. If you need to _conditionally_ block dragging from interactive elements you can add the `disableInteractiveElementBlocking` prop to opt out of the default blocking and monkey patch the `dragHandleProps (DragHandleProps)` event handlers to disable dragging as required.

[← Back to documentation](/README.md#documentation-)
