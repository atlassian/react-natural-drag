// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import styled from '@emotion/styled';
import AuthorApp from './src/horizontal/author-app';
import { quotes, getQuotes } from './src/data';
import type { Quote } from './src/types';

const bigData: Quote[] = getQuotes(30);

const WideWindow = styled.div`
  width: 120vw;
`;

storiesOf('single horizontal list', module)
  .add('simple', () => <AuthorApp initial={quotes} />)
  .add('with combine enabled', () => (
    <AuthorApp initial={quotes} isCombineEnabled />
  ))
  .add('with overflow scroll', () => (
    <AuthorApp initial={bigData} internalScroll />
  ))
  .add('with window scroll and overflow scroll', () => (
    <WideWindow>
      <AuthorApp initial={bigData} internalScroll />
    </WideWindow>
  ));
