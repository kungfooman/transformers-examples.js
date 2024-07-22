import {createElement} from 'react';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js';
import {TypePanel} from '@runtime-type-inspector/runtime';
import 'display-anything/src/style.js';
const div = document.getElementById('root');
ReactDOM.createRoot(div).render(
  createElement(
    React.StrictMode,
    null,
    createElement(
      App,
      null
    ),
  ),
);
const typePanel = new TypePanel;
export {typePanel};
window.typePanel = typePanel;
