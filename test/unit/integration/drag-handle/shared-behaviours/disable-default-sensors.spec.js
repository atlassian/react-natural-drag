// @flow
import * as React from 'react';
import { render } from '@testing-library/react';
import { isDragging } from '../../util/helpers';
import App from '../../util/app';
import { forEachSensor, type Control, simpleLift } from '../../util/controls';

forEachSensor((control: Control) => {
  it('should be able to start a drag if default sensors is disabled', () => {
    const { getByText } = render(<App enableDefaultSensors={false} />);
    const handle: HTMLElement = getByText('item: 0');

    simpleLift(control, handle);
    expect(isDragging(handle)).toBe(false);
  });
});
