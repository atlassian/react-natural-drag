// @flow
import * as React from 'react';
import { render } from '@testing-library/react';
import { invariant } from '../../../../../src/invariant';
import type {
  SensorAPI,
  PreDragActions,
  SnapDragActions,
  Sensor,
} from '../../../../../src/types';
import App from '../../util/app';

it('should not allow double lifting', () => {
  let api: SensorAPI;
  const a: Sensor = (value: SensorAPI) => {
    api = value;
  };
  render(<App sensors={[a]} />);
  invariant(api, 'expected first to be set');

  const preDrag: ?PreDragActions = api.tryGetLock('0');
  invariant(preDrag);
  // it is currently active
  expect(preDrag.isActive()).toBe(true);

  const drag: SnapDragActions = preDrag.snapLift();

  expect(() => preDrag.fluidLift({ x: 0, y: 0 })).toThrow();
  // original lock is gone
  expect(drag.isActive()).toBe(false);

  // yolo
  expect(() => preDrag.snapLift()).toThrow();
});
