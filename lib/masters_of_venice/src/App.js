import React, { Component } from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import injectTapEventPlugin from 'react-tap-event-plugin';


import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import {List, ListItem} from 'material-ui/List';

import './App.css';
import ShopListings from './shopListings';
import ShopModal from './shopModal';

injectTapEventPlugin();

const stocks = [
        {name: 'Blacksmith', key: 'blacksmith', shares: 0 },
        {name: 'Tailor', key: 'tailor', shares: 0 },
        {name: 'Miller', key: 'miller', shares: 0 },
        {name: 'Jeweler', key: 'jeweler', shares: 0 },
        {name: 'Spices', key: 'spices', shares: 0 },
        {name: 'North Shipping', key: 'nshipping', shares: 0},
        {name: 'South Shipping', key: 'sshipping', shares: 0}
      ];

class App extends Component {

  constructor(props){
    super(props);

    this.state = { 
      shopModal: false,
      shop_type: false,
      currentName: '',
      selectedShop: false,
      shops: [
        {name: 'Blacksmith', key: 'blacksmith', price: 40, share: 40, orders: 2},
        {name: 'Tailor', key: 'tailor', price: 40, share: 40, orders: 2},
        {name: 'Miller', key: 'miller', price: 40, share: 40, orders: 2},
        {name: 'Jeweler', key: 'jeweler', price: 40, share: 40, orders: 2},
        {name: 'Spices', key: 'spices', price: 40, share: 40, orders: 2},
        {name: 'Lumber', key: 'lumber', price: 40, share: false, orders: -1}
      ],
      players: [],
    };

    this.addPlayer          = this.addPlayer.bind(this);
    this.setCurrentName     = this.setCurrentName.bind(this);
    this.selectShop         = this.selectShop.bind(this);
    this.handleClose        = this.handleClose.bind(this);
    this.updateMoney        = this.updateMoney.bind(this);
    this.updateOrders        = this.updateOrders.bind(this);

  }

  setCurrentName = (e, v) => {
    this.setState( { currentName: v } );
  }
  addPlayer = (e,i,v) => {
    let state = this.state;
    state.players.push(
      { name: state.currentName, stocks: stocks, bank: 0 }
    );
    state.currentName = '';
    this.setState( state );
  }

  selectShop = (key, e) => {
    this.setState( {
      selectedShop: key,
      shopModal: true
    } );
    console.log(this.state);
  }

  handleClose = () => {
    this.setState({shopModal: false});
  };

  updateMoney = (type, e) => {
    let selectedShop = this.state.selectedShop;
    let _i = this.state.shops.findIndex((s) => { return s.key === selectedShop });

    let state = this.state;

    if(e.target.value < state.shops[_i][ type ] && state.shops[_i][ type ] > 5) {
      state.shops[_i][ type ] = state.shops[_i][ type ] - 5;
    } else if(e.target.value > state.shops[_i][ type ] && state.shops[_i][ type ] < 100){
      state.shops[_i][ type ] = state.shops[_i][ type ] + 5;
    }
    state.shop_type = type;
    this.setState( state );
  };

  updateOrders = (e) => {
    let selectedShop = this.state.selectedShop;
    let _i = this.state.shops.findIndex((s) => { return s.key === selectedShop });

    let state = this.state;
    state.shop_type = 'orders';

    if(e.target.value < state.shops[_i].orders && state.shops[_i].orders > 0) {
      state.shops[_i].orders = e.target.value;
    } else if(e.target.value > state.shops[_i].orders && state.shops[_i].orders < 15){
      state.shops[_i].orders = e.target.value;
    }
    this.setState( state );
  };

  render() {
    console.log(this.state);
    return (
      <MuiThemeProvider>
        <div className="App">
          <ShopListings shops={this.state.shops} selectShop={this.selectShop}/>
          <div className="players">
            <TextField hintText="Player Name" name="player_name"
              value={this.state.currentName}
              onChange={this.setCurrentName}/><RaisedButton onTouchTap={this.addPlayer} label="Add Player" secondary={true} />
          </div>
          <ShopModal shops={this.state.shops} 
            updateMoney={this.updateMoney}
            updateOrders={this.updateOrders}
            handleClose={this.handleClose}
            open={this.state.shopModal} 
            shop_type={this.state.shop_type}
            selectedShop={this.state.selectedShop} />
          <List>
            {this.state.players.map(p => {
                return <ListItem key={p.name} primaryText={p.name} />
              })
            }
          </List>
        </div>
      </MuiThemeProvider>
    );
  }
}

export default App;
