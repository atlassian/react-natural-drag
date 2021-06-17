// @flow
import * as React from 'react';
import type { InOutAnimationMode } from '../../types';

export type AnimateProvided = {|
  onClose: () => void,
  animate: InOutAnimationMode,
  data: mixed,
|};

type Props = {|
  on: mixed,
  shouldAnimate: boolean,
  children: (provided: AnimateProvided) => React.Node,
|};

type State = {|
  data: mixed,
  isVisible: boolean,
  animate: InOutAnimationMode,
|};

// Using a class here rather than hooks because
// getDerivedStateFromProps results in far less renders.
// Using hooks to implement this was quite messy and resulted in lots of additional renders

export default class AnimateInOut extends React.PureComponent<Props, State> {
  state: State = {
    isVisible: Boolean(this.props.on),
    data: this.props.on,
    // not allowing to animate close on mount
    animate: this.props.shouldAnimate && this.props.on ? 'open' : 'none',
  };

  static getDerivedStateFromProps(props: Props, state: State): State {
    if (!props.shouldAnimate) {
      return {
        isVisible: Boolean(props.on),
        data: props.on,
        animate: 'none',
      };
    }

    // need to animate in
    if (props.on) {
      return {
        isVisible: true,
        // have new data to animate in with
        data: props.on,
        animate: 'open',
      };
    }

    // need to animate out if there was data

    if (state.isVisible) {
      return {
        isVisible: true,
        // use old data for animating out
        data: state.data,
        animate: 'close',
      };
    }

    // close animation no longer visible
    return {
      isVisible: false,
      animate: 'close',
      data: null,
    };
  }

  onClose = () => {
    if (this.state.animate !== 'close') {
      return;
    }

    this.setState({
      isVisible: false,
    });
  };

  render() {
    if (!this.state.isVisible) {
      return null;
    }

    const provided: AnimateProvided = {
      onClose: this.onClose,
      data: this.state.data,
      animate: this.state.animate,
    };
    return this.props.children(provided);
  }
}
