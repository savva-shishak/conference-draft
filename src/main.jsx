import 'react-toastify/dist/ReactToastify.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.scss';
import { BrowserRouter as Router } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import App from './App';
import { User } from './core/context/user/User';
import { Http } from './core/context/http';
import { Files } from './core/context/files';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Router>
    <ToastContainer />
    <User>
      <Http>
        <Files>
          <App />
        </Files>
      </Http>
    </User>
  </Router>,
);
