import React, { Component } from 'react';


import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import FontIcon from 'material-ui/FontIcon';
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';

import uuidV4  from 'uuid/v4';

class ShopModal extends Component {

  render() {
    let {shops, open, selectedShop, handleClose, updateStat, selectedAction, handleActionChange, actions,
          actionStats, showDividend, actionMsg, modalConfirm, confirmButton} = this.props;

    if(!open){
      return false;
    }
    
    let shop = shops.find((s) => { return s.key === selectedShop });

    if(shop === undefined){
      return false;
    }

    let hide = {resource_price : '', share_price: '', orders: '', stock_majority: 'hide'};

    if(selectedAction === 'bidding' || selectedAction === 'favor'){
      hide = {resource_price : 'hide', share_price: 'hide', orders: '', stock_majority: 'hide'};
    }
    if(selectedAction === 'stock_majority'){
      hide = {resource_price : 'hide', share_price: 'hide', orders: 'hide', stock_majority: ''};
    }

    let buttonActions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onTouchTap={handleClose.bind(this, 'shopModal')}
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
      
      <Dialog
        className="ShopModal"
        title="Update Shops"
        actions={buttonActions}
        modal={false}
        open={open}
        onRequestClose={handleClose.bind(this, 'shopModal')}
      >
        <h5>{shop.name}</h5>
        <div className={'actionMsg '+((actionMsg === '') ? 'hide' : '')}>
          <FontIcon className="fa fa-exclamation-circle" /> {actionMsg}
        </div>


        <SelectField
          floatingLabelText="Action"
          value={selectedAction}
          onChange={handleActionChange}
        >
          {
            actions.map( (action, i) => {
              if(action.type === 'action'){
                return false;
              }
              return <MenuItem key={i} value={action.key} primaryText={action.name} />
            })
          }
        </SelectField>
        <div className="stats">
          <span className={`resource_price ${hide.resource_price}`}>
            Price:<br/>
            <TextField 
              className="shop_price" 
              inputStyle={ {width: 100, fontSize: 40, height: 60} } 
              style={{width: 100, fontSize: 40, height: 60}} 
              key={uuidV4()} 
              name="shop_price" 
              type="number" 
              defaultValue={actionStats[ shop.key ].move_price} 
              onBlur={updateStat.bind(this, 'move_price')} />
          </span>
          <span className={`shares ${hide.share_price}`}>
            Share:<br/>
            <TextField 
              className="shop_share" 
              inputStyle={ {width: 100, fontSize: 40, height: 60} } 
              style={{width: 100, fontSize: 40, height: 60}} 
              key={uuidV4()} 
              name="shop_share" 
              type="number" 
              defaultValue={actionStats[ shop.key ].move_share}
              onBlur={updateStat.bind(this, 'move_share')}/>
          </span>
          <span className={`orders ${hide.orders}`}>
            Orders:<br/>
            <TextField 
              className="shop_orders" inputStyle={ {width: 100, fontSize: 40, height: 60} } 
              style={{width: 100, fontSize: 40, height: 60}} 
              key={uuidV4()} 
              name="shop_order" 
              type="number" 
              defaultValue={actionStats[ shop.key ].move_orders} 
              onBlur={updateStat.bind(this, 'move_orders')}/>
          </span>
          <RadioButtonGroup 
            name='stock_majority_btns' 
            onChange={updateStat.bind(this, 'stock_majority')}
            defaultSelected="increase" 
            className={`radioBtns stock_majority ${hide.stock_majority}`}  >
            <RadioButton
              value="increase"
              style={{"margin": "10px 0px"}}
              label={<span><FontIcon className="fa fa-arrow-up" /><FontIcon className="fa fa-usd" /><span className="mod">x 2</span><FontIcon className="fa fa-arrow-down" /><FontIcon className="fa fa-shopping-basket" /><span className="mod">x 1</span></span>}
            />
            <RadioButton
              value="decrease"
              style={{"margin": "10px 0px"}}
              label={<span><FontIcon className="fa fa-arrow-down" /><FontIcon className="fa fa-usd" /><span className="mod">x 2</span><FontIcon className="fa fa-arrow-up" /><FontIcon className="fa fa-shopping-basket" /><span className="mod">x 1</span></span>}
            />
          </RadioButtonGroup>
      
        </div>

      </Dialog>


    );
  }
}

export default ShopModal;