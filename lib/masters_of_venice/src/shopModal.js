import React, { Component } from 'react';


import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

class ShopModal extends Component {
  render() {
    let {shops, open, selectedShop, handleClose} = this.props;

    return (
      
          <Dialog
            title="Update Shops"
            actions={[
              <FlatButton
                label="Cancel"
                primary={true}
                onTouchTap={handleClose}
              />,
              <RaisedButton
                label="Submit"
                primary={true}
                keyboardFocused={true}
                onTouchTap={handleClose}
              />
            ]}
            modal={false}
            open={open}
            onRequestClose={handleClose}
          >
          </Dialog>


    );
  }
}

export default ShopModal;