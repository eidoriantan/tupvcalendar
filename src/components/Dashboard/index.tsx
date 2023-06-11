
import React from 'react';
import { Navigate } from 'react-router-dom';

import type { TokenPayload } from '../../types';
import DashboardUser from '../DashboardUser';
import DashboardAdmin from '../DashboardAdmin';

class Dashboard extends React.Component {
  render () {
    const token = localStorage.getItem('token');
    const payloadStr = localStorage.getItem('payload');

    if (token === null || payloadStr === null) return <Navigate to="/" />;
    const payload: TokenPayload = JSON.parse(payloadStr);

    return payload.type === 'admin' ? <DashboardAdmin /> : <DashboardUser />;
  }
}

export default Dashboard;
