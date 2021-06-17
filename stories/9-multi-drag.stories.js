// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import TaskApp from './src/multi-drag/task-app';

storiesOf('Multi drag', module).add('pattern', () => <TaskApp />);
