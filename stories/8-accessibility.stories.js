// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import TaskApp from './src/accessible/task-app';

storiesOf('Accessibility', module).add('single list', () => <TaskApp />);
