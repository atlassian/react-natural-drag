// @flow
/* eslint-disable es5/no-es6-methods */
/* eslint-disable es5/no-es6-static-methods */
/* eslint-disable no-restricted-globals */

type Map<T> = {
  [key: string]: T,
};

export function isInteger(value: mixed): boolean {
  if (Number.isInteger) {
    return Number.isInteger(value);
  }
  return (
    typeof value === 'number' && isFinite(value) && Math.floor(value) === value
  );
}

// Using this helper to ensure there are correct flow types
// https://github.com/facebook/flow/issues/2221
export function values<T>(map: Map<T>): T[] {
  if (Object.values) {
    // $FlowFixMe - Object.values currently does not have good flow support
    return Object.values(map);
  }

  return Object.keys(map).map((key) => map[key]);
}

// Could also extend to pass index and list
export type PredicateFn<T> = (value: T) => boolean;

// TODO: swap order
export function findIndex<T>(
  list: Array<T>,
  predicate: PredicateFn<T>,
): number {
  if (list.findIndex) {
    return list.findIndex(predicate);
  }

  // Using a for loop so that we can exit early
  for (let i = 0; i < list.length; i++) {
    if (predicate(list[i])) {
      return i;
    }
  }
  // Array.prototype.find returns -1 when nothing is found
  return -1;
}

export function find<T>(list: Array<T>, predicate: PredicateFn<T>): ?T {
  if (list.find) {
    return list.find(predicate);
  }
  const index: number = findIndex(list, predicate);
  if (index !== -1) {
    return list[index];
  }
  // Array.prototype.find returns undefined when nothing is found
  return undefined;
}

// Using this rather than Array.from as Array.from adds 2kb to the gzip
// document.querySelector actually returns Element[], but flow thinks it is HTMLElement[]
// So we downcast the result to Element[]
export function toArray(list: NodeList<HTMLElement>): Element[] {
  return Array.prototype.slice.call(list);
}
