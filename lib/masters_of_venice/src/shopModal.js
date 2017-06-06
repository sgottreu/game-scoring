import React, { Component } from 'react';


import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

import uuidV4  from 'uuid/v4';

class ShopModal extends Component {
  componentDidUpdate(prevProps, prevState){
    console.log( '.stats .shop_'+prevProps.shop_type+' input' );
      if(prevProps.shop_type) {
        document.querySelector('.stats .shop_'+prevProps.shop_type+' input').focus();
      }
  }

  render() {
    let {shops, open, selectedShop, handleClose, updateMoney, updateOrders} = this.props;
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
        <h5>{shop.name}</h5>
        <div className="stats">
          <span className="price">
            Price:<br/>
            <TextField className="shop_price" autoFocus={true} inputStyle={ {width: 100, fontSize: 40, height: 60} } style={{width: 100, fontSize: 40, height: 60}} key={uuidV4()} name="shop_price" type="number" value={shop.price} onChange={updateMoney.bind(this, 'price')} />
          </span>
          <span className="shares">
            Share:<br/>
            <TextField className="shop_share" inputStyle={ {width: 100, fontSize: 40, height: 60} } style={{width: 100, fontSize: 40, height: 60}} key={uuidV4()} name="shop_share" type="number" value={shop.share}  onChange={updateMoney.bind(this, 'share')}/>
          </span>
          <span className="orders">
            Orders:<br/>
            <TextField className="shop_orders" inputStyle={ {width: 100, fontSize: 40, height: 60} } style={{width: 100, fontSize: 40, height: 60}} key={uuidV4()} name="shop_order" type="number" value={shop.orders}  onChange={updateOrders}/>
          </span>
        
        </div>

      </Dialog>


    );
  }
}

export default ShopModal;