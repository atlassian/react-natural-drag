# `<DragDropContext />`

In order to use drag and drop, you need to have the part of your `React` tree that you want to be able to use drag and drop in wrapped in a `<DragDropContext />`. It is advised to just wrap your entire application in a `<DragDropContext />`. Having nested `<DragDropContext />`'s is _not_ supported. You will be able to achieve your desired conditional dragging and dropping using the props of `<Droppable />` and `<Draggable />`. You can think of `<DragDropContext />` as having a similar purpose to the [react-redux Provider component](https://react-redux.js.org/api/provider). A content-security-protection nonce attribute is added to the injected style tags if provided.

## Props

```js
type Responders = {|
  // optional
  onBeforeCapture?: OnBeforeCaptureResponder
  onBeforeDragStart?: OnBeforeDragStartResponder,
  onDragStart?: OnDragStartResponder,
  onDragUpdate?: OnDragUpdateResponder,
  // required
  onDragEnd: OnDragEndResponder,
|};

import type { Node } from 'react';

type Props = {|
  ...Responders,
  // We do not technically need any children for this component
  children: Node | null,
  // Read out by screen readers when focusing on a drag handle
  dragHandleUsageInstructions?: string,
  // Used for strict content security policies
  nonce?: string,
  // Used for custom sensors
  sensors?: Sensor[],
  enableDefaultSensors?: ?boolean,
|};
```

- `dragHandleUsageInstructions`: What is read out to screen reader users when a _drag handle_ is given browser focus. See our [screen reader guide](/docs/guides/screen-reader.md)
- `nonce`: Used for strict content security policy setups. See our [content security policy guide](/docs/guides/content-security-policy.md)
- `sensors`: Used to pass in your own `sensor`s for a `<DragDropContext />`. See our [sensor api documentation](/docs/sensors/sensor-api.md)
- `enableDefaultSensors`: Whether or not the default sensors ([mouse](/docs/sensors/mouse.md), [keyboard](/docs/sensors/keyboard.md), and [touch](/docs/sensors/touch.md)) are enabled. You can also import them separately as `useMouseSensor`, `useKeyboardSensor`, or `useTouchSensor` and reuse just some of them via `sensors` prop. See our [sensor api documentation](/docs/sensors/sensor-api.md)

> See our [type guide](/docs/guides/types.md) for more details

## Basic usage

### Using a `class` component

```js
import * as React from 'react';
import { DragDropContext } from 'react-beautiful-dnd';

class App extends React.Component {
  onBeforeCapture = () => {
    /*...*/
  };

  onBeforeDragStart = () => {
    /*...*/
  };

  onDragStart = () => {
    /*...*/
  };
  onDragUpdate = () => {
    /*...*/
  };
  onDragEnd = () => {
    // the only one that is required
  };

  render() {
    return (
      <DragDropContext
        onBeforeCapture={this.onBeforeCapture}
        onBeforeDragStart={this.onBeforeDragStart}
        onDragStart={this.onDragStart}
        onDragUpdate={this.onDragUpdate}
        onDragEnd={this.onDragEnd}
      >
        <div>Hello world</div>
      </DragDropContext>
    );
  }
}
```

### Using a `function` component

```js
import * as React from 'react';
import { DragDropContext } from 'react-beautiful-dnd';

function App() {
  // using useCallback is optional
  const onBeforeCapture = useCallback(() => {
    /*...*/
  }, []);
  const onBeforeDragStart = useCallback(() => {
    /*...*/
  }, []);
  const onDragStart = useCallback(() => {
    /*...*/
  }, []);
  const onDragUpdate = useCallback(() => {
    /*...*/
  }, []);
  const onDragEnd = useCallback(() => {
    // the only one that is required
  }, []);

  return (
    <DragDropContext
      onBeforeCapture={onBeforeCapture}
      onBeforeDragStart={onBeforeDragStart}
      onDragStart={onDragStart}
      onDragUpdate={onDragUpdate}
      onDragEnd={onDragEnd}
    >
      <div>Hello world</div>
    </DragDropContext>
  );
}
```

## `Responders`

> `Responders` were previously known as `Hooks`

Responders are top level application events that you can use to perform your own state updates, style updates, as well as to make screen reader announcements.

[Please see our Responders guide](/docs/guides/responders.md) for detailed information about responders ❤️

[← Back to documentation](/README.md#documentation-)
