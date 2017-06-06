import React, { Component } from 'react';

import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';

const style = {
  height: 200,
  width: 200,
  minWidth: 200,
  margin: 20,
  textAlign: 'center'
};

class ShopListings extends Component {
  render() {
    let {shops, selectShop} = this.props;

    return (
      <div className="shopListings" style={{display: 'flex', flexWrap: 'wrap'}}>
          {shops.map((shop) => (
            <Paper key={shop.key} style={style} zDepth={4} >
              <h5>{shop.name}</h5>
              <div className="price">Product Price: {shop.price}</div>
              <div className={'shares '+((shop.share === false) ? 'hide' : '')}>Share Price: {shop.share}</div>
              <div className={'orders '+((shop.orders === -1) ? 'hide' : '')}>Orders: {shop.orders}</div>

              <RaisedButton onTouchTap={selectShop.bind(this, shop.key)} label={<i className="fa fa-pencil" aria-hidden="true"></i>} secondary={true} />
              
            </Paper>
          ))}
      </div>

    );
  }
}

export default ShopListings;