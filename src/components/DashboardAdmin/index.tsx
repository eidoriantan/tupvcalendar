
import React from 'react';
import { Navigate } from 'react-router-dom';
import { EventClickArg } from '@fullcalendar/core';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { Modal } from 'bootstrap';
import axios from 'axios';

import type { TokenPayload, Event } from '../../types';
import { formatDate } from '../../utils';
import Header, { Link } from '../Header';

interface DashboardAdminProps {}

interface DashboardAdminState {
  name: string;
  description: string;
  'date-start': string;
  'date-end': string;
  adding: boolean;
  error: string;
  events: Event[];
  eventModal: Modal | null;
  eventId: string;
  'edit-name': string;
  'edit-description': string;
  'edit-date-start': string;
  'edit-date-end': string;
  submitting: boolean;
  editError: string;
}

class DashboardAdmin extends React.Component<DashboardAdminProps, DashboardAdminState> {
  constructor (props: DashboardAdminProps) {
    super(props);

    this.state = {
      name: '',
      description: '',
      'date-start': '',
      'date-end': '',
      adding: false,
      error: '',
      events: [],
      eventModal: null,
      eventId: '',
      'edit-name': '',
      'edit-description': '',
      'edit-date-start': '',
      'edit-date-end': '',
      submitting: false,
      editError: ''
    };

    this.handleInput = this.handleInput.bind(this);
    this.loadEvents = this.loadEvents.bind(this);
    this.addEvent = this.addEvent.bind(this);
    this.editEvent = this.editEvent.bind(this);
    this.deleteEvent = this.deleteEvent.bind(this);
    this.eventClick = this.eventClick.bind(this);
    this.hideModal = this.hideModal.bind(this);
  }

  handleInput (event: React.ChangeEvent) {
    const target = event.target as HTMLInputElement;
    const state = this.state as any;
    state[target.name] = target.value;
    this.setState(state);
  }

  async loadEvents () {
    const token = localStorage.getItem('token');
    if (token === null) return;

    const backend = process.env.REACT_APP_BACKEND;
    const response = await axios.get(`${backend}/calendar`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.data.success) {
      this.setState({
        events: response.data.events
      });
    }
  }

  async addEvent (event: React.FormEvent) {
    event.preventDefault();

    const token = localStorage.getItem('token');
    if (token === null) return;

    this.setState({ adding: false, error: '' });

    const form = event.target as HTMLFormElement;
    const data = {
      name: this.state.name,
      description: this.state.description,
      dateStart: this.state['date-start'],
      dateEnd: this.state['date-end']
    };

    const response = await axios.post(form.action, data, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.data.success) {
      this.setState({
        name: '',
        description: '',
        'date-start': '',
        'date-end': '',
        adding: false
      });
      await this.loadEvents();
    } else {
      this.setState({
        adding: false,
        error: response.data.message
      });
    }
  }

  async editEvent (event: React.FormEvent) {
    event.preventDefault();

    const token = localStorage.getItem('token');
    if (token === null) return;

    this.setState({ submitting: false, editError: '' });

    const form = event.target as HTMLFormElement;
    const data = {
      name: this.state['edit-name'],
      description: this.state['edit-description'],
      dateStart: this.state['edit-date-start'],
      dateEnd: this.state['edit-date-end']
    };

    const response = await axios.post(form.action, data, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.data.success) {
      this.setState({
        submitting: false
      });

      await this.loadEvents();
      this.hideModal();
    } else {
      this.setState({
        submitting: false,
        editError: response.data.message
      });
    }
  }

  async deleteEvent (event: React.MouseEvent) {
    event.preventDefault();

    const token = localStorage.getItem('token');
    if (token === null) return;

    const backend = process.env.REACT_APP_BACKEND;
    const id = this.state.eventId;
    const response = await axios.delete(`${backend}/calendar/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.data.success) {
      await this.loadEvents();
      this.hideModal();
    }
  }

  eventClick (event: EventClickArg) {
    console.log(event);

    this.setState({
      eventId: event.event.id,
      'edit-name': event.event.title,
      'edit-description': event.event._def.extendedProps.description,
      'edit-date-start': formatDate(event.event.startStr),
      'edit-date-end': formatDate(event.event.endStr)
    });

    this.state.eventModal?.show();
  }

  hideModal () {
    this.state.eventModal?.hide();
  }

  async componentDidMount () {
    const modalEvent = document.querySelector('#modal-event');
    this.setState({
      eventModal: modalEvent !== null ? new Modal(modalEvent) : null
    });

    await this.loadEvents();
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

    return (
      <React.Fragment>
        <Header links={links} />

        <main className="d-md-flex mt-4 mx-2 mx-lg-5">
          <div className="col-md-4 mb-4 px-5">
            <form action={`${backend}/calendar`} method="post" className="card" onSubmit={this.addEvent}>
              <div className="card-body">
                <h4>Add event</h4>
                <div className="form-group mb-2">
                  <label htmlFor="name">Event Name:</label>
                  <input type="text" id="name" name="name" value={this.state.name} className="form-control" required onChange={this.handleInput} />
                </div>

                <div className="form-group mb-2">
                  <label htmlFor="description">Description:</label>
                  <textarea id="description" name="description" value={this.state.description} rows={5} className="form-control" required onChange={this.handleInput} />
                </div>

                <div className="form-group mb-2">
                  <label htmlFor="date-start">Start Date:</label>
                  <input type="datetime-local" id="date-start" name="date-start" value={this.state['date-start']} className="form-control" required onChange={this.handleInput} />
                </div>

                <div className="form-group mb-2">
                  <label htmlFor="date-end">End Date:</label>
                  <input type="datetime-local" id="date-end" name="date-end" value={this.state['date-end']} className="form-control" required onChange={this.handleInput} />
                </div>

                { this.state.error !== '' && <div className="alert alert-danger">{ this.state.error }</div> }

                <button type="submit" className="btn btn-primary w-100" disabled={this.state.adding}>
                  { this.state.adding ? 'Adding' : 'Add' }
                </button>
              </div>
            </form>
          </div>

          <div className="col-md-8 px-2">
            <FullCalendar plugins={[dayGridPlugin]} initialView="dayGridMonth" events={this.state.events} eventClick={this.eventClick} />
          </div>
        </main>

        <div className="modal fade" id="modal-event" tabIndex={-1} role="dialog" aria-hidden="true">
          <div className="modal-dialog" role="document">
            <form action={`${backend}/calendar/${this.state.eventId}`} method="post" className="modal-content" onSubmit={this.editEvent}>
              <div className="modal-header">
                <h5 className="modal-title">Edit Event</h5>
                <button type="button" className="btn-close" aria-label="Close" onClick={this.hideModal}></button>
              </div>

              <div className="modal-body">
                <div className="form-group mb-2">
                  <label htmlFor="edit-name">Event Name:</label>
                  <input type="text" id="edit-name" name="edit-name" value={this.state['edit-name']} className="form-control" required onChange={this.handleInput} />
                </div>

                <div className="form-group mb-2">
                  <label htmlFor="edit-description">Description:</label>
                  <textarea id="edit-description" name="edit-description" value={this.state['edit-description']} rows={5} className="form-control" required onChange={this.handleInput} />
                </div>

                <div className="form-group mb-2">
                  <label htmlFor="edit-date-start">Start Date:</label>
                  <input type="datetime-local" id="edit-date-start" name="edit-date-start" value={this.state['edit-date-start']} className="form-control" required onChange={this.handleInput} />
                </div>

                <div className="form-group mb-2">
                  <label htmlFor="edit-date-end">End Date:</label>
                  <input type="datetime-local" id="edit-date-end" name="edit-date-end" value={this.state['edit-date-end']} className="form-control" required onChange={this.handleInput} />
                </div>

                { this.state.editError !== '' && <div className="alert alert-danger">{ this.state.editError }</div> }
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={this.hideModal}>Close</button>
                <button type="button" className="btn btn-danger" onClick={this.deleteEvent}>Delete</button>
                <button type="submit" className="btn btn-primary" disabled={this.state.submitting}>
                  { this.state.submitting ? 'Saving' : 'Save' }
                </button>
              </div>
            </form>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default DashboardAdmin;
