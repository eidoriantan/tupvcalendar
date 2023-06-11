
import React from 'react';
import { Navigate } from 'react-router-dom';
import { EventClickArg } from '@fullcalendar/core';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { Modal } from 'bootstrap';
import axios from 'axios';

import type { Event } from '../../types';
import { formatDate } from '../../utils';
import Header, { Link } from '../Header';

interface DashboardUserProps {}

interface DashboardUserState {
  eventModal: Modal | null;
  events: Event[];
  'view-name': string;
  'view-description': string;
  'view-date-start': string;
  'view-date-end': string;
}

class DashboardUser extends React.Component<DashboardUserProps, DashboardUserState> {
  constructor (props: DashboardUserProps) {
    super(props);

    this.state = {
      eventModal: null,
      events: [],
      'view-name': '',
      'view-description': '',
      'view-date-start': '',
      'view-date-end': ''
    };

    this.loadEvents = this.loadEvents.bind(this);
    this.eventClick = this.eventClick.bind(this);
    this.hideModal = this.hideModal.bind(this);
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

  eventClick (event: EventClickArg) {
    console.log(event);

    this.setState({
      'view-name': event.event.title,
      'view-description': event.event._def.extendedProps.description,
      'view-date-start': formatDate(event.event.startStr),
      'view-date-end': formatDate(event.event.endStr)
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
    if (token === null) return <Navigate to="/logout" />;

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
          <div className="w-50 mx-auto mt-5">
            <FullCalendar plugins={[dayGridPlugin]} initialView="dayGridMonth" events={this.state.events} eventClick={this.eventClick} />
          </div>
        </main>

        <div className="modal fade" id="modal-event" tabIndex={-1} role="dialog" aria-hidden="true">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">View Event</h5>
                <button type="button" className="btn-close" aria-label="Close" onClick={this.hideModal}></button>
              </div>

              <div className="modal-body">
                <div className="form-group mb-2">
                  <label htmlFor="view-name">Event Name:</label>
                  <input type="text" id="view-name" name="view-name" value={this.state['view-name']} className="form-control" readOnly />
                </div>

                <div className="form-group mb-2">
                  <label htmlFor="view-description">Description:</label>
                  <textarea id="view-description" name="view-description" value={this.state['view-description']} rows={5} className="form-control" readOnly />
                </div>

                <div className="form-group mb-2">
                  <label htmlFor="view-date-start">Start Date:</label>
                  <input type="datetime-local" id="view-date-start" name="view-date-start" value={this.state['view-date-start']} className="form-control" readOnly />
                </div>

                <div className="form-group mb-2">
                  <label htmlFor="view-date-end">End Date:</label>
                  <input type="datetime-local" id="view-date-end" name="view-date-end" value={this.state['view-date-end']} className="form-control" readOnly />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={this.hideModal}>Close</button>
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default DashboardUser;
