import React, { Component } from 'react';

import {List, ListItem, makeSelectable} from 'material-ui/List';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import FloatingActionButton from 'material-ui/FloatingActionButton';

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
        <SelectableList 
          defaultValue={(currentPlayer !== false) ? currentPlayer : -1}
          currentPlayer={currentPlayer} 
          saveCurrentPlayer={saveCurrentPlayer}
          
        >
          {players.map((p, i) => {
              return <ListItem className="player" key={p.name} value={i} data-index={i} primaryText={
                <div><span>{p.name}</span>
                  {/*<FloatingActionButton 
                    mini={true} 
                    iconStyle={{width: 30, height: 30, lineHeight: '30px'}}
                    style={{width: 30, height: 30}} 
                    onTouchTap={saveCurrentPlayer.bind(this, i)}>
                    <i className="fa fa-check" aria-hidden="true"></i>
                  </FloatingActionButton>*/}
                </div> } />
            })
          }
        </SelectableList>
      </div>
    );
  }
}

export default PlayersList;