import {StrictMode, createElement} from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js';
ReactDOM.createRoot(document.getElementById('root')).render(createElement(
  StrictMode,
  null,
  createElement(
    App,
    null
  ),
));
