import React, { Component } from 'react';


import RaisedButton from 'material-ui/RaisedButton';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';

import uuidV4  from 'uuid/v4';

class DividendModal extends Component {

  render() {
    let {players, open, handleClose, clearState, updateVpPayments} = this.props;

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
            <span className={`stock_split`}>Money</span>
          </div>
          {
            players.map( (player, i) => {
              return (
                <div className="player" key={uuidV4()} >
                  <span className="name">{player.name}</span>
                  <span className="dividends">{player.tmpDividends}</span>
                  <span className={`stock_split`}>
                    {
                      () => {
                        if(player.tmpVP > 0){
                          return(
                            <TextField 
                              className="tmpVpPayment" 
                              inputStyle={ {width: 50, fontSize: 40, height: 60} } 
                              style={{width: 50, fontSize: 40, height: 60}} 
                              key={uuidV4()} 
                              name="tmpVpPayment" 
                              type="number" 
                              defaultValue={player.tmpVP} 
                              onBlur={updateVpPayments.bind(this, i)} />
                          );
                        } else {
                          return(
                            <span className={`stock_split`}>{player.tmpVP}</span>
                          );
                        }



                      }



                    }
                    
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