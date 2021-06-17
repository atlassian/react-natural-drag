// @flow
import * as React from 'react';
import type {
  Provided,
  StateSnapshot,
} from '../../../../../src/view/droppable/droppable-types';

export default (mock?: Function = () => {}) =>
  class Stubber extends React.Component<{
    provided: Provided,
    snapshot: StateSnapshot,
  }> {
    render() {
      const { provided, snapshot } = this.props;
      mock({
        provided,
        snapshot,
      });
      return (
        <div ref={provided.innerRef} {...provided.droppableProps}>
          Hey there
          {provided.placeholder}
        </div>
      );
    }
  };
