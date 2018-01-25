import React, { Component } from 'react';
import injectTapEventPlugin from 'react-tap-event-plugin';
import LabelTextField from './LabelTextField';
import TwoLabelTextField from './TwoLabelTextField';

import './App.css';

injectTapEventPlugin();

class App extends Component {
  constructor(props){
    super(props);

    this.initialState = { 
      player_name: '',
      sets: [0],
      farmers: [0,0],
      shamans: [0,0],
      tool_makers: [0,0],
      builders: [0,0],
      resources: 0
    };
    this.state = {
      form: JSON.parse(JSON.stringify(this.initialState)),
      players: [],
      menuCollapse: true
    }

    this.AddPlayer = this.AddPlayer.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSetChange = this.handleSetChange.bind(this);
    this.addSet = this.addSet.bind(this);
    this.showButton = this.showButton.bind(this);
    this.toggleCollapse = this.toggleCollapse.bind(this);
  }

  showButton = (i) => {
    if(i+1 === this.state.form.sets.length){
      return (
        <button type="button" className="btn btn-primary addSetBtn" onClick={this.addSet}><span className="glyphicon glyphicon-plus-sign" aria-hidden="true"></span></button>
      )
    } else {
      return false;
    }
  }

  toggleCollapse = () => {
    let state = this.state;
    state.menuCollapse = !state.menuCollapse;
    this.setState(state);
  }

  addSet = () => {
    let state = this.state;
    state.form.sets.push(0);
    this.setState(state);
  }

  handleChange(el, numeric, event) {
    let state = this.state;

    let id = false, index = false;
    let value = (numeric) ? (event.target.value === '' ? '' : parseInt(event.target.value, 10)) : event.target.value;

    if(Array.isArray(el)){
      id = el[0];
      index = el[1];
    } else {
      id = el;
    }

    if(index !== false){
      state.form[id][ index ] = value;
    } else {
      state.form[id] = value;
    }
    
    this.setState(state);
  }

  handleSetChange(index, event) {
    let state = this.state;
    let value = (event.target.value === '' ? '' : parseInt(event.target.value, 10));
    state.form.sets[ index ] = value;
    this.setState(state);
  }

  AddPlayer = (e) => {
    e.preventDefault();
    let state = this.state;
    let f = state.form;
    let p = {
      player_name: f.player_name,
      sets: f.sets,
      farmers: f.farmers,
      shamans: f.shamans,
      tool_makers: f.tool_makers,
      builders: f.builders,
      resources: f.resources,
      total: 0
    }

    p.total = p.sets.reduce((a, v)=> { return a + (v*v); }, 0) + (p.farmers[0]*p.farmers[1]) + (p.shamans[0]*p.shamans[1]) + (p.tool_makers[0]*p.tool_makers[1]) + (p.builders[0]*p.builders[1]) + p.resources;

    state.players.push(p);

    state.form = JSON.parse(JSON.stringify(this.initialState));

    this.setState( state );
  }

  render() {
    let state = this.state;
    let form = state.form;
    let menuCollapse = (state.menuCollapse) ? 'collapse' : '';
    return (
      <div className="App container">
        <nav className="navbar navbar-default">
          <div className="container-fluid">
            <div className="navbar-header">
            <button type="button" className="navbar-toggle collapsed" onClick={this.toggleCollapse} aria-expanded="false">
                <span className="sr-only">Toggle navigation</span>
                <span className="icon-bar"></span>
                <span className="icon-bar"></span>
                <span className="icon-bar"></span>
              </button>
              <a className="navbar-brand" href="/">
                Scoring Meeples
              </a>
            </div>
            <div className={`${menuCollapse} navbar-collapse`} id="bs-example-navbar-collapse-1">
              <ul className="nav navbar-left">
                <li className=""><a href="/">Home</a></li>
              </ul>
            </div>

          </div>
          
        </nav>
        <div className="row">
          <h1>Stone Age</h1>
        </div>
        <div className="row">
          <table className="table table-striped">
            <thead>
              <tr>
                <th className="player">Player</th>
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
        <LabelTextField _value={form.player_name} _label="Player's Name" _key={'player_name'} numeric={false} onHandleChange={this.handleChange} />

        {
          form.sets.map( (s, i) => {
            return (
              <div className="row" key={i}>
                <div className={`form-group col-xs-12 col-md-12`}>
                  <label style={ {display: 'block'} } htmlFor={'set'+(i+1)}>{'Set #'+(i+1)}</label>
                  <input type="text" className="form-control short" style={ {display: 'inline-block'} } key={'set'+(i+1)} id={'set'+(i+1)} placeholder={0} value={s} onChange={this.handleSetChange.bind(this, i)}/>
                  {this.showButton(i)}
                </div>
                
              </div>
              
            )
          })
        }
        
        

        <TwoLabelTextField 
          _value={[ form.farmers[0], form.farmers[1] ]} 
          _label={[ 'Farmers', 'Food Track' ]} 
          _key={['farmers','food_track']} 
          numeric={[true,true]} 
          onHandleChange={this.handleChange} />
        <TwoLabelTextField 
          _value={[ form.shamans[0], form.shamans[1] ]} 
          _label={[ 'Shamans', 'People' ]} 
          _key={['shamans','people']} 
          numeric={[true,true]} 
          onHandleChange={this.handleChange} />
        <TwoLabelTextField 
          _value={[ form.builders[0], form.builders[1] ]} 
          _label={[ 'Builders', 'Buildings' ]} 
          _key={['builders','buildings']} 
          numeric={[true,true]} 
          onHandleChange={this.handleChange} />
        <TwoLabelTextField 
          _value={[ form.tool_makers[0], form.tool_makers[1] ]} 
          _label={[ 'Tool Makers', 'Tools' ]} 
          _key={['tool_makers','tools']} 
          numeric={[true,true]} 
          onHandleChange={this.handleChange} />
        <LabelTextField _value={form.resources} _label="Resources" _key={'resources'} numeric={true} onHandleChange={this.handleChange} />

        <div className="row">
          <button onClick={this.AddPlayer} className="btn btn-primary">Add Player</button>
        </div>

      </div>
    );
  }
}

export default App;
