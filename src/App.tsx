
import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Users from './components/Users';
import User from './components/User';
import Logout from './components/Logout';

class App extends React.Component {
  render () {
    return (
      <Routes>
        <Route path="/">
          <Route index element={<Login />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="user" element={<User />} />
          <Route path="logout" element={<Logout />} />
        </Route>
      </Routes>
    );
  }
}

export default App;
