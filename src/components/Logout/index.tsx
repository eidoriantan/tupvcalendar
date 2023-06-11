
import React from 'react';
import { Navigate } from 'react-router-dom';

class Logout extends React.Component {
  render () {
    localStorage.removeItem('token');
    localStorage.removeItem('payload');
    return <Navigate to="/" />;
  }
}

export default Logout;
