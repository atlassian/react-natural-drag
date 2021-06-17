// @flow
import * as React from 'react';
import type { DraggableId, DroppableId, TypeId } from '../../types';

export type DroppableContextValue = {|
  isUsingCloneFor: ?DraggableId,
  droppableId: DroppableId,
  type: TypeId,
|};

export default React.createContext<?DroppableContextValue>(null);
