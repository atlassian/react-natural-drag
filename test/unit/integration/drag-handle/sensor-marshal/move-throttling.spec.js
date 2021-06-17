// @flow
import * as React from 'react';
import type { Position } from 'css-box-model';
import { render } from '@testing-library/react';
import { invariant } from '../../../../../src/invariant';
import type {
  SensorAPI,
  PreDragActions,
  FluidDragActions,
  Sensor,
} from '../../../../../src/types';
import App from '../../util/app';
import { getOffset } from '../../util/helpers';
import { add } from '../../../../../src/state/position';

function noop() {}

it('should throttle move events by request animation frame', () => {
  let api: SensorAPI;
  const sensor: Sensor = (value: SensorAPI) => {
    api = value;
  };
  const { getByText } = render(<App sensors={[sensor]} />);
  invariant(api, 'expected getter to be set');
  const handle: HTMLElement = getByText('item: 0');

  const preDrag: ?PreDragActions = api.tryGetLock('0', noop);
  invariant(preDrag);

  const initial: Position = { x: 2, y: 3 };
  const actions: FluidDragActions = preDrag.fluidLift(initial);
  // has not moved yet
  expect(getOffset(handle)).toEqual({ x: 0, y: 0 });

  const offset: Position = { x: 1, y: 5 };
  actions.move(add(initial, offset));
  actions.move(add(initial, offset));
  actions.move(add(initial, offset));

  // still not moved
  expect(getOffset(handle)).toEqual({ x: 0, y: 0 });

  // moved after frame
  requestAnimationFrame.step();
  expect(getOffset(handle)).toEqual(offset);
});

it('should cancel any pending moves after a lock is released', () => {
  let api: SensorAPI;
  const a: Sensor = (value: SensorAPI) => {
    api = value;
  };
  const { getByText } = render(<App sensors={[a]} />);
  invariant(api, 'expected api to be set');
  const handle: HTMLElement = getByText('item: 0');

  const preDrag: ?PreDragActions = api.tryGetLock('0', noop);
  invariant(preDrag);

  const initial: Position = { x: 2, y: 3 };
  const actions: FluidDragActions = preDrag.fluidLift(initial);
  // has not moved yet
  expect(getOffset(handle)).toEqual({ x: 0, y: 0 });

  const offset: Position = { x: 1, y: 5 };
  actions.move(add(initial, offset));
  // not moved yet
  expect(getOffset(handle)).toEqual({ x: 0, y: 0 });

  actions.cancel();

  // will not do anything
  requestAnimationFrame.step();
  expect(getOffset(handle)).toEqual({ x: 0, y: 0 });
});
