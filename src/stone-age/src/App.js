import React, { Component } from 'react';
import injectTapEventPlugin from 'react-tap-event-plugin';
import LabelTextField from './LabelTextField';

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
        <LabelTextField _value={this.state.form.player_name} _label="Player's Name" _key={'player_name'} numeric={false} onHandleChange={this.handleChange} />

        <LabelTextField _value={this.state.form.set1} _label="Set #1" _key={'set1'} numeric={true} onHandleChange={this.handleChange} />
        <LabelTextField _value={this.state.form.set2} _label="Set #2" _key={'set2'} numeric={true} onHandleChange={this.handleChange} />
        <LabelTextField _value={this.state.form.set3} _label="Set #3" _key={'set3'} numeric={true} onHandleChange={this.handleChange} />
        <LabelTextField _value={this.state.form.set4} _label="Set #4" _key={'set4'} numeric={true} onHandleChange={this.handleChange} />
        <LabelTextField _value={this.state.form.set5} _label="Set #5" _key={'set5'} numeric={true} onHandleChange={this.handleChange} />

        <LabelTextField _value={this.state.form.farmers} _label="Farmers" _key={'farmers'} numeric={true} onHandleChange={this.handleChange} />
        <LabelTextField _value={this.state.form.shamans} _label="Shamans" _key={'shamans'} numeric={true} onHandleChange={this.handleChange} />
        <LabelTextField _value={this.state.form.builders} _label="Builders" _key={'builders'} numeric={true} onHandleChange={this.handleChange} />
        <LabelTextField _value={this.state.form.tool_makers} _label="Tool Makers" _key={'tool_makers'} numeric={true} onHandleChange={this.handleChange} />
        <LabelTextField _value={this.state.form.resources} _label="Resources" _key={'resources'} numeric={true} onHandleChange={this.handleChange} />

        <div className="row">
          <button onClick={this.AddPlayer} className="btn btn-primary">Add Player</button>
        </div>

      </div>
    );
  }
}

export default App;
