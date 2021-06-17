// @flow
import { mount } from 'enzyme';
import * as React from 'react';
import type { DimensionMarshal } from '../../../../src/state/dimension-marshal/dimension-marshal-types';
import { getMarshalStub } from '../../../util/dimension-marshal';
import { setViewport } from '../../../util/viewport';
import {
  preset,
  scheduled,
  ScrollableItem,
  WithAppContext,
} from './util/shared';
import forceUpdate from '../../../util/force-update';
import PassThroughProps from '../../../util/pass-through-props';
import type {
  Registry,
  DroppableCallbacks,
} from '../../../../src/state/registry/registry-types';
import createRegistry from '../../../../src/state/registry/create-registry';

setViewport(preset.viewport);

it('should publish updates to the enabled state when dragging', () => {
  const marshal: DimensionMarshal = getMarshalStub();
  const registry: Registry = createRegistry();
  const registerSpy = jest.spyOn(registry.droppable, 'register');
  const wrapper = mount(
    <PassThroughProps>
      {(extra) => (
        <WithAppContext marshal={marshal} registry={registry}>
          <ScrollableItem isDropDisabled={false} {...extra} />
        </WithAppContext>
      )}
    </PassThroughProps>,
  );
  // not called yet
  expect(marshal.updateDroppableIsEnabled).not.toHaveBeenCalled();

  const callbacks: DroppableCallbacks = registerSpy.mock.calls[0][0].callbacks;
  callbacks.getDimensionAndWatchScroll(preset.windowScroll, scheduled);

  const isDropDisabled: boolean = true;
  wrapper.setProps({
    isDropDisabled,
  });

  expect(marshal.updateDroppableIsEnabled).toHaveBeenCalledTimes(1);
  expect(marshal.updateDroppableIsEnabled).toHaveBeenCalledWith(
    preset.home.descriptor.id,
    !isDropDisabled,
  );
});

it('should not publish updates to the enabled state when there is no drag', () => {
  const marshal: DimensionMarshal = getMarshalStub();
  const registry: Registry = createRegistry();
  const wrapper = mount(
    <PassThroughProps>
      {(extra) => (
        <WithAppContext marshal={marshal} registry={registry}>
          <ScrollableItem isDropDisabled={false} {...extra} />
        </WithAppContext>
      )}
    </PassThroughProps>,
  );

  // not called yet
  expect(marshal.updateDroppableIsEnabled).not.toHaveBeenCalled();

  // no yet dragging

  wrapper.setProps({
    isDropDisabled: true,
  });

  expect(marshal.updateDroppableIsEnabled).not.toHaveBeenCalled();
});

it('should not publish updates when there is no change', () => {
  const marshal: DimensionMarshal = getMarshalStub();
  const registry: Registry = createRegistry();
  const registerSpy = jest.spyOn(registry.droppable, 'register');
  const wrapper = mount(
    <PassThroughProps>
      {(extra) => (
        <WithAppContext marshal={marshal} registry={registry}>
          <ScrollableItem isDropDisabled={false} {...extra} />
        </WithAppContext>
      )}
    </PassThroughProps>,
  );

  // not called yet
  expect(marshal.updateDroppableIsEnabled).not.toHaveBeenCalled();
  const callbacks: DroppableCallbacks = registerSpy.mock.calls[0][0].callbacks;
  callbacks.getDimensionAndWatchScroll(preset.windowScroll, scheduled);

  // no change
  wrapper.setProps({
    isDropDisabled: false,
  });

  expect(marshal.updateDroppableIsEnabled).not.toHaveBeenCalled();
  // $ExpectError
  marshal.updateDroppableIsEnabled.mockReset();

  forceUpdate(wrapper);
  expect(marshal.updateDroppableIsEnabled).not.toHaveBeenCalled();
});
