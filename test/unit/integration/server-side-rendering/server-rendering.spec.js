/**
 * @jest-environment node
 */
// @flow
import * as React from 'react';
import { renderToString, renderToStaticMarkup } from 'react-dom/server';
import { invariant } from '../../../../src/invariant';
import { resetServerContext } from '../../../../src';
import App from '../util/app';

const consoleFunctions: string[] = ['warn', 'error', 'log'];

beforeEach(() => {
  // Reset server context between tests to prevent state being shared between them
  resetServerContext();
  consoleFunctions.forEach((name: string) => {
    jest.spyOn(console, name);
  });
});

afterEach(() => {
  consoleFunctions.forEach((name: string) => {
    // eslint-disable-next-line no-console
    console[name].mockRestore();
  });
});

const expectConsoleNotCalled = () => {
  consoleFunctions.forEach((name: string) => {
    // eslint-disable-next-line no-console
    expect(console[name]).not.toHaveBeenCalled();
  });
};

// Checking that the browser globals are not available in this test file
invariant(
  typeof window === 'undefined' && typeof document === 'undefined',
  'browser globals found in node test',
);

it('should support rendering to a string', () => {
  const result: string = renderToString(<App />);

  expect(result).toEqual(expect.any(String));
  expect(result).toMatchSnapshot();
  expectConsoleNotCalled();
});

it('should support rendering to static markup', () => {
  const result: string = renderToStaticMarkup(<App />);

  expect(result).toEqual(expect.any(String));
  expect(result).toMatchSnapshot();
  expectConsoleNotCalled();
});

it('should render identical content when resetting context between renders', () => {
  const firstRender = renderToString(<App />);
  const nextRenderBeforeReset = renderToString(<App />);
  expect(firstRender).not.toEqual(nextRenderBeforeReset);

  resetServerContext();
  const nextRenderAfterReset = renderToString(<App />);
  expect(firstRender).toEqual(nextRenderAfterReset);
  expectConsoleNotCalled();
});
