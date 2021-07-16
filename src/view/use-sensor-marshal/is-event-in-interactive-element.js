// @flow
import isHtmlElement from '../is-type-of-element/is-html-element';
import { getEventTarget } from '../get-elements/query-elements';

export type TagNameMap = {
  [tagName: string]: true,
};

export const interactiveTagNames: TagNameMap = {
  input: true,
  button: true,
  textarea: true,
  select: true,
  option: true,
  optgroup: true,
  video: true,
  audio: true,
};

function isAnInteractiveElement(parent: Element, current: ?Element) {
  if (current == null) {
    return false;
  }

  // Most interactive elements cannot have children. However, some can such as 'button'.
  // See 'Permitted content' on https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button
  // Rather than having two different functions we can consolidate our checks into this single
  // function to keep things simple.
  // There is no harm checking if the parent has an interactive tag name even if it cannot have
  // any children. We need to perform this loop anyway to check for the contenteditable attribute
  const hasAnInteractiveTag: boolean = Boolean(
    interactiveTagNames[current.tagName.toLowerCase()],
  );

  if (hasAnInteractiveTag) {
    return true;
  }

  // contenteditable="true" or contenteditable="" are valid ways
  // of creating a contenteditable container
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/contenteditable
  const attribute: ?string = current.getAttribute('contenteditable');
  if (attribute === 'true' || attribute === '') {
    return true;
  }

  // nothing more can be done and no results found
  if (current === parent) {
    return false;
  }

  // recursion to check parent
  return isAnInteractiveElement(parent, current.parentElement);
}

export default function isEventInInteractiveElement(
  draggable: Element,
  event: Event,
): boolean {
  const target: ?EventTarget = getEventTarget(event);

  if (!isHtmlElement(target)) {
    return false;
  }

  return isAnInteractiveElement(draggable, target);
}
