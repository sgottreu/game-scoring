import React, { Component } from 'react';

import RaisedButton from 'material-ui/RaisedButton';
import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import FontIcon from 'material-ui/FontIcon';

import uuidV4  from 'uuid/v4';

class ConnectModal extends Component {
  constructor(props){
    super(props);
    this.nameInput = false;
  }

  render() {
    let {open, handleClose, joinGame, client, connectSite, changeJoinName, changeJoinEmail} = this.props;
    if(!open) {
      return false;
    }

    return (
      <Dialog
        className="ConnectModal"
        title="Connect to Scoring Meeples"
        actions={[
            <RaisedButton
                label="Join"
                primary={true}
                keyboardFocused={true}
                onTouchTap={connectSite}
                />
        ]}
        modal={true}
        open={open}
        onRequestClose={handleClose.bind(this, 'connectModal')}
      >
        <TextField 
          name="username"
          value={client.name}
          floatingLabelText="Name"
          floatingLabelFixed={true}
          onChange={changeJoinName}
        />
        <br/>
        <TextField 
          name="email"
          value={client.email}
          floatingLabelText="Email"
          floatingLabelFixed={true}
          onChange={changeJoinEmail}
        />
      </Dialog>
    );
  }
}

export default ConnectModal;