// @flow
/* eslint-disable react/no-multi-comp */
import { mount } from 'enzyme';
import * as React from 'react';
import type { DroppableDescriptor } from '../../../../src/types';
import forceUpdate from '../../../util/force-update';
import { preset, ScrollableItem, WithAppContext } from './util/shared';
import { setViewport } from '../../../util/viewport';
import PassThroughProps from '../../../util/pass-through-props';
import type {
  Registry,
  DroppableEntry,
} from '../../../../src/state/registry/registry-types';
import createRegistry from '../../../../src/state/registry/create-registry';

setViewport(preset.viewport);

it('should register itself when mounting', () => {
  const registry: Registry = createRegistry();
  const registerSpy = jest.spyOn(registry.droppable, 'register');

  mount(
    <WithAppContext registry={registry}>
      <ScrollableItem />
    </WithAppContext>,
  );

  expect(registerSpy).toHaveBeenCalledTimes(1);

  // $ExpectError: using awesome matchers
  const expected: DroppableEntry = {
    uniqueId: expect.any(String),
    descriptor: preset.home.descriptor,
    callbacks: expect.any(Object),
  };

  expect(registerSpy).toHaveBeenCalledWith(expected);
});

it('should unregister itself when unmounting', () => {
  const registry: Registry = createRegistry();
  const registerSpy = jest.spyOn(registry.droppable, 'register');
  const unregisterSpy = jest.spyOn(registry.droppable, 'unregister');

  const wrapper = mount(
    <WithAppContext registry={registry}>
      <ScrollableItem />
    </WithAppContext>,
  );
  expect(registerSpy).toHaveBeenCalled();
  expect(unregisterSpy).not.toHaveBeenCalled();

  const entry = registerSpy.mock.calls[0][0];

  wrapper.unmount();
  expect(unregisterSpy).toHaveBeenCalledTimes(1);
  expect(unregisterSpy).toHaveBeenCalledWith(entry);
});

it('should update its registration when a descriptor property changes', () => {
  const registry: Registry = createRegistry();
  const registerSpy = jest.spyOn(registry.droppable, 'register');
  const unregisterSpy = jest.spyOn(registry.droppable, 'unregister');

  const wrapper = mount(
    <PassThroughProps>
      {(extra) => (
        <WithAppContext registry={registry}>
          <ScrollableItem {...extra} />
        </WithAppContext>
      )}
    </PassThroughProps>,
  );

  // $ExpectError: using awesome matchers
  const expectedFirst: DroppableEntry = {
    uniqueId: expect.any(String),
    descriptor: preset.home.descriptor,
    callbacks: expect.any(Object),
  };

  // asserting shape of original publish
  const first = registerSpy.mock.calls[0][0];
  expect(first).toEqual(expectedFirst);

  registerSpy.mockClear();

  // updating the index
  wrapper.setProps({
    droppableId: 'some-new-id',
  });
  const updated: DroppableDescriptor = {
    ...preset.home.descriptor,
    id: 'some-new-id',
  };

  // old descriptor removed
  expect(unregisterSpy).toHaveBeenCalledTimes(1);
  expect(unregisterSpy).toHaveBeenCalledWith(first);

  // new descriptor added
  // $ExpectError: using awesome matchers
  const expectedSecond: DroppableEntry = {
    uniqueId: first.uniqueId,
    descriptor: updated,
    callbacks: expect.any(Object),
  };
  expect(registerSpy.mock.calls[0][0]).toEqual(expectedSecond);
});

it('should not update its registration when a descriptor property does not change on an update', () => {
  const registry: Registry = createRegistry();
  const registerSpy = jest.spyOn(registry.droppable, 'register');
  const unregisterSpy = jest.spyOn(registry.droppable, 'unregister');

  const wrapper = mount(
    <WithAppContext registry={registry}>
      <ScrollableItem />
    </WithAppContext>,
  );
  expect(registerSpy).toHaveBeenCalledTimes(1);
  expect(unregisterSpy).not.toHaveBeenCalled();
  registerSpy.mockClear();

  forceUpdate(wrapper);
  expect(unregisterSpy).not.toHaveBeenCalled();
  expect(registerSpy).not.toHaveBeenCalled();
});
