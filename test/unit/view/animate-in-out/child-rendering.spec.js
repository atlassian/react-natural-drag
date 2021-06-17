// @flow
import * as React from 'react';
import { render, act } from '@testing-library/react';
import AnimateInOut, {
  type AnimateProvided,
} from '../../../../src/view/animate-in-out/animate-in-out';

type ChildProps = {|
  provided: AnimateProvided,
|};

class Child extends React.Component<ChildProps> {
  render() {
    return <div>{this.props.provided.animate}</div>;
  }
}

it('should render children', () => {
  const { getByText } = render(
    <AnimateInOut on="hey" shouldAnimate={false}>
      {(provided: AnimateProvided) => <Child provided={provided} />}
    </AnimateInOut>,
  );

  expect(getByText('none')).toBeTruthy();
});

it('should allow children not to be rendered', () => {
  {
    const { unmount, container } = render(
      <AnimateInOut on={null} shouldAnimate={false}>
        {(provided: AnimateProvided) => <Child provided={provided} />}
      </AnimateInOut>,
    );

    expect(container.innerHTML).toEqual('');
    unmount();
  }
  // initial animation set to true
  {
    const { container, unmount } = render(
      <AnimateInOut on={null} shouldAnimate>
        {(provided: AnimateProvided) => <Child provided={provided} />}
      </AnimateInOut>,
    );

    expect(container.innerHTML).toEqual('');
    unmount();
  }
});

it('should allow children not to be rendered after a close animation', () => {
  const child = jest
    .fn()
    .mockImplementation((provided: AnimateProvided) => (
      <Child provided={provided} />
    ));

  type Props = {|
    on: ?mixed,
    shouldAnimate: boolean,
  |};
  function App({ on, shouldAnimate }: Props) {
    return (
      <AnimateInOut on={on} shouldAnimate={shouldAnimate}>
        {(provided: AnimateProvided) => child(provided)}
      </AnimateInOut>
    );
  }

  const { rerender, container } = render(<App on="hey" shouldAnimate />);
  expect(container.textContent).toEqual('open');

  // data is gone - will animate closed
  rerender(<App on={null} shouldAnimate />);
  expect(container.textContent).toEqual('close');

  // letting animate-in-out know that the animation is finished
  act(() => {
    child.mock.calls[child.mock.calls.length - 1][0].onClose();
  });

  expect(container.innerHTML).toEqual('');
});
