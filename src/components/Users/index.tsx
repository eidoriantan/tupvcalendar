
import React from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

import type { TokenPayload, User } from '../../types';
import Pagination from '../Pagination';
import Header, { Link } from '../Header';
import './style.scss';

interface UsersProp {}

interface UsersState {
  name: string;
  'student-id': string;
  username: string;
  password: string;
  error: string;
  adding: boolean;
  users: User[];
  pagination: {
    key: number;
    page: number;
    total: number;
  }
}

class Users extends React.Component<UsersProp, UsersState> {
  limit: number;

  constructor (props: UsersProp) {
    super(props);

    this.state = {
      name: '',
      'student-id': '',
      username: '',
      password: '',
      error: '',
      adding: false,
      users: [],
      pagination: {
        key: 0,
        page: 0,
        total: 0
      }
    };

    this.limit = 9;
    this.handleInput = this.handleInput.bind(this);
    this.changePage = this.changePage.bind(this);
    this.loadUsers = this.loadUsers.bind(this);
    this.addUser = this.addUser.bind(this);
    this.deleteUser = this.deleteUser.bind(this);
  }

  handleInput (event: React.ChangeEvent) {
    const target = event.target as HTMLInputElement;
    const state = this.state as any;
    state[target.name] = target.value;
    this.setState(state);
  }

  changePage (page: number) {
    const state = this.state;
    state.pagination.page = page;
    this.setState(state);
  }

  async loadUsers () {
    const token = localStorage.getItem('token');
    if (token === null) return;

    const backend = process.env.REACT_APP_BACKEND;
    const usersRes = await axios.get(`${backend}/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (usersRes.data.success) {
      this.setState({
        users: usersRes.data.users,
        pagination: {
          key: this.state.pagination.key + 1,
          page: 0,
          total: Math.ceil(usersRes.data.users.length / this.limit)
        }
      });
    } else {
      window.alert('Unable to load users');
    }
  }

  async addUser (event: React.FormEvent) {
    event.preventDefault();

    const token = localStorage.getItem('token');
    if (token === null) return;

    this.setState({ adding: false, error: '' });

    const form = event.target as HTMLFormElement;
    const data = {
      name: this.state.name,
      studentId: this.state['student-id'],
      username: this.state.username,
      password: this.state.password
    };

    const response = await axios.post(form.action, data, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.data.success) {
      this.setState({
        name: '',
        'student-id': '',
        username: '',
        password: '',
        adding: false
      });
      await this.loadUsers();
    } else {
      this.setState({
        adding: false,
        error: response.data.message
      });
    }
  }

  deleteUser (id: number) {
    return async (event: React.MouseEvent) => {
      event.preventDefault();

      const token = localStorage.getItem('token');
      if (token === null) return;

      const backend = process.env.REACT_APP_BACKEND;
      const response = await axios.delete(`${backend}/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        await this.loadUsers();
      }
    }
  }

  async componentDidMount () {
    await this.loadUsers();
  }

  render () {
    const token = localStorage.getItem('token');
    const payloadStr = localStorage.getItem('payload');
    if (token === null || payloadStr === null) return <Navigate to="/logout" />;

    const payload: TokenPayload = JSON.parse(payloadStr);
    if (payload.type !== 'admin') return <Navigate to="/logout" />;

    const backend = process.env.REACT_APP_BACKEND;
    const links: Link[] = [
      {
        href: '/dashboard',
        name: 'Home'
      },
      {
        href: '/users',
        name: 'Users'
      },
      {
        href: '/logout',
        name: 'Log Out'
      }
    ];

    const results = [];
    const page = this.state.pagination.page;
    const totalPages = this.state.pagination.total;
    const pageKey = this.state.pagination.key;
    const limit = this.limit;
    const pagination = <Pagination limit={limit} active={page} pages={totalPages} className="justify-content-center" onChange={this.changePage} key={pageKey} />;
    const offset = page * limit;

    for (let i = offset; i < this.state.users.length && (i - offset) < limit; i++) {
      const user = this.state.users[i];
      if (typeof user === 'undefined') break;

      results.push(
        <div className="user-card card mb-3" key={i}>
          <div className="card-body">
            <h5>{ user.studentId }</h5>
            <p>{ user.username } ({ user.name })</p>
            <button type="button" className="btn btn-danger" onClick={this.deleteUser(user.id)}>Delete</button>
          </div>
        </div>
      );
    }

    return (
      <React.Fragment>
        <Header links={links} />

        <main className="d-md-flex mt-4 mx-2 mx-lg-5">
          <div className="col-md-4 mb-4 px-5">
            <form action={`${backend}/users`} method="post" className="card" onSubmit={this.addUser}>
              <div className="card-body">
                <h4>Add user</h4>
                <div className="form-group mb-2">
                  <label htmlFor="name">Name:</label>
                  <input type="text" id="name" name="name" value={this.state.name} className="form-control" required onChange={this.handleInput} />
                </div>

                <div className="form-group mb-2">
                  <label htmlFor="student-id">Student ID:</label>
                  <input type="text" id="student-id" name="student-id" value={this.state['student-id']} className="form-control" autoComplete="off" required onChange={this.handleInput} />
                </div>

                <div className="form-group mb-2">
                  <label htmlFor="username">Username:</label>
                  <input type="text" id="username" name="username" value={this.state.username} className="form-control" autoComplete="username" required onChange={this.handleInput} />
                </div>

                <div className="form-group mb-2">
                  <label htmlFor="password">Password:</label>
                  <input type="password" id="password" name="password" value={this.state.password} className="form-control" autoComplete="new-password" required onChange={this.handleInput} />
                </div>

                { this.state.error !== '' && <div className="alert alert-danger">{ this.state.error }</div> }

                <button type="submit" className="btn btn-primary w-100" disabled={this.state.adding}>
                  { this.state.adding ? 'Adding' : 'Add' }
                </button>
              </div>
            </form>
          </div>

          <div className="col-md-8 px-2">
            <h3>Users</h3>
            <p>
              { this.state.users.length > 0 ? this.state.users.length + ' result(s)' : '' }
              { this.state.users.length > 0 ? `: Showing page ${page + 1} of ${totalPages}` : '' }
            </p>

            <nav>
              { this.state.users.length > 0 && pagination }
            </nav>

            <div className="d-flex flex-wrap justify-content-around my-2">
              { results.length > 0 ? results : 'No results.' }
            </div>
          </div>
        </main>
      </React.Fragment>
    );
  }
}

export default Users;
