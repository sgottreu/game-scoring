import React, { Component } from 'react';


import RaisedButton from 'material-ui/RaisedButton';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

import uuidV4  from 'uuid/v4';

class DividendModal extends Component {

  render() {
    let {shops, players, open, handleClose, selectedAction} = this.props;

    return (
      
      <Dialog
        className="DividendModal"
        title="Dividends"
        actions={[
          <FlatButton
            label="Cancel"
            primary={true}
            onTouchTap={handleClose.bind(this, 'dividendModal')}
          />,
          <RaisedButton
            label="Finish"
            primary={true}
            keyboardFocused={true}
            onTouchTap={handleClose.bind(this, 'dividendModal')}
          />
        ]}
        modal={true}
        open={open}
        onRequestClose={handleClose.bind(this, 'dividendModal')}
      >
        <div className={'stocks '}>
          {
            players.map( (player, i) => {
              return (
                <div className="player" key={uuidV4()} >
                  <span className="name">{player.name}</span>
                  <span className="dividends">{player.tmpPayments}</span>
                </div>
              )
            })
          }
        </div>

      </Dialog>


    );
  }
}

export default DividendModal;