import React, { Component } from 'react';


import RaisedButton from 'material-ui/RaisedButton';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';

import uuidV4  from 'uuid/v4';

class DividendModal extends Component {
  constructor(props){
    super(props);
    this.vpText  = this.vpText.bind(this);
  }

  vpText = (player, i) => {
    if(player.tmpVP > 0 && this.props.selectedAction === 'guild_hall'){
      return(
        <TextField 
          className="tmpVpPayment" 
          inputStyle={ {width: 50, fontSize: 40, height: 60} } 
          style={{width: 50, fontSize: 40, height: 60}} 
          key={uuidV4()} 
          name="tmpVpPayment" 
          type="number" 
          defaultValue={player.tmpVP} 
          onBlur={this.props.calculateVpPayments.bind(this, i)} />
      );
    } else {
      return(
        <span className={`stock_split`}>{player.tmpVP}</span>
      );
    }
  }

  render() {
    let {players, open, handleClose, updateVP, modalConfirm, confirmButton} = this.props;

    let buttonActions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onTouchTap={handleClose.bind(this, 'dividendModal')}
      />
    ];

    if(!modalConfirm) {
      buttonActions.push(
        <RaisedButton
          label="Confirm"
          primary={true}
          keyboardFocused={true}
          onTouchTap={confirmButton}
        />
      );
    } else {
      buttonActions.push(
        <RaisedButton
          label="Next"
          primary={true}
          keyboardFocused={true}
          onTouchTap={updateVP}
        />
      );
    }

    return (
      
      <Dialog
        className="DividendModal"
        title="Dividends"
        actions={buttonActions}
        modal={true}
        open={open}
        onRequestClose={handleClose.bind(this, 'dividendModal')}
      >
        <div className={'dividends_vp '}>
          <div className="player header" key={uuidV4()} >
            <span className="name">Name</span>
            <span className="dividends">Dividends</span>
            <span className={`stock_split`}>VP</span>
            <span className={`stock_split`}>Money</span>
          </div>
          {
            players.map( (player, i) => {
              return (
                <div className="player" key={uuidV4()} >
                  <span className="name">{player.name}</span>
                  <span className="dividends">{player.tmpDividends}</span>
                  <span className={`stock_split`}>
                    { this.vpText(player, i) }                    
                  </span>
                  <span className={`stock_split`}>{player.tmpVpPayments}</span>
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