
import React from 'react';
import { useNavigate, NavigateFunction, Navigate } from 'react-router-dom';
import axios from 'axios';

import Header from '../Header';
import './style.scss';

interface LoginWrapProps {}

interface LoginProps extends LoginWrapProps {
  navigate: NavigateFunction;
}

interface LoginState {
  username: string;
  password: string;
  signingin: boolean;
  error: string;
}

class Login extends React.Component<LoginProps, LoginState> {
  constructor (props: LoginProps) {
    super(props);

    this.state = {
      username: '',
      password: '',
      signingin: false,
      error: ''
    };

    this.handleInput = this.handleInput.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
  }

  handleInput (event: React.ChangeEvent) {
    const target = event.target as HTMLInputElement;
    const state = this.state as any;
    state[target.name] = target.value;
    this.setState(state);
  }

  async handleLogin (event: React.FormEvent) {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    this.setState({
      signingin: true,
      error: ''
    });

    const response = await axios.post(form.action, {
      username: this.state.username,
      password: this.state.password
    });

    if (response.data.success) {
      const navigate = this.props.navigate;
      const token = response.data.token;
      const payload = atob(token.split('.')[1]);

      localStorage.setItem('token', token);
      localStorage.setItem('payload', payload);
      navigate('/dashboard');
    } else {
      this.setState({
        signingin: false,
        error: response.data.message
      });
    }
  }

  render () {
    const token = sessionStorage.getItem('token');
    if (token !== null) return <Navigate to="/dashboard" />;

    const backend = process.env.REACT_APP_BACKEND;
    return (
      <React.Fragment>
        <Header />

        <main>
          <form action={`${backend}/login`} method="post" className="card login-form mt-5 mx-auto" onSubmit={this.handleLogin}>
            <div className="card-body">
              <h5>Log In</h5>

              <div className="form-group mb-2">
                <label htmlFor="username">Username:</label>
                <input type="text" id="username" name="username" value={this.state.username} autoComplete="username" className="form-control" required onChange={this.handleInput} />
              </div>

              <div className="form-group mb-2">
                <label htmlFor="password">Password:</label>
                <input type="password" id="password" name="password" value={this.state.password} autoComplete="current-password" className="form-control" required onChange={this.handleInput} />
              </div>

              { this.state.error !== '' && <div className="alert alert-danger mb-2" role="alert">{ this.state.error }</div> }

              <div className="d-grid gap-2">
                <button type="submit" className="btn btn-primary" disabled={this.state.signingin}>
                  { this.state.signingin ? 'Logging In' : 'Log In' }
                </button>
              </div>
            </div>
          </form>
        </main>
      </React.Fragment>
    );
  }
}

export default function LoginWrap (props: LoginWrapProps) {
  const navigate = useNavigate();
  return <Login {...props} navigate={navigate} />;
}
