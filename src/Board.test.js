let mockDropHandler;
let mockDragStart;
let mockContainers;

jest.mock('dragula', () => jest.fn(containers => {
  mockContainers = containers;
  return {
    on: (event, handler) => {
      if (event === 'drag') mockDragStart = handler;
      if (event === 'drop') mockDropHandler = handler;
    },
    off: jest.fn(),
    destroy: jest.fn(),
  };
}));

import React from 'react';
import ReactDOM from 'react-dom';
import Board from './Board';

describe('Shipping Requests board', () => {
  let container;
  let board;

  beforeEach(() => {
    mockDragStart = null;
    mockDropHandler = null;
    mockContainers = null;
    container = document.createElement('div');
    document.body.appendChild(container);
    board = ReactDOM.render(<Board />, container);
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(container);
    container.remove();
  });

  it('starts all requests in the grey Backlog across three Dragula lanes', () => {
    const lanes = container.querySelectorAll('.Swimlane-dragColumn');
    const backlogCards = lanes[0].querySelectorAll('.Card');

    expect(lanes).toHaveLength(3);
    expect(mockContainers).toHaveLength(3);
    expect(backlogCards).toHaveLength(20);
    expect(lanes[1].children).toHaveLength(0);
    expect(lanes[2].children).toHaveLength(0);
    expect(Array.from(backlogCards).every(card => card.classList.contains('Card-grey'))).toBe(true);
  });

  it('keeps a moved card in its lane and updates its React state and color', () => {
    const lanes = container.querySelectorAll('.Swimlane-dragColumn');
    const movedCard = lanes[0].querySelector('[data-id="1"]');
    mockDragStart();
    lanes[1].appendChild(movedCard);

    mockDropHandler();

    expect(board.state.clients.backlog).toHaveLength(19);
    expect(board.state.clients.inProgress[0].id).toBe('1');
    expect(lanes[1].querySelector('[data-id="1"]').dataset.status).toBe('in-progress');
    expect(lanes[1].querySelector('[data-id="1"]').classList.contains('Card-blue')).toBe(true);
  });

  it('preserves a reordered card position in React state', () => {
    const backlog = container.querySelector('.Swimlane-dragColumn');
    const movedCard = backlog.querySelector('[data-id="2"]');
    mockDragStart();
    backlog.insertBefore(movedCard, backlog.firstChild);

    mockDropHandler();

    expect(board.state.clients.backlog[0].id).toBe('2');
    expect(backlog.firstChild.dataset.id).toBe('2');
  });
});
