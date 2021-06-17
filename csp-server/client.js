// @flow
/* eslint-env browser */

import * as React from 'react';
import { hydrate } from 'react-dom';
import Sample from './app';

const root: Element | null = document.getElementById('root');

let nonce = null;

const cspEl = document.getElementById('csp-nonce');
if (cspEl) {
  nonce = cspEl.getAttribute('content');
}

if (root) {
  hydrate(<Sample nonce={nonce} />, root);
}
