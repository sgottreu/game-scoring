import React, { Component } from 'react';
import injectTapEventPlugin from 'react-tap-event-plugin';

import './App.css';

injectTapEventPlugin();

class App extends Component {


  constructor(props){
    super(props);

    this.initialState = { 
      player_name: '',
      set1: 0,
      set2: 0,
      set3: 0,
      set4: 0,
      set5: 0,
      farmers: 0,
      shamans: 0,
      tool_makers: 0,
      builders: 0,
      resources: 0
    };
    this.state = {
      form: JSON.parse(JSON.stringify(this.initialState)),
      players: []
    }

    this.AddPlayer = this.AddPlayer.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(id, event) {
    let state = this.state;
    state.form[id] = event.target.value;
    this.setState(state);
  }

  AddPlayer = (e) => {
    e.preventDefault();
    let state = this.state;
    let f = state.form;
    let player = {
      player_name: f.player_name,
      sets: [f.set1*f.set1, f.set2*f.set2, f.set3*f.set3, f.set4*f.set4, f.set5*f.set5],
      farmers: parseInt(f.farmers),
      shamans: parseInt(f.shamans),
      tool_makers: parseInt(f.tool_makers),
      builders: parseInt(f.builders),
      resources: parseInt(f.resources),
      total: 0
    }

    player.total = player.sets.reduce((a, v)=> { return a + v; }) + player.farmers + player.shamans + player.tool_makers + player.builders + player.resources;

    state.players.push(player);

    state.form = JSON.parse(JSON.stringify(this.initialState));

    this.setState( state );
  }

  render() {
    let state = this.state;
    return (
      <div className="App container">
        <div className="row">
          <h1>Stone Age</h1>
        </div>
        <div className="row">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Player</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
            {
              state.players.map( (p, i) => {
                return (
                  <tr key={i}>
                    <td className="player">{p.player_name}</td>
                    <td>{p.total}</td>
                  </tr>
                )
              })
            }
            </tbody>
          </table>
        </div>
        <div className="row">
          <form >
            <div className="row">

              <div className="form-group col-xs-12 col-md-8">
                <label htmlFor="player_name">Player's Name</label>
                <input type="text" className="form-control" id="player_name" placeholder="Player's Name" value={this.state.form.player_name} onChange={this.handleChange.bind(this, 'player_name')} />
              </div>

            </div>

            <div className="row">
              <div className="form-group col-xs-12 col-md-8">
                <label htmlFor="set1">Set #1</label>
                <input type="text" className="form-control" id="set1" placeholder="0" value={this.state.form.set1} onChange={this.handleChange.bind(this, 'set1')}/>
              </div>
              <div className="form-group col-xs-12 col-md-8">
                <label htmlFor="set1">Set #2</label>
                <input type="text" className="form-control" id="set2" placeholder="0" value={this.state.form.set2} onChange={this.handleChange.bind(this, 'set2')}/>
              </div>
              <div className="form-group col-xs-12 col-md-8">
                <label htmlFor="set1">Set #3</label>
                <input type="text" className="form-control" id="set3" placeholder="0" value={this.state.form.set3} onChange={this.handleChange.bind(this, 'set3')}/>
              </div>
              <div className="form-group col-xs-12 col-md-8">
                <label htmlFor="set1">Set #4</label>
                <input type="text" className="form-control" id="set4" placeholder="0" value={this.state.form.set4} onChange={this.handleChange.bind(this, 'set4')}/>
              </div>
              <div className="form-group col-xs-12 col-md-8">
                <label htmlFor="set1">Set #5</label>
                <input type="text" className="form-control" id="set5" placeholder="0" value={this.state.form.set5} onChange={this.handleChange.bind(this, 'set5')}/>
              </div>
            </div>
            <div className="row">
              <div className="form-group col-xs-12 col-md-8">
                <label htmlFor="farmers">Farmers</label>
                <input type="text" className="form-control" id="farmers" placeholder="0" value={this.state.form.farmers} onChange={this.handleChange.bind(this, 'farmers')}/>
              </div>
            </div>
            <div className="row">
              <div className="form-group col-xs-12 col-md-8">
                <label htmlFor="shamans">shamans</label>
                <input type="text" className="form-control" id="shamans" placeholder="0" value={this.state.form.shamans} onChange={this.handleChange.bind(this, 'shamans')}/>
              </div>
            </div>
            <div className="row">
              <div className="form-group col-xs-12 col-md-8">
                <label htmlFor="tool_makers">tool_makers</label>
                <input type="text" className="form-control" id="tool_makers" placeholder="0" value={this.state.form.tool_makers} onChange={this.handleChange.bind(this, 'tool_makers')}/>
              </div>
            </div>
            <div className="row">
              <div className="form-group col-xs-12 col-md-8">
                <label htmlFor="builders">builders</label>
                <input type="text" className="form-control" id="builders" placeholder="0" value={this.state.form.builders} onChange={this.handleChange.bind(this, 'builders')}/>
              </div>
            </div>
            <div className="row">
              <div className="form-group col-xs-12 col-md-8">
                <label htmlFor="resources">resources</label>
                <input type="text" className="form-control" id="resources" placeholder="0" value={this.state.form.resources} onChange={this.handleChange.bind(this, 'resources')}/>
              </div>
            </div>
            <div className="row">
              <button onClick={this.AddPlayer} className="btn btn-primary">Add Player</button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default App;
