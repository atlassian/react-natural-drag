// @flow
import * as React from 'react';
import checkReactVersion from '../../../../src/view/drag-drop-context/check-react-version';
import { peerDependencies } from '../../../../package.json';

const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

afterEach(() => {
  warn.mockClear();
});

it('should pass if the react peer dep version is met', () => {
  const version: string = '1.3.4';

  checkReactVersion(version, version);

  expect(warn).not.toHaveBeenCalled();
});

it('should pass if the react peer dep version is passed', () => {
  // patch
  {
    const peerDep: string = '1.3.4';
    const actual: string = '1.3.5';

    checkReactVersion(peerDep, actual);

    expect(warn).not.toHaveBeenCalled();
  }
  // minor
  {
    const peerDep: string = '1.3.4';
    const actual: string = '1.4.0';

    checkReactVersion(peerDep, actual);

    expect(warn).not.toHaveBeenCalled();
  }
  // major
  {
    const peerDep: string = '1.3.4';
    const actual: string = '2.0.0';

    checkReactVersion(peerDep, actual);

    expect(warn).not.toHaveBeenCalled();
  }
});

it('should fail if the react peer dep version is not met', () => {
  // patch not met
  {
    const peerDep: string = '1.3.4';
    const actual: string = '1.3.3';

    checkReactVersion(peerDep, actual);

    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockClear();
  }
  // minor not met
  {
    const peerDep: string = '1.3.4';
    const actual: string = '1.2.4';

    checkReactVersion(peerDep, actual);

    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockClear();
  }
  // major not met
  {
    const peerDep: string = '1.3.4';
    const actual: string = '0.3.4';

    checkReactVersion(peerDep, actual);

    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockClear();
  }
});

it('should throw if unable to parse the react version', () => {
  const peerDep: string = '1.3.4';
  const actual: string = '1.x';

  expect(() => checkReactVersion(peerDep, actual)).toThrow();
});

it('should throw if unable to parse the peer dep version', () => {
  const peerDep: string = '1.x';
  const actual: string = '1.2.3';

  expect(() => checkReactVersion(peerDep, actual)).toThrow();
});

it('should allow pre release provided versions', () => {
  const peerDep: string = '1.0.0';
  const alpha: string = '1.2.3-alpha';
  const beta: string = '1.2.3-beta';

  checkReactVersion(peerDep, alpha);
  checkReactVersion(peerDep, beta);

  expect(warn).not.toHaveBeenCalled();
});

// actually an integration test, but this feels like the right place for it
it('should pass on the current repo setup', () => {
  const peerDep: string = peerDependencies.react;
  const actual: string = React.version;

  checkReactVersion(peerDep, actual);

  expect(warn).not.toHaveBeenCalled();
});
