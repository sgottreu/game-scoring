import React, { Component } from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import injectTapEventPlugin from 'react-tap-event-plugin';

import './App.css';
import ShopListings from './shopListings';
import ShopModal from './shopModal';
import PlayersList from './playersList';
import ActionModal from './actionModal';

import * as Actions from './lib/Actions';

injectTapEventPlugin();

const shops = [
        {name: 'Blacksmith', key: 'blacksmith', resource: 'Iron',  shop: true, stocks: true, resource_price: 40, share_price: 40, orders: 2, shares: 10},
        {name: 'Tailor', key: 'tailor', resource: 'Fabric',  shop: true, stocks: true, resource_price: 40, share_price: 40, orders: 2, shares: 10},
        {name: 'Miller', key: 'miller', resource: 'Grain',  shop: true, stocks: true, resource_price: 40, share_price: 40, orders: 2, shares: 10},
        {name: 'Jeweler', key: 'jeweler', resource: 'Gems',  shop: true, stocks: true, resource_price: 40, share_price: 40, orders: 2, shares: 10},
        {name: 'Spice Shop', key: 'spices', resource: 'Spices',  shop: true, stocks: true, resource_price: 40, share_price: 40, orders: 2, shares: 10},
        {name: 'Lumber', key: 'lumber', resource: 'Lumber',  shop: true, stocks: false, resource_price: 40, share_price: false, orders: -1, shares: 10},
        {name: 'North Shipping', key: 'nshipping', shop: false, stocks: true, shares: 10},
        {name: 'South Shipping', key: 'sshipping', shop: false, stocks: true, shares: 10}
      ];

const clone = (data) => {
  return (data === undefined) ? {} : JSON.parse(JSON.stringify(data));
}

class App extends Component {

  constructor(props){
    super(props);

    this.state = { 
      shopModal: false,
      actionModal: false,
      shop_type: false,
      currentName: '',
      currentPlayer: false,
      selectedShop: false,
      selectedAction: false,
      shops: clone(shops),
      players: [],
      actionStats: {
        'blacksmith': { quantity: 0, action: 'buy'},
        'tailor': { quantity: 0, action: 'buy'},
        'miller': { quantity: 0, action: 'buy'},
        'jeweler': { quantity: 0, action: 'buy'},
        'spices': { quantity: 0, action: 'buy'},
        'lumber': { quantity: 0, action: 'buy'},
        'nshipping': { quantity: 0, action: 'buy'},
        'sshipping': { quantity: 0, action: 'buy'}
      }
    };

    this.addPlayer              = this.addPlayer.bind(this);
    this.setCurrentName         = this.setCurrentName.bind(this);
    this.selectShop             = this.selectShop.bind(this);
    this.selectAction           = this.selectAction.bind(this);
    this.handleClose            = this.handleClose.bind(this);
    this.updateStat             = this.updateStat.bind(this);
    this.openActionModal        = this.openActionModal.bind(this);
    this.changeActionQuantity   = this.changeActionQuantity.bind(this);
    this.changeActionEvent      = this.changeActionEvent.bind(this);
    this.saveCurrentPlayer      = this.saveCurrentPlayer.bind(this);
  }

  setCurrentName = (e, v) => {
    this.setState( { currentName: v } );
  }
  addPlayer = (e,i,v) => {
    let state = this.state;
    state.players.push(
      { name: state.currentName, stocks: {}, bank: 0, vp: 0 }
    );

    state.currentName = '';
    this.setState( state );
  }

  selectShop = (key, e) => {
    this.setState( {
      selectedShop: key,
      shopModal: true
    } );
  }

  selectAction = (e, i, v) => {
    this.setState( { selectedAction: v } );
  }

  openActionModal = () => {
    this.setState( { actionModal: true } );
  }

  saveCurrentPlayer = (index) => {
    this.setState( { currentPlayer: index } );
  }

  handleClose = (modal) => {
    let state = this.state;
    state[ modal ] = false;
    this.setState( state );
  };

  changeActionQuantity = (key, e) => {
    let state = this.state;
    state.actionStats[ key ].quantity = e.target.value;
    this.setState( state );
  }

  changeActionEvent = (key, e) => {
    let state = this.state;
    state.actionStats[ key ].action = e.target.value;
    this.setState( state );
  }

  updateStat = (type, opts, e) => {
    let selectedShop = this.state.selectedShop;
    let _i = this.state.shops.findIndex((s) => { return s.key === selectedShop });

    let state = this.state;

    if(e.target.value < state.shops[_i][ type ] && state.shops[_i][ type ] > opts.min) {
      state.shops[_i][ type ] = state.shops[_i][ type ] - opts.val;
    } else if(e.target.value > state.shops[_i][ type ] && state.shops[_i][ type ] < opts.max){
      state.shops[_i][ type ] = state.shops[_i][ type ] + opts.val;
    }
    state.shop_type = type;
    this.setState( state );
  };

  saveAction = () => {

  }

  render() {
    return (
      <MuiThemeProvider>
        <div className="App">
          <ShopListings 
            shops={this.state.shops} 
            selectShop={this.selectShop}
          />
          <ShopModal shops={this.state.shops} 
            updateStat={this.updateStat}
            handleClose={this.handleClose}
            open={this.state.shopModal} 
            shop_type={this.state.shop_type}
            selectedShop={this.state.selectedShop} 
          />
          <ActionModal 
            shops={this.state.shops} 
            handleClose={this.handleClose}
            open={this.state.actionModal} 
            openActionModal={this.openActionModal}
            selectedAction={this.state.selectedAction}
            handleActionChange={this.selectAction}
            changeActionQuantity={this.changeActionQuantity}
            changeActionEvent={this.changeActionEvent}
            actionStats={this.state.actionStats}
          />
          <PlayersList
            currentName={this.state.currentName}
            setCurrentName={this.setCurrentName}
            addPlayer={this.addPlayer}
            players={this.state.players}
            saveCurrentPlayer={this.saveCurrentPlayer}
          />
        </div>
      </MuiThemeProvider>
    );
  }
}

export default App;
