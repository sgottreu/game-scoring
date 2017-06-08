import React, { Component } from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import injectTapEventPlugin from 'react-tap-event-plugin';

import './App.css';
import ShopListings from './shopListings';
import ShopModal from './shopModal';
import PlayersList from './playersList';
import ActionModal from './actionModal';
import DividendModal from './dividendModal';

import * as Actions from './lib/Actions';

injectTapEventPlugin();

const shops = [
        {name: 'Blacksmith', key: 'blacksmith', resource: 'Iron',  shop: true, stocks: true, resource_price: 40, share_price: 40, orders: 2, shares: 10},
        {name: 'Tailor', key: 'tailor', resource: 'Fabric',  shop: true, stocks: true, resource_price: 40, share_price: 40, orders: 2, shares: 10},
        {name: 'Miller', key: 'miller', resource: 'Grain',  shop: true, stocks: true, resource_price: 40, share_price: 40, orders: 2, shares: 10},
        {name: 'Jeweler', key: 'jeweler', resource: 'Gems',  shop: true, stocks: true, resource_price: 40, share_price: 40, orders: 2, shares: 10},
        {name: 'Spice Shop', key: 'spices', resource: 'Spices',  shop: true, stocks: true, resource_price: 40, share_price: 40, orders: 2, shares: 10},
        {name: 'Lumber', key: 'lumber', resource: 'Lumber',  shop: true, stocks: false, resource_price: 40, share_price: false, orders: -1, shares: 10},
        {name: 'North Shipping', key: 'nshipping', shop: false, stocks: true, share_price: 20, shares: 10},
        {name: 'South Shipping', key: 'sshipping', shop: false, stocks: true, share_price: 20, shares: 10}
      ];

const actionStats = {
        'blacksmith': { quantity: 0, action: 'buy'},
        'tailor': { quantity: 0, action: 'buy'},
        'miller': { quantity: 0, action: 'buy'},
        'jeweler': { quantity: 0, action: 'buy'},
        'spices': { quantity: 0, action: 'buy'},
        'lumber': { quantity: 0, action: 'buy'},
        'nshipping': { quantity: 0, action: 'buy'},
        'sshipping': { quantity: 0, action: 'buy'}
      };

const clone = (data) => {
  return (data === undefined) ? {} : JSON.parse(JSON.stringify(data));
}

class App extends Component {

  constructor(props){
    super(props);

    this.state = { 
      shopModal: false,
      actionModal: false,
      dividendModal: false,
      shop_type: false,
      currentName: '',
      currentPlayer: false,
      selectedShop: false,
      selectedAction: false,
      shops: clone(shops),
      players: [],
      actionStats: clone(actionStats),
      actionMsg: '',
      actionPayments: { amount: 0, type: false}
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
    this.saveAction             = this.saveAction.bind(this);
    this.calculatePayments      = this.calculatePayments.bind(this);
    this.showDividend           = this.showDividend.bind(this);
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
    let state = this.state;
    state.selectedAction = v;
    
    if(state.selectedAction){
      state.actionMsg = '';
    }

    this.setState( state );
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

    state = this.calculatePayments(state);

    this.setState( state );
  }

  changeActionEvent = (key, e) => {
    let state = this.state;
    state.actionStats[ key ].action = e.target.value;

    state = this.calculatePayments(state);

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

  calculatePayments = (state) => {
    let stats = state.actionStats;
    let receivable = 0, payments = 0;

    Object.entries(stats).forEach(([key, stat]) => {      
      if(stat.quantity > 0){
        let _i = state.shops.findIndex((s) => { return s.key === key });
        
        if(state.selectedAction === 'stock_market'){
          if(stat.action === 'buy'){
            payments += state.shops[ _i ].share_price * stat.quantity;
          } else {
            receivable += state.shops[ _i ].share_price * stat.quantity;
          }
        } else {
          if(stat.action === 'buy'){
            payments += state.shops[ _i ].resource_price * stat.quantity;
          } else {
            receivable += state.shops[ _i ].resource_price * stat.quantity;
          }
        }

      }
    });

    if(payments === receivable){
      state.actionPayments = { amount: 0, type: false};
    } else {
      if(payments >= receivable){
        state.actionPayments = { amount: payments - receivable, type: 'payments'};
      } else {
        state.actionPayments = { amount: receivable - payments, type: 'receivable'};
      }
    }
    return state;
  }

  showDividend = () => {
    let state = this.state;

    if(!state.selectedAction){
      state.actionMsg = 'Please select an action';
    } else {
      state = this.saveAction(state);
      state.actionModal = false;

      if(state.selectedAction === 'shops' || state.selectedAction === 'stock_market' || state.selectedAction === 'shipping_offices') {
        state.dividendModal = true;
      }
    }

    this.setState( state );
  }

  saveAction = (state) => {
    switch(state.selectedAction) {
      case 'mercato':
        state = Actions.mercato(state);
        break;
      case 'stock_market':
        state = Actions.stock_market(state);
        break;

    }

    return state;
  }

  render() {
    let currentPlayer = (this.state.currentPlayer) ? this.state.players[ this.state.currentPlayer ].name : '';
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
          <DividendModal 
            shops={this.state.shops} 
            handleClose={this.handleClose}
            open={this.state.dividendModal} 
            actionStats={this.state.actionStats}
            selectedAction={this.state.selectedAction}
            players={this.state.players}
          />
          <ActionModal 
            currentPlayer={currentPlayer}
            shops={this.state.shops} 
            handleClose={this.handleClose}
            open={this.state.actionModal} 
            openActionModal={this.openActionModal}
            selectedAction={this.state.selectedAction}
            handleActionChange={this.selectAction}
            changeActionQuantity={this.changeActionQuantity}
            changeActionEvent={this.changeActionEvent}
            actionStats={this.state.actionStats}
            saveAction={this.saveAction}
            actionMsg={this.state.actionMsg}
            showDividend={this.showDividend}
            actionPayments={this.state.actionPayments}
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
