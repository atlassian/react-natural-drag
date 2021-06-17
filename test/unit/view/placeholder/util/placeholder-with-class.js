// @flow
import * as React from 'react';
import { WithoutMemo } from '../../../../../src/view/placeholder/placeholder';
import type { Props } from '../../../../../src/view/placeholder/placeholder';

// enzyme does not work well with memo, so exporting the non-memo version
// Using PureComponent to match behaviour of React.memo
export default class PlaceholderWithClass extends React.PureComponent<Props> {
  render() {
    return <WithoutMemo {...this.props} />;
  }
}
