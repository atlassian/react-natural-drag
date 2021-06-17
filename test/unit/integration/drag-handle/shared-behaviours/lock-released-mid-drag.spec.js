// @flow
import * as React from 'react';
import { render } from '@testing-library/react';
import type { SensorAPI, Sensor } from '../../../../../src/types';
import { forEachSensor, type Control, simpleLift } from '../../util/controls';
import { isDragging } from '../../util/helpers';
import App from '../../util/app';
import { invariant } from '../../../../../src/invariant';

forEachSensor((control: Control) => {
  it('should cleanup a drag if a lock is forceably released mid drag', () => {
    let api: SensorAPI;
    const sensor: Sensor = (value: SensorAPI) => {
      api = value;
    };

    const { getByText } = render(<App sensors={[sensor]} />);
    const handle: HTMLElement = getByText('item: 0');
    invariant(api);

    simpleLift(control, handle);

    expect(api.isLockClaimed()).toBe(true);
    expect(isDragging(handle)).toBe(true);

    api.tryReleaseLock();

    expect(api.isLockClaimed()).toBe(false);
    expect(isDragging(handle)).toBe(false);

    // allowing reclaiming after
    simpleLift(control, handle);

    expect(api.isLockClaimed()).toBe(true);
    expect(isDragging(handle)).toBe(true);
  });
});
