// @flow
import * as React from 'react';
import { render } from '@testing-library/react';
import { invariant } from '../../../src/invariant';
import type { Announce, ContextId } from '../../../src/types';
import useAnnouncer from '../../../src/view/use-announcer';
import { getId } from '../../../src/view/use-announcer/use-announcer';

jest.useFakeTimers();

type Props = {|
  contextId: ContextId,
  children: (announce: Announce) => React.Node,
|};

function WithAnnouncer(props: Props) {
  const announce: Announce = useAnnouncer(props.contextId);
  return props.children(announce);
}

const getAnnounce = (myMock): Announce => myMock.mock.calls[0][0];
const getMock = () => jest.fn().mockImplementation(() => null);

// A little helper as react-testing-library does not have a getById function
const getElement = (contextId: ContextId): ?HTMLElement =>
  document.getElementById(getId(contextId));

it('should create a new element when mounting', () => {
  render(<WithAnnouncer contextId="5">{getMock()}</WithAnnouncer>);

  const el: ?HTMLElement = getElement('5');

  expect(el).toBeTruthy();
});

it('should apply the appropriate aria attributes and non visibility styles', () => {
  render(<WithAnnouncer contextId="5">{getMock()}</WithAnnouncer>);

  const el: ?HTMLElement = getElement('5');
  invariant(el, 'Cannot find node');

  expect(el.getAttribute('aria-live')).toBe('assertive');
  expect(el.getAttribute('aria-atomic')).toBe('true');

  // not checking all the styles - just enough to know we are doing something
  expect(el.style.overflow).toBe('hidden');
});

it('should remove the element when unmounting after a timeout', () => {
  const { unmount } = render(
    <WithAnnouncer contextId="5">{getMock()}</WithAnnouncer>,
  );

  unmount();
  // not unmounted straight away
  expect(getElement('5')).toBeTruthy();

  jest.runOnlyPendingTimers();
  expect(getElement('5')).not.toBeTruthy();
});

it('should set the text content of the announcement element', () => {
  // arrange
  const mock = getMock();
  render(<WithAnnouncer contextId="6">{mock}</WithAnnouncer>);
  const el: ?HTMLElement = getElement('6');
  invariant(el, 'Could not find announcer');

  // act
  const announce: Announce = getAnnounce(mock);
  announce('test');

  // assert
  expect(el.textContent).toBe('test');
});
