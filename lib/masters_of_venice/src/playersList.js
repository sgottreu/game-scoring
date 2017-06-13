import React, { Component } from 'react';

import {List, ListItem, makeSelectable} from 'material-ui/List';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';

import FontIcon from 'material-ui/FontIcon';

let SelectableList = makeSelectable(List);

//let saveCurrentPlayer, currentPlayer;

function wrapState(ComposedComponent) {
  return class SelectableList extends Component {
    render() {
      let saveCurrentPlayer = this.props.saveCurrentPlayer;
      let currentPlayer = this.props.currentPlayer;

      return (
        <ComposedComponent
          value={currentPlayer}
          onChange={ saveCurrentPlayer }
        >
          {this.props.children}
        </ComposedComponent>
      );
    }
  };
}

SelectableList = wrapState(SelectableList);

class PlayersList extends Component {
  render() {
    let {players, setCurrentName, currentName, addPlayer} = this.props;
    let saveCurrentPlayer = this.props.saveCurrentPlayer;
    let currentPlayer = this.props.currentPlayer;

    return (
      <div className="PlayersList">
        <div className="addPlayers">
          <TextField hintText="Player Name" name="player_name"
            value={currentName}
            onChange={setCurrentName}/>
            <RaisedButton onTouchTap={addPlayer} label="Add Player" secondary={true} 
            />
        </div>
        <div className="playerList_header">
          <span className="player_selected"></span>
          <span className="player_name">Player</span>
          <span className="player_bank">Bank</span>
          <span className="player_vp">VP</span>
        </div>
        <SelectableList 
          defaultValue={(currentPlayer !== false) ? currentPlayer : -1}
          currentPlayer={currentPlayer} 
          saveCurrentPlayer={saveCurrentPlayer}
          
        >

          {players.map((p, i) => {
              return <ListItem className="player" key={p.name} value={i} data-index={i} primaryText={
                <div>
                  <span className="player_selected"><FontIcon className={'fa fa-check-circle-o'+((currentPlayer===i)?'':' hide')} /></span>
                  <span className="player_name">{p.name}</span>
                  <span className="player_bank">{p.bank}</span>
                  <span className="player_vp">{p.vp}</span>
                </div> } />
            })
          }
        </SelectableList>
      </div>
    );
  }
}

export default PlayersList;