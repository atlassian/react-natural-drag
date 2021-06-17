// @flow
import * as React from 'react';
import { render } from '@testing-library/react';
import type { SensorAPI, Sensor } from '../../../../../src/types';
import { forEachSensor, type Control, simpleLift } from '../../util/controls';
import { isDragging } from '../../util/helpers';
import App from '../../util/app';
import { invariant } from '../../../../../src/invariant';

forEachSensor((control: Control) => {
  // keyboard has no pre lift
  if (control.name === 'keyboard') {
    return;
  }

  it('should cleanup a drag if a lock is forceably released mid drag', () => {
    let api: SensorAPI;
    const sensor: Sensor = (value: SensorAPI) => {
      api = value;
    };

    const { getByText } = render(<App sensors={[sensor]} />);
    const handle: HTMLElement = getByText('item: 0');
    invariant(api);

    control.preLift(handle);

    // lock is claimed but not dragging yet
    expect(api.isLockClaimed()).toBe(true);
    expect(isDragging(handle)).toBe(false);

    api.tryReleaseLock();

    expect(isDragging(handle)).toBe(false);
    expect(api.isLockClaimed()).toBe(false);

    // a lift after a released lock can get the lock all good
    simpleLift(control, handle);
    expect(api.isLockClaimed()).toBe(true);
    expect(isDragging(handle)).toBe(true);
  });
});
