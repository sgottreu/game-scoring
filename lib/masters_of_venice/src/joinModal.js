import React, { Component } from 'react';

import RaisedButton from 'material-ui/RaisedButton';
import Dialog from 'material-ui/Dialog';

import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

class JoinModal extends Component {
  constructor(props){
    super(props);
    this.nameInput = false;
  }

  componentDidMount() {
    let updateAvailableGames = this.props.updateAvailableGames;
    this.props.socket.emit('masVen_available_games', {name: this.props.game_name, game_oid: this.props.game_oid});
    this.props.socket.on('masVen_available_games', function(games){
      updateAvailableGames(games);
    });
  }

  render() {
    let {open, handleClose, joinGame, availableGames, selectGameInstance, selectedGame } = this.props;
    if(!open) {
      return false;
    }

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
          value={ selectedGame }
          onChange={selectGameInstance}
          autoWidth={true}
          style={{width: 400}}
        >
          <MenuItem key={0} value={0} primaryText={'+ Add New Instance'} />
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