// @flow
import * as React from 'react';
import { render } from '@testing-library/react';
import { invariant } from '../../../../../src/invariant';
import { isDragging } from '../../util/helpers';
import App from '../../util/app';
import type { SensorAPI } from '../../../../../src/types';
import { forEachSensor, type Control, simpleLift } from '../../util/controls';

forEachSensor((control: Control) => {
  it('should not start a drag if another sensor is capturing', () => {
    let api: SensorAPI;
    function greedy(value: SensorAPI) {
      api = value;
    }
    const { getByText } = render(<App sensors={[greedy]} />);
    const handle: HTMLElement = getByText('item: 0');

    invariant(api, 'Expected function to be set');
    api.tryGetLock('0');

    // won't be able to lift as the lock is already claimed
    simpleLift(control, handle);

    expect(isDragging(handle)).toBe(false);
  });
});
