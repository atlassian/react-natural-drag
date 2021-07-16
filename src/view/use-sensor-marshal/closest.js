// @flow
import { find } from '../../native-with-fallback';

const supportedMatchesName: string = ((): string => {
  const base: string = 'matches';

  // Server side rendering
  if (typeof document === 'undefined') {
    return base;
  }

  // See https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API
  const candidates: string[] = [
    base,
    'msMatchesSelector',
    'webkitMatchesSelector',
  ];

  const value: ?string = find(
    candidates,
    (name: string): boolean => name in Element.prototype,
  );

  return value || base;
})();

function closestPonyfill(el: ?Element, selector: string) {
  if (el == null) {
    return null;
  }

  // Element.prototype.matches is supported in ie11 with a different name
  // https://caniuse.com/#feat=matchesselector
  // $FlowFixMe - dynamic property
  if (el[supportedMatchesName](selector)) {
    return el;
  }

  // recursively look up the tree
  return closestPonyfill(el.parentElement, selector);
}

function closestImpl(el: Element, selector: string): ?Element {
  // Using native closest for maximum speed where we can
  if (el.closest) {
    return el.closest(selector);
  }
  // ie11: damn you!
  return closestPonyfill(el, selector);
}

export default function closest(el: ?Element, selector: string): ?Element {
  if (!el || el === document || el === window) {
    return null;
  }
  const found = closestImpl(el, selector);

  if (found) {
    return found;
  }

  const root: ShadowRoot = (el.getRootNode(): any);
  return closest(root.host, selector);
}
