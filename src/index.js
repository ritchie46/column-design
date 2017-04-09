import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import "./column_nen_en.js"

ReactDOM.render(
  <App values={{UC: 1, Ned: 200, M1:0, M2: 0, l0:2, rho:2, phi_eff: 2.5}}/>,
  document.getElementById('root')
);
