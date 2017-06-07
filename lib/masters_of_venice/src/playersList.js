import React, { Component } from 'react';

import {List, ListItem} from 'material-ui/List';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import FloatingActionButton from 'material-ui/FloatingActionButton';

class PlayersList extends Component {
  render() {
    let {players, setCurrentName, currentName, addPlayer, saveCurrentPlayer} = this.props;

    return (
      <div className="PlayersList">
        <div className="addPlayers">
          <TextField hintText="Player Name" name="player_name"
            value={currentName}
            onChange={setCurrentName}/>
            <RaisedButton onTouchTap={addPlayer} label="Add Player" secondary={true} />
        </div>
        <List>
          {players.map((p, i) => {
              return <ListItem key={p.name} primaryText={<div><span>{p.name}</span>
                  <FloatingActionButton 
                    mini={true} 
                    onTouchTap={saveCurrentPlayer.bind(this, i)}>
                    <i className="fa fa-check" aria-hidden="true"></i>
                  </FloatingActionButton></div> } />
            })
          }
        </List>
      </div>
    );
  }
}

export default PlayersList;