// @flow
import * as React from 'react';
import { mount, type ReactWrapper } from 'enzyme';
import type { ContextId } from '../../../../src/types';
import useStyleMarshal from '../../../../src/view/use-style-marshal';
import getStyles, {
  type Styles,
} from '../../../../src/view/use-style-marshal/get-styles';
import type { StyleMarshal } from '../../../../src/view/use-style-marshal/style-marshal-types';
import { prefix } from '../../../../src/view/data-attributes';

const getMarshal = (myMock): StyleMarshal => myMock.mock.calls[0][0];
const getMock = () => jest.fn().mockImplementation(() => null);

type Props = {|
  contextId: ContextId,
  nonce?: string,
  children: (marshal: StyleMarshal) => React.Node,
|};

function WithMarshal(props: Props) {
  const marshal: StyleMarshal = useStyleMarshal(props.contextId, props.nonce);
  return props.children(marshal);
}

const getDynamicStyleTagSelector = (contextId: ContextId) =>
  `style[${prefix}-dynamic="${contextId}"]`;

const getAlwaysStyleTagSelector = (contextId: ContextId) =>
  `style[${prefix}-always="${contextId}"]`;

const getDynamicStyleTag = (contextId: ContextId): HTMLStyleElement => {
  const selector: string = getDynamicStyleTagSelector(contextId);
  const el: HTMLStyleElement = (document.querySelector(selector): any);
  return el;
};

const getAlwaysStyleTag = (contextId: ContextId): HTMLStyleElement => {
  const selector: string = getAlwaysStyleTagSelector(contextId);
  const el: HTMLStyleElement = (document.querySelector(selector): any);
  return el;
};

const getDynamicStyleFromTag = (contextId: ContextId): string => {
  return getDynamicStyleTag(contextId).innerHTML;
};

const getAlwaysStyleFromTag = (contextId: ContextId): string => {
  return getAlwaysStyleTag(contextId).innerHTML;
};

it('should not mount style tags until mounted', () => {
  const contextId: ContextId = '1';
  const dynamicSelector: string = getDynamicStyleTagSelector(contextId);
  const alwaysSelector: string = getAlwaysStyleTagSelector(contextId);

  // initially there is no style tag
  expect(document.querySelector(dynamicSelector)).toBeFalsy();
  expect(document.querySelector(alwaysSelector)).toBeFalsy();

  // now mounting
  const wrapper: ReactWrapper<*> = mount(
    <WithMarshal contextId={contextId}>{getMock()}</WithMarshal>,
  );

  // elements should now exist
  expect(document.querySelector(alwaysSelector)).toBeInstanceOf(
    HTMLStyleElement,
  );
  expect(document.querySelector(dynamicSelector)).toBeInstanceOf(
    HTMLStyleElement,
  );

  wrapper.unmount();
});

it('should apply the resting dyanmic styles by default', () => {
  const contextId: ContextId = '2';
  const wrapper: ReactWrapper<*> = mount(
    <WithMarshal contextId={contextId}>{getMock()}</WithMarshal>,
  );

  const active: string = getDynamicStyleFromTag(contextId);
  expect(active).toEqual(getStyles(`${contextId}`).resting);

  wrapper.unmount();
});

it('should apply the resting always styles by default', () => {
  const contextId: ContextId = '2';
  const wrapper: ReactWrapper<*> = mount(
    <WithMarshal contextId={contextId}>{getMock()}</WithMarshal>,
  );

  const always: string = getAlwaysStyleFromTag(contextId);
  expect(always).toEqual(getStyles(`${contextId}`).always);

  wrapper.unmount();
});

it('should apply the dragging styles when asked', () => {
  const contextId: ContextId = '2';
  const mock = getMock();
  const wrapper: ReactWrapper<*> = mount(
    <WithMarshal contextId={contextId}>{mock}</WithMarshal>,
  );
  const marshal: StyleMarshal = getMarshal(mock);

  marshal.dragging();

  const active: string = getDynamicStyleFromTag(contextId);
  expect(active).toEqual(getStyles(`${contextId}`).dragging);

  wrapper.unmount();
});

it('should apply the drop animating styles when asked', () => {
  const contextId: ContextId = '2';
  const mock = getMock();
  const wrapper: ReactWrapper<*> = mount(
    <WithMarshal contextId={contextId}>{mock}</WithMarshal>,
  );
  const marshal: StyleMarshal = getMarshal(mock);

  marshal.dropping('DROP');
  const active: string = getDynamicStyleFromTag(contextId);
  expect(active).toEqual(getStyles(`${contextId}`).dropAnimating);

  wrapper.unmount();
});

it('should apply the user cancel styles when asked', () => {
  const contextId: ContextId = '2';
  const mock = getMock();
  const wrapper: ReactWrapper<*> = mount(
    <WithMarshal contextId={contextId}>{mock}</WithMarshal>,
  );
  const marshal: StyleMarshal = getMarshal(mock);

  marshal.dropping('CANCEL');
  const active: string = getDynamicStyleFromTag(contextId);
  expect(active).toEqual(getStyles(`${contextId}`).userCancel);

  wrapper.unmount();
});

it('should remove the style tag from the head when unmounting', () => {
  const contextId: ContextId = '2';
  const wrapper: ReactWrapper<*> = mount(
    <WithMarshal contextId={contextId}>{getMock()}</WithMarshal>,
  );
  const selector1: string = getDynamicStyleTagSelector(contextId);
  const selector2: string = getAlwaysStyleTagSelector(contextId);

  // the style tag exists
  expect(document.querySelector(selector1)).toBeTruthy();
  expect(document.querySelector(selector2)).toBeTruthy();

  // now unmounted
  wrapper.unmount();

  expect(document.querySelector(selector1)).not.toBeTruthy();
  expect(document.querySelector(selector2)).not.toBeTruthy();
});

it('should allow subsequent updates', () => {
  const contextId: ContextId = '10';
  const styles: Styles = getStyles(`${contextId}`);
  const mock = getMock();
  const wrapper: ReactWrapper<*> = mount(
    <WithMarshal contextId={contextId}>{mock}</WithMarshal>,
  );
  const marshal: StyleMarshal = getMarshal(mock);

  Array.from({ length: 4 }).forEach(() => {
    marshal.resting();
    expect(getDynamicStyleFromTag(contextId)).toEqual(styles.resting);

    marshal.dragging();
    expect(getDynamicStyleFromTag(contextId)).toEqual(styles.dragging);

    marshal.dropping('DROP');
    expect(getDynamicStyleFromTag(contextId)).toEqual(styles.dropAnimating);
  });

  wrapper.unmount();
});

it('should insert nonce into tag attribute', () => {
  const contextId: ContextId = '2';
  const nonce = 'ThisShouldBeACryptographicallySecurePseudoRandomNumber';
  const mock = getMock();
  const wrapper: ReactWrapper<*> = mount(
    <WithMarshal contextId={contextId} nonce={nonce}>
      {mock}
    </WithMarshal>,
  );
  const dynamicStyleTag = getDynamicStyleTag(contextId);
  const dynamicStyleTagNonce = dynamicStyleTag
    ? dynamicStyleTag.getAttribute('nonce')
    : '';
  const alwaysStyleTag = getAlwaysStyleTag(contextId);
  const alwaysStyleTagNonce = alwaysStyleTag
    ? alwaysStyleTag.getAttribute('nonce')
    : '';

  // the style tag exists
  expect(dynamicStyleTagNonce).toEqual(nonce);
  expect(alwaysStyleTagNonce).toEqual(nonce);

  // now unmounted
  wrapper.unmount();
});
