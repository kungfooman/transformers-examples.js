import {StrictMode, createElement} from 'react';
import {createRoot               } from 'react-dom/client';
import {App                      } from './App.js';
const div = document.getElementById('root');
createRoot(div).render(
  createElement(
    StrictMode,
    null,
    createElement(
      App,
      null
    ),
  ),
);
