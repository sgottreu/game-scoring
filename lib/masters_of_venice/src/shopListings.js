import React, { Component } from 'react';

import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';
import FontIcon from 'material-ui/FontIcon';
import Chip from 'material-ui/Chip';


class ShopListings extends Component {
  render() {
    let {shops, selectShop} = this.props;

    return (
      <div className="shopListings" style={{display: 'flex', flexWrap: 'wrap'}}>
          {shops.map((shop) => {
            
            if(!shop.shop){
              return false;
            }

            return (
              <Paper key={shop.key} className="paperCube" zDepth={4} >
                <h5>{shop.name}</h5>
                <div className="stats">
                  <Chip className='price chip'>
                    <FontIcon className="fa fa-usd" /><br/>
                    <span className="value">{shop.resource_price}</span>
                  </Chip>
                  <Chip className={'shares chip '+((shop.share_price === false) ? 'hide' : '')} >
                    <FontIcon className="fa fa-line-chart" /><br/>
                    <span className="value">{shop.share_price}</span>
                  </Chip>
                  <Chip className={'orders chip '+((shop.orders === -1) ? 'hide' : '')} >
                    <FontIcon className="fa fa-shopping-basket" /><br/>
                    <span className="value">{shop.orders}</span>
                  </Chip>
                </div>
                <RaisedButton onTouchTap={selectShop.bind(this, shop.key)} label={<i className="fa fa-pencil" aria-hidden="true"></i>} secondary={true} />
                
              </Paper>
            );
          })}
      </div>

    );
  }
}

export default ShopListings;