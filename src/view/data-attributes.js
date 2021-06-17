// @flow
export const prefix: string = 'data-rbd';
export const dragHandle = (() => {
  const base = `${prefix}-drag-handle`;

  return {
    base,
    draggableId: `${base}-draggable-id`,
    contextId: `${base}-context-id`,
  };
})();

export const draggable = (() => {
  const base: string = `${prefix}-draggable`;
  return {
    base,
    contextId: `${base}-context-id`,
    id: `${base}-id`,
  };
})();

export const droppable = (() => {
  const base: string = `${prefix}-droppable`;
  return {
    base,
    contextId: `${base}-context-id`,
    id: `${base}-id`,
  };
})();

export const interactiveElement = {
  base: `${prefix}-is-interactive-element`,
};

export const placeholder = {
  contextId: `${prefix}-placeholder-context-id`,
};

export const scrollContainer = {
  contextId: `${prefix}-scroll-container-context-id`,
};
