// @flow
import { find, toArray } from '../../native-with-fallback';
import type { PredicateFn } from '../../native-with-fallback';

// declaring composedPath manually, seems it is not defined on Event yet
type EventWithComposedPath = Event & {
  composedPath?: () => HTMLElement[],
};

export function getEventTarget(event: EventWithComposedPath): ?EventTarget {
  // TODO draggables&droppables containing shadowRoot
  const target = event.composedPath && event.composedPath()[0];
  return target || event.target;
}

export function getEventTargetRoot(event: ?EventWithComposedPath): Node {
  const source = event && event.composedPath && event.composedPath()[0];
  const root = source && source.getRootNode();
  return root || document;
}

export function queryElements(
  ref: ?Node,
  selector: string,
  filterFn: PredicateFn<Element>,
): ?Element {
  const rootNode: any = ref && ref.getRootNode();
  const documentOrShadowRoot: ShadowRoot | Document =
    rootNode && rootNode.querySelectorAll ? rootNode : document;
  const possible = toArray(documentOrShadowRoot.querySelectorAll(selector));
  const filtered = find(possible, filterFn);
  // TODO in case nothing was found here, we could recursively try the next parent document fragment
  //      this would be useful for dnd between different shadowRoot contents or in case this library is already being
  //      used with shadow roots inside draggables&droppables
  return filtered;
}
