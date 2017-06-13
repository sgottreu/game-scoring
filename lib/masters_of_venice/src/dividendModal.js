import React, { Component } from 'react';


import RaisedButton from 'material-ui/RaisedButton';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

import uuidV4  from 'uuid/v4';

class DividendModal extends Component {

  render() {
    let {players, open, handleClose, clearState} = this.props;

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
            onTouchTap={clearState}
          />
        ]}
        modal={true}
        open={open}
        onRequestClose={handleClose.bind(this, 'dividendModal')}
      >
        <div className={'dividends_vp '}>
          <div className="player header" key={uuidV4()} >
            <span className="name">Name</span>
            <span className="dividends">Dividends</span>
            <span className={`stock_split`}>VP</span>
          </div>
          {
            players.map( (player, i) => {
              return (
                <div className="player" key={uuidV4()} >
                  <span className="name">{player.name}</span>
                  <span className="dividends">{player.tmpPayments}</span>
                  <span className={`stock_split`}>{player.tmpVP}</span>
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