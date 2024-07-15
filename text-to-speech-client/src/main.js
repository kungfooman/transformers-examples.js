import {createElement} from 'react';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js';
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
