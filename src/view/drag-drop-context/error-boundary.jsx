// @flow
import * as React from 'react';
import { warning, error } from '../../dev-warning';
import { noop } from '../../empty';
import bindEvents from '../event-bindings/bind-events';
import { RbdInvariant } from '../../invariant';
import type { AppCallbacks } from './drag-drop-context-types';

type Props = {|
  children: (setCallbacks: (callbacks: AppCallbacks) => void) => React.Node,
|};

// Lame that this is not in flow
type ErrorEvent = Event & {
  error: ?Error,
};

export default class ErrorBoundary extends React.Component<Props> {
  callbacks: ?AppCallbacks = null;
  unbind: () => void = noop;

  componentDidMount() {
    this.unbind = bindEvents(window, [
      {
        eventName: 'error',
        fn: this.onWindowError,
      },
    ]);
  }

  componentDidCatch(err: Error) {
    if (err instanceof RbdInvariant) {
      if (process.env.NODE_ENV !== 'production') {
        error(err.message);
      }

      this.setState({});
      return;
    }

    // throwing error for other error boundaries
    // eslint-disable-next-line no-restricted-syntax
    throw err;
  }

  componentWillUnmount() {
    this.unbind();
  }

  onWindowError = (event: ErrorEvent) => {
    const callbacks: AppCallbacks = this.getCallbacks();

    if (callbacks.isDragging()) {
      callbacks.tryAbort();
      warning(`
        An error was caught by our window 'error' event listener while a drag was occurring.
        The active drag has been aborted.
      `);
    }

    const err: ?Error = event.error;

    if (err instanceof RbdInvariant) {
      // Marking the event as dealt with.
      // This will prevent any 'uncaught' error warnings in the console
      event.preventDefault();
      if (process.env.NODE_ENV !== 'production') {
        error(err.message);
      }
    }
  };

  getCallbacks = (): AppCallbacks => {
    if (!this.callbacks) {
      // eslint-disable-next-line no-restricted-syntax
      throw new Error('Unable to find AppCallbacks in <ErrorBoundary/>');
    }
    return this.callbacks;
  };

  setCallbacks = (callbacks: AppCallbacks) => {
    this.callbacks = callbacks;
  };

  render() {
    return this.props.children(this.setCallbacks);
  }
}
