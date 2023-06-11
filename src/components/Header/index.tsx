
import React from 'react';
import { NavLink } from 'react-router-dom';

interface NavLinkParams {
  isActive: boolean;
}

export interface Link {
  href: string;
  name: string;
}

interface HeaderProps {
  links?: Link[];
}

class Header extends React.Component<HeaderProps> {
  render () {
    const navbarClass = (params: NavLinkParams) => {
      return 'nav-link' + (params.isActive ? ' active' : '');
    };

    return (
      <header>
        <nav className="navbar navbar-expand-lg bg-primary px-2 px-lg-4" data-bs-theme="dark">
          <div className="container-fluid">
            <NavLink to="/" className="navbar-brand">TUPV Calendar</NavLink>
            <button type="button" className="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#header-navbar" aria-controls="header-navbar" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse justify-content-end" id="header-navbar">
              <ul className="navbar-nav mb-2 mb-lg-0">
                { Array.isArray(this.props.links) && this.props.links.map((link, i) => {
                  return (
                    <li className="nav-item" key={i}>
                      <NavLink to={link.href} className={navbarClass}>{ link.name }</NavLink>
                    </li>
                  );
                }) }
              </ul>
            </div>
          </div>
        </nav>
      </header>
    );
  }
}

export default Header;
