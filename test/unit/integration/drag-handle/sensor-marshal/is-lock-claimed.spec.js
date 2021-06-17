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

  render(
    <React.Fragment>
      <App sensors={[a, b]} />
    </React.Fragment>,
  );
  invariant(first && second);

  // both sensors know that the lock is not claimed
  expect(first.isLockClaimed()).toBe(false);
  expect(second.isLockClaimed()).toBe(false);

  const preDrag: ?PreDragActions = first.tryGetLock('0');
  expect(preDrag).toBeTruthy();

  // both sensors can know if the lock is claimed
  expect(first.isLockClaimed()).toBe(true);
  expect(second.isLockClaimed()).toBe(true);
});
