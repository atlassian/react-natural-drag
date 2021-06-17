// @flow
import * as React from 'react';
import { peerDependencies } from '../../../package.json';
import checkReactVersion from './check-react-version';
import checkDoctype from './check-doctype';
import useDevSetupWarning from '../use-dev-setup-warning';

export default function useStartupValidation() {
  useDevSetupWarning(() => {
    checkReactVersion(peerDependencies.react, React.version);
    checkDoctype(document);
  }, []);
}
