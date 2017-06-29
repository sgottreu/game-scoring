import React, { Component } from 'react';

import RaisedButton from 'material-ui/RaisedButton';
import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import FontIcon from 'material-ui/FontIcon';

import uuidV4  from 'uuid/v4';

class JoinModal extends Component {
  constructor(props){
    super(props);
    this.nameInput = false;
  }

  componentDidMount() {
    this.props.socket.emit('masVen_available_games', {name: this.props.game_name, game_oid: this.props.game_oid});

    let updateAvailableGames = this.props.updateAvailableGames;

    this.props.socket.on('masVen_available_games', function(games){
      updateAvailableGames(games);
    });
  }

  render() {
    let {open, handleClose, joinGame, availableGames, socket, game_oid, 
      game_name, selectGameInstance, changeJoinName, changeJoinEmail} = this.props;
    if(!open) {
      return false;
    }

    let _i = availableGames.findIndex( game => {
      return game._id === game_oid;
    })
    _i = (_i === -1) ? 'new' : _i+1;

{/*<i class="fa fa-cog" aria-hidden="true"></i>*/}
    return (
      <Dialog
        className="JoinModal"
        title="Join Game"
        actions={[
            <RaisedButton
                label="Join"
                primary={true}
                keyboardFocused={true}
                onTouchTap={joinGame}
                />
        ]}
        modal={true}
        open={open}
        onRequestClose={handleClose.bind(this, 'joinModal')}
      >
        <SelectField
          floatingLabelText="Game Instance"
          value={_i}
          onChange={selectGameInstance}
        >
          <MenuItem key={0} value={'new'} primaryText={'+ Add New Instance'} />
          {
            availableGames.map( (game, i) => {
              return <MenuItem key={i+1} value={i+1} primaryText={'Creator: '+game.creator.name+' - Date: '+game.date} />
            })
          }
        </SelectField>
      </Dialog>
    );
  }
}

export default JoinModal;