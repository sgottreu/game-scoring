import React, { Component } from 'react';


import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';
import FontIcon from 'material-ui/FontIcon';

import uuidV4  from 'uuid/v4';



class ActionModal extends Component {

  render() {
    let {shops, open, handleClose, selectedAction, handleActionChange,  
          changeActionQuantity, changeActionEvent, actionStats, actionMsg, currentPlayer, players,
          showDividend, actionPayments, actions, changeShippingOffice, modalConfirm, confirmButton} = this.props;

    if(!open){
      return false;
    }

    let PaymentString = '';
    if(actionPayments.type){
      PaymentString = (actionPayments.type === 'payments') ? `Pay: ${actionPayments.amount}` : `Receive: ${actionPayments.amount}`;
    }
    let playerName = (currentPlayer !== false) ? players[ currentPlayer ].name : '';

    let buttonActions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onTouchTap={handleClose.bind(this, 'actionModal')}
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
          onTouchTap={showDividend}
        />
      );
    }


    return (
      <div className="actions">
        
        <Dialog
          className="ActionModal"
          title={`Perform Action - ${playerName}`}
          actions={buttonActions}
          modal={true}
          open={open}
          onRequestClose={handleClose.bind(this, 'actionModal')}
          bodyStyle={{minHeight:400}}
        >
          <SelectField
            floatingLabelText="Action"
            value={selectedAction}
            onChange={handleActionChange}
          >
            {
              actions.map( (action, i) => {
                if(action.type === 'sub'){
                  return false;
                }
                return <MenuItem key={i} value={action.key} primaryText={action.name} />
              })
            }
          </SelectField>
          <div className={'actionMsg '+((actionMsg === '') ? ' hide' : '')}>
            <FontIcon className="fa fa-exclamation-circle" /> {actionMsg}
          </div>
          <div className={'payments '+((actionPayments.type && selectedAction !== 'shipping_offices' && selectedAction !== 'guild_hall')? '':'hide')}>{PaymentString}</div>
          <div className={'shipping_offices '+((selectedAction !== 'shipping_offices')? 'hide' : '')}>
            <RadioButtonGroup 
              name='shipping_office' 
              onChange={changeShippingOffice}
              defaultSelected="north" 
              className={`radioBtns `}  >
              <RadioButton
                value="north"
                label="North"
              />
              <RadioButton
                value="south"
                label="South"
              />
            </RadioButtonGroup>
          </div>
          
          

          <div className={'resources '+((selectedAction === 'stock_market') ? 'hide' : '')}>
            {
              shops.map( (shop, i) => {
                if(!shop.shop){
                  return false;
                }
                let hideBuySell = '';
                if(selectedAction === 'shipping_offices' || selectedAction === 'docks' || selectedAction === 'shops' || selectedAction === 'guild_hall'){
                  hideBuySell = ' hide ';
                }
                return (
                  <div className="resource" key={uuidV4()} >
                    <span className="name">{shop.resource}</span>
                    <TextField 
                      onBlur={changeActionQuantity.bind(this, shop.key)}
                      inputStyle={ {width: 50, fontSize: 24, height: 40, textAlign: 'center'} } 
                      style={{width: 50, fontSize: 24, height: 40}} 
                      key={uuidV4()} 
                      name={shop.key+'_resources'} 
                      type="number"
                      defaultValue={actionStats[ shop.key ].quantity} 
                    />
                    <RadioButtonGroup 
                      name={shop.key+'_resources_radio'} 
                      onChange={changeActionEvent.bind(this, shop.key)}
                      defaultSelected={actionStats[ shop.key ].action} 
                      className={`radioBtns ${hideBuySell}`}  >
                      <RadioButton
                        value="buy"
                        label="Buy"
                      />
                      <RadioButton
                        value="sell"
                        label="Sell"
                      />
                    </RadioButtonGroup>
                  </div>
                )
              })
            }
          </div>
          <div className={'stocks '+((selectedAction !== 'stock_market') ? 'hide' : '')}>
            {
              shops.map( (shop, i) => {
                if(!shop.stocks){
                  return false;
                }
                return (
                  <div className="stock" key={uuidV4()} >
                    <span className="name">{shop.name}</span>
                    <TextField 
                      onBlur={changeActionQuantity.bind(this, shop.key)}
                      inputStyle={ {width: 50, fontSize: 24, height: 40, textAlign: 'center'} } 
                      style={{width: 50, fontSize: 24, height: 40}} 
                      key={uuidV4()} 
                      name={shop.key+'_stocks'} 
                      type="number" 
                      defaultValue={actionStats[ shop.key ].quantity} 
                    />
                      <RadioButtonGroup 
                        name={shop.key+'_stocks_radio'} 
                        onChange={changeActionEvent.bind(this, shop.key)}
                        defaultSelected={actionStats[ shop.key ].action} 
                        className="radioBtns">
                        <RadioButton
                          value="buy"
                          label="Buy"
                        />
                        <RadioButton
                          value="sell"
                          label="Sell"
                        />
                      </RadioButtonGroup>
                  </div>
                )
              })
            }
          </div>
        </Dialog>
      </div>
    );
  }
}

export default ActionModal;