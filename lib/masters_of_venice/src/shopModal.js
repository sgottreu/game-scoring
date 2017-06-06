import React, { Component } from 'react';


import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

import uuidV4  from 'uuid/v4';

class ShopModal extends Component {

  render() {
    let {shops, open, selectedShop, handleClose, updateStat} = this.props;
    let shop = shops.find((s) => { return s.key === selectedShop });

    if(shop === undefined){
      return false;
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
            onTouchTap={handleClose.bind(this, 'shopModal')}
          />
        ]}
        modal={false}
        open={open}
        onRequestClose={handleClose.bind(this, 'shopModal')}
      >
        <h5>{shop.name}</h5>
        <div className="stats">
          <span className="price">
            Price:<br/>
            <TextField autoFocus={(this.props.shop_type === 'price') ? true : false} className="shop_price" inputStyle={ {width: 100, fontSize: 40, height: 60} } style={{width: 100, fontSize: 40, height: 60}} key={uuidV4()} name="shop_price" type="number" value={shop.price} 
              onChange={updateStat.bind(this, 'price', {min: 5, max: 100, val: 5})} />
          </span>
          <span className="shares">
            Share:<br/>
            <TextField autoFocus={(this.props.shop_type === 'share') ? true : false} className="shop_share" inputStyle={ {width: 100, fontSize: 40, height: 60} } style={{width: 100, fontSize: 40, height: 60}} key={uuidV4()} name="shop_share" type="number" value={shop.share}
              onChange={updateStat.bind(this, 'share', {min: 5, max: 100, val: 5})}/>
          </span>
          <span className="orders">
            Orders:<br/>
            <TextField autoFocus={(this.props.shop_type === 'orders') ? true : false} className="shop_orders" inputStyle={ {width: 100, fontSize: 40, height: 60} } style={{width: 100, fontSize: 40, height: 60}} key={uuidV4()} name="shop_order" type="number" value={shop.orders} 
              onChange={updateStat.bind(this, 'orders', {min: 0, max: 15, val: 1})}/>
          </span>
        
        </div>

      </Dialog>


    );
  }
}

export default ShopModal;