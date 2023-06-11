
import React from 'react';

export type ChangeFunction = (page: number) => void;

interface PaginationProps {
  limit: number;
  active: number;
  pages: number;
  className?: string;
  onChange: ChangeFunction;
}

interface PaginationState {
  active: number;
  pages: number;
  limit: number;
  onChange: ChangeFunction;
}

class Pagination extends React.Component<PaginationProps, PaginationState> {
  constructor (props: PaginationProps) {
    super(props);

    if (props.limit % 2 === 0) throw new Error('`limit` should be an odd number');
    if (props.active >= props.pages) throw new Error('Invalid `active` and/or `pages`');

    this.state = {
      active: props.active,
      pages: props.pages,
      limit: props.limit,
      onChange: props.onChange
    };

    this.change = this.change.bind(this);
  }

  change (event: React.MouseEvent) {
    event.preventDefault();

    const target = event.target as HTMLElement;
    let key = target.dataset.key;
    let page = 0;

    if (typeof key === 'undefined') return;
    if (key === 'prev') page = this.state.active - 1;
    if (key === 'next') page = this.state.active + 1;
    if (key !== 'prev' && key !== 'next') page = parseInt(key);

    if (page < 0 || page >= this.state.pages) page = this.state.active;
    this.setState({ active: page });
    this.state.onChange(page);
  }

  render () {
    const pagination = [];
    pagination.push(
      <li className="page-item" key={-1}>
        <button type="button" className="page-link" data-key="prev" aria-label="Previous" onClick={this.change}>
          <span aria-hidden="true">&laquo;</span>
        </button>
      </li>
    );

    const sideLimit = Math.floor(this.state.limit / 2);
    let i = 0;
    let x = 0;
    if (this.state.pages > this.state.limit) {
      if (this.state.active + 1 > this.state.limit - sideLimit) i = this.state.active - sideLimit;
      if (this.state.active + 1 > this.state.pages - sideLimit) i = this.state.pages - this.state.limit;
    }

    for (i; i < this.state.pages && x < this.state.limit; i++) {
      pagination.push(
        <li className={'page-item' + (this.state.active === i ? ' active' : '')} key={i}>
          <button className="page-link" data-key={i} onClick={this.change}>{i + 1}</button>
        </li>
      );
      x++;
    }

    pagination.push(
      <li className="page-item" key={this.state.pages}>
        <button className="page-link" data-key="next" aria-label="Next" onClick={this.change}>
          <span aria-hidden="true">&raquo;</span>
        </button>
      </li>
    );

    const className = `pagination ${this.props.className || ''}`.trim();
    return (
      <ul className={className}>
        { pagination }
      </ul>
    );
  }
}

export default Pagination;
