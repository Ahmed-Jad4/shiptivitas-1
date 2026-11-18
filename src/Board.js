import React from 'react';
import Dragula from 'dragula';
import 'dragula/dist/dragula.css';
import Swimlane from './Swimlane';
import './Board.css';

export default class Board extends React.Component {
  constructor(props) {
    super(props);
    const clients = this.getClients();
    this.state = {
      // Start every request in Backlog; lane changes live in React state only.
      clients: {
        backlog: clients.map(client => ({ ...client, status: 'backlog' })),
        inProgress: [],
        complete: [],
      }
    };
    this.swimlanes = {
      backlog: React.createRef(),
      inProgress: React.createRef(),
      complete: React.createRef(),
    };
    this.dragula = null;
    this.dragSnapshot = null;
  }
  componentDidMount() {
    this.dragula = Dragula([
      this.swimlanes.backlog.current,
      this.swimlanes.inProgress.current,
      this.swimlanes.complete.current,
    ]);
    this.dragula.on('drag', this.handleDragStart);
    this.dragula.on('drop', this.handleDrop);
  }

  componentWillUnmount() {
    if (this.dragula) {
      this.dragula.off('drag', this.handleDragStart);
      this.dragula.off('drop', this.handleDrop);
      this.dragula.destroy();
    }
  }

  handleDragStart = () => {
    this.dragSnapshot = Object.keys(this.swimlanes).reduce((snapshot, lane) => {
      snapshot[lane] = Array.from(this.swimlanes[lane].current.children);
      return snapshot;
    }, {});
  };

  handleDrop = () => {
    const clientsById = {};
    Object.keys(this.state.clients).forEach(lane => {
      this.state.clients[lane].forEach(client => { clientsById[client.id] = client; });
    });

    const clients = {
      backlog: Array.from(this.swimlanes.backlog.current.children).map(card => clientsById[card.dataset.id]),
      inProgress: Array.from(this.swimlanes.inProgress.current.children).map(card => clientsById[card.dataset.id]),
      complete: Array.from(this.swimlanes.complete.current.children).map(card => clientsById[card.dataset.id]),
    };
    clients.backlog = clients.backlog.map(client => ({ ...client, status: 'backlog' }));
    clients.inProgress = clients.inProgress.map(client => ({ ...client, status: 'in-progress' }));
    clients.complete = clients.complete.map(client => ({ ...client, status: 'complete' }));

    // Dragula moves DOM nodes directly. Restore React's previous DOM order first,
    // then let React reconcile the new order from state.
    if (this.dragSnapshot) {
      Object.keys(this.dragSnapshot).forEach(lane => {
        this.dragSnapshot[lane].forEach(card => {
          this.swimlanes[lane].current.appendChild(card);
        });
      });
      this.dragSnapshot = null;
    }
    this.setState({ clients });
  };

  getClients() {
    return [
      ['1','Stark, White and Abbott','Cloned Optimal Architecture', 'in-progress'],
      ['2','Wiza LLC','Exclusive Bandwidth-Monitored Implementation', 'complete'],
      ['3','Nolan LLC','Vision-Oriented 4Thgeneration Graphicaluserinterface', 'backlog'],
      ['4','Thompson PLC','Streamlined Regional Knowledgeuser', 'in-progress'],
      ['5','Walker-Williamson','Team-Oriented 6Thgeneration Matrix', 'in-progress'],
      ['6','Boehm and Sons','Automated Systematic Paradigm', 'backlog'],
      ['7','Runolfsson, Hegmann and Block','Integrated Transitional Strategy', 'backlog'],
      ['8','Schumm-Labadie','Operative Heuristic Challenge', 'backlog'],
      ['9','Kohler Group','Re-Contextualized Multi-Tasking Attitude', 'backlog'],
      ['10','Romaguera Inc','Managed Foreground Toolset', 'backlog'],
      ['11','Reilly-King','Future-Proofed Interactive Toolset', 'complete'],
      ['12','Emard, Champlin and Runolfsdottir','Devolved Needs-Based Capability', 'backlog'],
      ['13','Fritsch, Cronin and Wolff','Open-Source 3Rdgeneration Website', 'complete'],
      ['14','Borer LLC','Profit-Focused Incremental Orchestration', 'backlog'],
      ['15','Emmerich-Ankunding','User-Centric Stable Extranet', 'in-progress'],
      ['16','Willms-Abbott','Progressive Bandwidth-Monitored Access', 'in-progress'],
      ['17','Brekke PLC','Intuitive User-Facing Customerloyalty', 'complete'],
      ['18','Bins, Toy and Klocko','Integrated Assymetric Software', 'backlog'],
      ['19','Hodkiewicz-Hayes','Programmable Systematic Securedline', 'backlog'],
      ['20','Murphy, Lang and Ferry','Organized Explicit Access', 'backlog'],
    ].map(companyDetails => ({
      id: companyDetails[0],
      name: companyDetails[1],
      description: companyDetails[2],
      status: companyDetails[3],
    }));
  }
  renderSwimlane(name, clients, ref) {
    return (
      <Swimlane name={name} clients={clients} dragulaRef={ref}/>
    );
  }

  render() {
    return (
      <div className="Board">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-4">
              {this.renderSwimlane('Backlog', this.state.clients.backlog, this.swimlanes.backlog)}
            </div>
            <div className="col-md-4">
              {this.renderSwimlane('In Progress', this.state.clients.inProgress, this.swimlanes.inProgress)}
            </div>
            <div className="col-md-4">
              {this.renderSwimlane('Complete', this.state.clients.complete, this.swimlanes.complete)}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
