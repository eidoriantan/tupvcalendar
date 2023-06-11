
import React from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

import Header, { Link } from '../Header';
import './style.scss';

interface UserProps {}

interface UserState {
  name: string;
  studentid: string;
  username: string;
  'current-password': string;
  'new-password': string;
  'verify-password': string;
  updating: boolean;
  error: string;
}

class User extends React.Component<UserProps, UserState> {
  constructor (props: UserProps) {
    super(props);

    this.state = {
      name: '',
      studentid: '',
      username: '',
      'current-password': '',
      'new-password': '',
      'verify-password': '',
      updating: false,
      error: ''
    };

    this.handleInput = this.handleInput.bind(this);
    this.updatePassword = this.updatePassword.bind(this);
  }

  handleInput (event: React.ChangeEvent) {
    const target = event.target as HTMLInputElement;
    const state = this.state as any;
    state[target.name] = target.value;
    this.setState(state);
  }

  async updatePassword (event: React.FormEvent) {
    event.preventDefault();

    const token = localStorage.getItem('token');
    if (token === null) return;

    this.setState({ updating: false, error: '' });

    const form = event.target as HTMLFormElement;
    const newPassword = this.state['new-password'];
    const verifyPassword = this.state['verify-password'];
    if (newPassword !== verifyPassword) {
      return this.setState({
        updating: false,
        error: 'Password does not match'
      });
    }

    const data = {
      currentPassword: this.state['current-password'],
      newPassword
    };

    const response = await axios.post(form.action, data, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.data.success) {
      this.setState({
        'current-password': '',
        'new-password': '',
        'verify-password': '',
        updating: false
      });
    } else {
      this.setState({
        updating: false,
        error: response.data.message
      });
    }
  }

  async componentDidMount () {
    const token = localStorage.getItem('token');
    if (token === null) return;

    const backend = process.env.REACT_APP_BACKEND;
    const response = await axios.get(`${backend}/user`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.data.success) {
      const user = response.data.user;
      this.setState({
        name: user.name,
        studentid: user.studentid,
        username: user.username
      });
    }
  }

  render () {
    const token = localStorage.getItem('token');
    if (token === null) return <Navigate to="/logout" />;

    const backend = process.env.REACT_APP_BACKEND;
    const links: Link[] = [
      {
        href: '/dashboard',
        name: 'Home'
      },
      {
        href: '/user',
        name: 'User'
      },
      {
        href: '/logout',
        name: 'Log Out'
      }
    ];

    return (
      <React.Fragment>
        <Header links={links} />

        <main>
          <div className="user-container w-75 mx-auto mt-5">
            <div className="card">
              <form action={`${backend}/user`} method="post" className="card-body" onSubmit={this.updatePassword}>
                <h5>Edit User</h5>
                <div className="form-group mb-2">
                  <label htmlFor="name">Name:</label>
                  <input type="text" id="name" name="name" value={this.state.name} className="form-control" readOnly />
                </div>

                <div className="form-group mb-2">
                  <label htmlFor="studentid">Student ID:</label>
                  <input type="text" id="studentid" name="studentid" value={this.state.studentid} className="form-control" readOnly />
                </div>

                <div className="form-group mb-2">
                  <label htmlFor="username">Username:</label>
                  <input type="text" id="username" name="username" value={this.state.username} className="form-control" readOnly />
                </div>

                <div className="form-group mb-2">
                  <label htmlFor="current-password">Current Password:</label>
                  <input type="password" id="current-password" name="current-password" value={this.state['current-password']} className="form-control" required onChange={this.handleInput} />
                </div>

                <div className="form-group mb-2">
                  <label htmlFor="new-password">New Password:</label>
                  <input type="password" id="new-password" name="new-password" value={this.state['new-password']} className="form-control" required onChange={this.handleInput} />
                </div>

                <div className="form-group mb-2">
                  <label htmlFor="verify-password">Verify Password:</label>
                  <input type="password" id="verify-password" name="verify-password" value={this.state['verify-password']} className="form-control" required onChange={this.handleInput} />
                </div>

                { this.state.error !== '' && <div className="alert alert-danger">{ this.state.error }</div> }

                <button type="submit" className="btn btn-primary w-100" disabled={this.state.updating}>
                  { this.state.updating ? 'Updating...' : 'Update password' }
                </button>
              </form>
            </div>
          </div>
        </main>
      </React.Fragment>
    );
  }
}

export default User;
