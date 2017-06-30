import React, { Component } from 'react';

import RaisedButton from 'material-ui/RaisedButton';
import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';

import uuidV4  from 'uuid/v4';

class ShareModal extends Component {
  constructor(props){
    super(props);
    this.nameInput = false;
  }

  render() {
    let {open, handleClose, game_oid, onShareGame} = this.props;
    if(!open) {
      return false;
    }
    let url = window.location+'?game_id='+game_oid
    return (
      <Dialog
        className="ShareModal"
        title="Share Game"
        actions={[
            <RaisedButton
                label="Close"
                primary={true}
                keyboardFocused={true}
                onTouchTap={handleClose.bind(this, 'shareModal')}
                />
        ]}
        modal={true}
        open={open}
        onRequestClose={handleClose.bind(this, 'shareModal')}
      >
        <TextField 
          inputStyle={ {width: 400} } 
          style={{width: 400}} 
          key={uuidV4()} 
          name="shareGame"
          type="text"
          ref="input"
          onFocus={()=>{this.refs.input.select()}}
          value={ window.location+'?game_id='+game_oid} 
        />

      </Dialog>
    );
  }
}

export default ShareModal;