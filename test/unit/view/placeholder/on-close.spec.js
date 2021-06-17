// @flow
import * as React from 'react';
import { mount, type ReactWrapper } from 'enzyme';
import Placeholder from './util/placeholder-with-class';
import { expectIsFull } from './util/expect';
import getPlaceholderStyle from './util/get-placeholder-style';
import { placeholder } from './util/data';

it('should only fire a single onClose event', () => {
  const onClose = jest.fn();

  const wrapper: ReactWrapper<*> = mount(
    <Placeholder
      contextId="1"
      animate="none"
      placeholder={placeholder}
      onClose={onClose}
      onTransitionEnd={jest.fn()}
    />,
  );
  expectIsFull(getPlaceholderStyle(wrapper));

  wrapper.setProps({
    animate: 'close',
  });

  // $ExpectError - not a complete event
  const height: TransitionEvent = {
    propertyName: 'height',
  };
  wrapper.simulate('transitionend', height);
  expect(onClose).toHaveBeenCalledTimes(1);
  onClose.mockClear();

  // transition events while animate="closed" of different properties will not trigger

  // $ExpectError - not a complete event
  const margin: TransitionEvent = {
    propertyName: 'margin',
  };
  // $ExpectError - not a complete event
  const width: TransitionEvent = {
    propertyName: 'width',
  };
  wrapper.simulate('transitionend', margin);
  wrapper.simulate('transitionend', width);
  expect(onClose).not.toHaveBeenCalled();
});

it('should not fire an onClose if not closing when a transitionend occurs', () => {
  const onClose = jest.fn();

  const wrapper: ReactWrapper<*> = mount(
    <Placeholder
      animate="none"
      contextId="1"
      placeholder={placeholder}
      onClose={onClose}
      onTransitionEnd={jest.fn()}
    />,
  );
  const assert = () => {
    // $ExpectError - not a complete event
    const height: TransitionEvent = {
      propertyName: 'height',
    };
    wrapper.simulate('transitionend', height);
    expect(onClose).not.toHaveBeenCalled();
    onClose.mockClear();
  };
  expectIsFull(getPlaceholderStyle(wrapper));
  assert();

  wrapper.setProps({ animate: 'open' });
  assert();
});
