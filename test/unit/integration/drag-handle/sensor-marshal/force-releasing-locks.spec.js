// @flow
import * as React from 'react';
import { render } from '@testing-library/react';
import { invariant } from '../../../../../src/invariant';
import type {
  SensorAPI,
  Sensor,
  PreDragActions,
} from '../../../../../src/types';
import App from '../../util/app';

it('should correctly state whether a lock is claimed', () => {
  let first: SensorAPI;
  let second: SensorAPI;
  const a: Sensor = (value: SensorAPI) => {
    first = value;
  };
  const b: Sensor = (value: SensorAPI) => {
    second = value;
  };
  const onForceStop = jest.fn();

  render(
    <React.Fragment>
      <App sensors={[a, b]} />
    </React.Fragment>,
  );
  invariant(first);
  invariant(second);

  const preDrag: ?PreDragActions = first.tryGetLock('0', onForceStop);
  expect(preDrag).toBeTruthy();
  expect(second.isLockClaimed()).toBe(true);

  second.tryReleaseLock();
  expect(onForceStop).toHaveBeenCalled();
  // lock is gone
  expect(second.isLockClaimed()).toBe(false);
});
