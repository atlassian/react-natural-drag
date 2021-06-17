// @flow
import * as React from 'react';
import type { Provided } from '../../../../src/view/droppable/droppable-types';
import mount from './util/mount';
import { withError } from '../../../util/console';

it('should warn a consumer if they have not provided a ref', () => {
  class NoRef extends React.Component<{ provided: Provided }> {
    render() {
      const provided: Provided = this.props.provided;

      return (
        <div {...provided.droppableProps}>
          Hello there
          {provided.placeholder}
        </div>
      );
    }
  }

  withError(() => {
    mount({ WrappedComponent: NoRef });
  });
});

it('should throw a consumer if they have provided an SVGElement', () => {
  class WithSVG extends React.Component<{ provided: Provided }> {
    render() {
      const provided: Provided = this.props.provided;

      return (
        // $FlowFixMe - flow is correctly stating this is not a HTMLElement
        <svg {...provided.droppableProps} ref={provided.innerRef}>
          Hello there
          {provided.placeholder}
        </svg>
      );
    }
  }

  withError(() => {
    mount({ WrappedComponent: WithSVG });
  });
});
