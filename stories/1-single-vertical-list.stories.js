// @flow
import React from 'react';
import { storiesOf } from '@storybook/react';
import styled from '@emotion/styled';
import QuoteApp from './src/vertical/quote-app';
import QuoteAppTrap from './src/vertical/quote-app-trap';
import { quotes, getQuotes } from './src/data';
import { grid } from './src/constants';

const data = {
  small: quotes,
  medium: getQuotes(40),
  large: getQuotes(500),
};

const ScrollContainer = styled.div`
  box-sizing: border-box;
  background: lightgrey;
  padding: ${grid * 2}px;
  overflow-y: scroll;
  width: 500px;
  height: 100vh;
  position: relative;
`;

const Title = styled.h4`
  text-align: center;
  margin-bottom: ${grid}px;
`;

storiesOf('single vertical list', module)
  .add('basic', () => <QuoteApp initial={data.small} />)
  .add('large data set', () => <QuoteApp initial={data.large} />)
  .add('Droppable is a scroll container', () => (
    <QuoteApp
      initial={data.medium}
      listStyle={{
        overflowY: 'scroll',
        maxHeight: '80vh',
        position: 'relative',
      }}
    />
  ))
  .add('window scrolling and a Droppable scroll container', () => (
    <QuoteApp
      initial={data.medium}
      listStyle={{
        overflowY: 'scroll',
        maxHeight: '120vh',
        position: 'relative',
      }}
    />
  ))
  .add('trapped drag', () => (
    <QuoteAppTrap
      initial={data.medium}
      listStyle={{
        overflowY: 'scroll',
        maxHeight: '120vh',
        position: 'relative',
      }}
    />
  ))
  .add('within a larger scroll container', () => (
    <ScrollContainer>
      <Title>List is within a larger scroll container</Title>
      <QuoteApp initial={data.medium} />
    </ScrollContainer>
  ))
  .add('with combine enabled', () => (
    <QuoteApp initial={data.small} isCombineEnabled />
  ));
