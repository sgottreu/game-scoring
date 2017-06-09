import React, { Component } from 'react';


import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

import uuidV4  from 'uuid/v4';

class ShopModal extends Component {

  render() {
    let {shops, open, selectedShop, handleClose, updateStat, selectedAction, handleActionChange, actions,
          actionStats, showDividend} = this.props;
    let shop = shops.find((s) => { return s.key === selectedShop });

    if(shop === undefined){
      return false;
    }

    let hide = {resource_price : '', share_price: '', orders: ''};

    if(selectedAction === 'bidding' || selectedAction === 'favor'){
      hide = {resource_price : 'hide', share_price: 'hide', orders: ''};
    }

    return (
      
      <Dialog
        className="ShopModal"
        title="Update Shops"
        actions={[
          <FlatButton
            label="Cancel"
            primary={true}
            onTouchTap={handleClose.bind(this, 'shopModal')}
          />,
          <RaisedButton
            label="Submit"
            primary={true}
            keyboardFocused={true}
            onTouchTap={showDividend}
          />
        ]}
        modal={false}
        open={open}
        onRequestClose={handleClose.bind(this, 'shopModal')}
      >
        <h5>{shop.name}</h5>
        <SelectField
          floatingLabelText="Action"
          value={selectedAction}
          onChange={handleActionChange}
        >
          {
            actions.map( (action, i) => {
              if(action.type == 'action'){
                return false;
              }
              return <MenuItem key={i} value={action.key} primaryText={action.name} />
            })
          }
        </SelectField>
        <div className="stats">
          <span className={`resource_price ${hide.resource_price}`}>
            Price:<br/>
            <TextField autoFocus={(this.props.shop_type === 'resource_price') ? true : false} 
              className="shop_price" 
              inputStyle={ {width: 100, fontSize: 40, height: 60} } 
              style={{width: 100, fontSize: 40, height: 60}} 
              key={uuidV4()} 
              name="shop_price" 
              type="number" 
              value={actionStats[ shop.key ].move_price} 
              onChange={updateStat.bind(this, 'move_price')} />
          </span>
          <span className={`shares ${hide.share_price}`}>
            Share:<br/>
            <TextField autoFocus={(this.props.shop_type === 'share_price') ? true : false} 
              className="shop_share" 
              inputStyle={ {width: 100, fontSize: 40, height: 60} } 
              style={{width: 100, fontSize: 40, height: 60}} 
              key={uuidV4()} 
              name="shop_share" 
              type="number" 
              value={actionStats[ shop.key ].move_share}
              onChange={updateStat.bind(this, 'move_share')}/>
          </span>
          <span className={`orders ${hide.orders}`}>
            Orders:<br/>
            <TextField autoFocus={(this.props.shop_type === 'orders') ? true : false} 
              className="shop_orders" inputStyle={ {width: 100, fontSize: 40, height: 60} } 
              style={{width: 100, fontSize: 40, height: 60}} 
              key={uuidV4()} 
              name="shop_order" 
              type="number" 
              value={actionStats[ shop.key ].move_orders} 
              onChange={updateStat.bind(this, 'move_orders')}/>
          </span>
        
        </div>

      </Dialog>


    );
  }
}

export default ShopModal;