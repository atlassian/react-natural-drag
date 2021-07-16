// @flow
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import retargetEvents from 'react-shadow-dom-retarget-events';

export const ShadowRootContext = React.createContext<?HTMLElement>(null);

class MyCustomElement extends HTMLElement {
  content: React.Node;
  root: ShadowRoot;
  appContainer: HTMLElement;

  mountComponent() {
    if (!this.appContainer) {
      this.root = this.attachShadow({ mode: 'open' });
      this.appContainer = document.createElement('div');
      this.root.appendChild(this.appContainer);
    }

    if (this.content) {
      ReactDOM.render(
        <ShadowRootContext.Provider value={this.appContainer}>
          {this.content}
        </ShadowRootContext.Provider>,
        this.appContainer,
      );

      // needed for React versions before 17
      retargetEvents(this.root);
    }
  }

  unmountComponent() {
    if (this.appContainer) {
      ReactDOM.unmountComponentAtNode(this.appContainer);
    }
  }

  setContent(content: React.Node) {
    this.content = content;
    this.updateComponent();
  }

  updateComponent() {
    this.unmountComponent();
    this.mountComponent();
  }

  connectedCallback() {
    this.mountComponent();
  }

  disconnectedCallback() {
    this.unmountComponent();
  }
}

customElements.define('my-custom-element', MyCustomElement);

class CompoundCustomElement extends HTMLElement {
  childComponent: MyCustomElement;
  root: ShadowRoot;

  constructor() {
    super();
    this.root = this.attachShadow({ mode: 'open' });
    this.childComponent = (document.createElement('my-custom-element'): any);
    this.root.appendChild(this.childComponent);
  }
}

customElements.define('compound-custom-element', CompoundCustomElement);

export function inShadowRoot(child: React.Node) {
  return (
    <my-custom-element
      // $FlowFixMe - flow can neither infer nor cast the type of the custom element
      ref={(node: ?MyCustomElement) => {
        if (node) {
          node.setContent(child);
        }
      }}
    />
  );
}

export function inNestedShadowRoot(child: React.Node) {
  return (
    <compound-custom-element
      // $FlowFixMe - flow can neither infer nor cast the type of the custom element
      ref={(node: ?CompoundCustomElement) => {
        if (node) {
          node.childComponent.setContent(child);
        }
      }}
    />
  );
}
