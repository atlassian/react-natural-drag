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
          <ScrollableItem isCombineEnabled {...extra} />
        </WithAppContext>
      )}
    </PassThroughProps>,
  );
  // not called yet
  expect(marshal.updateDroppableIsCombineEnabled).not.toHaveBeenCalled();

  const callbacks: DroppableCallbacks = registerSpy.mock.calls[0][0].callbacks;
  callbacks.getDimensionAndWatchScroll(preset.windowScroll, scheduled);

  // changing to false
  wrapper.setProps({
    isCombineEnabled: false,
  });
  expect(marshal.updateDroppableIsCombineEnabled).toHaveBeenCalledTimes(1);
  expect(marshal.updateDroppableIsCombineEnabled).toHaveBeenCalledWith(
    preset.home.descriptor.id,
    false,
  );
  // $FlowFixMe
  marshal.updateDroppableIsCombineEnabled.mockClear();

  // now setting to true
  wrapper.setProps({
    isCombineEnabled: true,
  });
  expect(marshal.updateDroppableIsCombineEnabled).toHaveBeenCalledTimes(1);
  expect(marshal.updateDroppableIsCombineEnabled).toHaveBeenCalledWith(
    preset.home.descriptor.id,
    true,
  );
});

it('should not publish updates to the enabled state when there is no drag', () => {
  const marshal: DimensionMarshal = getMarshalStub();
  const registry: Registry = createRegistry();
  const wrapper = mount(
    <PassThroughProps>
      {(extra) => (
        <WithAppContext marshal={marshal} registry={registry}>
          <ScrollableItem isCombineEnabled {...extra} />,
        </WithAppContext>
      )}
    </PassThroughProps>,
  );

  // not called yet
  expect(marshal.updateDroppableIsCombineEnabled).not.toHaveBeenCalled();

  // no yet dragging

  wrapper.setProps({
    isCombineEnabled: false,
  });

  expect(marshal.updateDroppableIsCombineEnabled).not.toHaveBeenCalled();
});

it('should not publish updates when there is no change', () => {
  const marshal: DimensionMarshal = getMarshalStub();
  const registry: Registry = createRegistry();
  const registerSpy = jest.spyOn(registry.droppable, 'register');
  const wrapper = mount(
    <PassThroughProps>
      {(extra) => (
        <WithAppContext marshal={marshal} registry={registry}>
          <ScrollableItem isCombineEnabled {...extra} />,
        </WithAppContext>
      )}
    </PassThroughProps>,
  );

  // not called yet
  expect(marshal.updateDroppableIsCombineEnabled).not.toHaveBeenCalled();
  const callbacks: DroppableCallbacks = registerSpy.mock.calls[0][0].callbacks;
  callbacks.getDimensionAndWatchScroll(preset.windowScroll, scheduled);

  // no change
  wrapper.setProps({
    isCombineEnabled: true,
  });

  expect(marshal.updateDroppableIsCombineEnabled).not.toHaveBeenCalled();
  // $FlowFixMe
  marshal.updateDroppableIsCombineEnabled.mockReset();

  forceUpdate(wrapper);
  expect(marshal.updateDroppableIsCombineEnabled).not.toHaveBeenCalled();
});
