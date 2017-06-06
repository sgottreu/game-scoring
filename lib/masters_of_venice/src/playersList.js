import React, { Component } from 'react';

import {List, ListItem} from 'material-ui/List';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';

class PlayersList extends Component {
  render() {
    let {players, setCurrentName, currentName, addPlayer} = this.props;

    return (
      <div className="PlayersList">
        <div className="addPlayers">
          <TextField hintText="Player Name" name="player_name"
            value={currentName}
            onChange={setCurrentName}/>
            <RaisedButton onTouchTap={addPlayer} label="Add Player" secondary={true} />
        </div>
        <List>
          {players.map(p => {
              return <ListItem key={p.name} primaryText={p.name} />
            })
          }
        </List>
      </div>
    );
  }
}

export default PlayersList;