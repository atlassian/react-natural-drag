// @flow
import * as React from 'react';
import { render } from '@testing-library/react';
import type {
  Registry,
  DraggableEntry,
} from '../../../../src/state/registry/registry-types';
import type { DraggableId } from '../../../../src/types';
import { invariant } from '../../../../src/invariant';
import { getPreset } from '../../../util/dimension';
import { getDraggableEntry } from '../../../util/registry';
import useRegistry from '../../../../src/state/registry/use-registry';

const preset = getPreset();

it('should remove any registrations', () => {
  let registry: Registry;
  const entry: DraggableEntry = getDraggableEntry({
    uniqueId: '1',
    dimension: preset.inHome1,
  });
  const id: DraggableId = preset.inHome1.descriptor.id;
  function App() {
    registry = useRegistry();
    return null;
  }

  const { unmount } = render(<App />);
  invariant(registry);

  // initial registration
  registry.draggable.register(entry);
  expect(registry.draggable.exists(id)).toBe(true);

  // still available after a unmount
  unmount();
  expect(registry.draggable.exists(id)).toBe(true);

  // cleared after frame
  requestAnimationFrame.step();
  expect(registry.draggable.exists(id)).toBe(false);
});
