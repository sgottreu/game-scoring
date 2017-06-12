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
        {name: 'North Shipping', key: 'nshipping', shop: false, stocks: true, share_price: 20, shares: 10, orders: -1},
        {name: 'South Shipping', key: 'sshipping', shop: false, stocks: true, share_price: 20, shares: 10, orders: -1}
      ];

const dividends = {
        'blacksmith': { quantity: 0 },
        'tailor': { quantity: 0 },
        'miller': { quantity: 0 },
        'jeweler': { quantity: 0 },
        'spices': { quantity: 0 },
        'lumber': { quantity: 0 },
        'nshipping': { quantity: 0 },
        'sshipping': { quantity: 0 }
      };

const actionStats = {
        'blacksmith': { quantity: 0, action: 'buy', move_share: 0, move_price: 0, move_orders: 0},
        'tailor': { quantity: 0, action: 'buy', move_share: 0, move_price: 0, move_orders: 0},
        'miller': { quantity: 0, action: 'buy', move_share: 0, move_price: 0, move_orders: 0},
        'jeweler': { quantity: 0, action: 'buy', move_share: 0, move_price: 0, move_orders: 0},
        'spices': { quantity: 0, action: 'buy', move_share: 0, move_price: 0, move_orders: 0},
        'lumber': { quantity: 0, action: 'buy', move_share: 0, move_price: 0, move_orders: 0},
        'nshipping': { quantity: 0, action: 'buy', move_share: 0, move_price: 0, move_orders: 0, current: false},
        'sshipping': { quantity: 0, action: 'buy', move_share: 0, move_price: 0, move_orders: 0, current: false}
      };

const actions = [
  //{name: 'Church', key: 'church'},
  {name: 'Mercato', key: 'mercato', type: 'action'},
  {name: 'Shipping Offices', key: 'shipping_offices', type: 'action'},
  {name: 'Docks', key: 'docks', type: 'action'},
  {name: 'Guild Hall', key: 'guild_hall', type: 'action'},
  {name: 'Shops', key: 'shops', type: 'action'},
  {name: 'Stock Market', key: 'stock_market', type: 'action'},
  {name: 'Favor', key: 'favor', type: 'sub'},
  {name: 'Rumor', key: 'rumor', type: 'sub'},
  {name: 'Bidding', key: 'bidding', type: 'sub'}
]

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
    this.changeShippingOffice   = this.changeShippingOffice.bind(this);
    this.getDividendAmount      = this.getDividendAmount.bind(this);
  }

  setCurrentName = (e, v) => {
    if(v !== ''){
      this.setState( { currentName: v } );
    }
  }
  addPlayer = (e,i,v) => {
    let state = this.state;

    if(state.currentName !== ''){
      state.players.push(
        { name: state.currentName, stocks: clone(dividends), bank: 150, vp: 0, tmpPayments: 0 }
      );

      state.currentName = '';
      this.setState( state );
    }
  }

  selectShop = (key, e) => {
    this.setState( {
      selectedShop: key,
      shopModal: true
    } );
  }

  selectAction = (e, i, v) => {
    let state = this.state;

    if(state.selectedAction !== v){
      state.actionStats = clone(actionStats);
    }

    state.selectedAction = v;
    
    if(state.selectedAction){
      state.actionMsg = '';
    }

    this.setState( state );
  }

  openActionModal = () => {
    this.setState( { actionModal: true } );
  }

  saveCurrentPlayer = (event, index) => {
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

  changeShippingOffice = (e) => {
    let state = this.state;
    
    state.actionStats[ 'nshipping' ].current = false;
    state.actionStats[ 'sshipping' ].current = false;

    if(e.target.value === "north"){
      state.actionStats[ 'nshipping' ].current = true;
    }
    if(e.target.value === "south"){
      state.actionStats[ 'sshipping' ].current = true;
    }

    this.setState( state );
  }

  updateStat = (type, e) => {
    let state = this.state;
    let bolContinue = true;
    
    if(!state.selectedAction){
      state.actionMsg = 'Please select an action';
      bolContinue = false;
    } 

    if(state.currentPlayer !== false){
      state.actionMsg = 'Please select a player';
      bolContinue = false;
    }

    if(bolContinue) {
      let selectedShop = this.state.selectedShop;
      let _i = this.state.shops.findIndex((s) => { return s.key === selectedShop });
      let key = this.state.shops[ _i ].key;

      state.actionStats[ key ][ type ] = parseInt(e.target.value, 10);
    }
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

    let bolContinue = true;
    
    if(!state.selectedAction){
      state.actionMsg = 'Please select an action';
      bolContinue = false;
    } 

    if(state.currentPlayer === false){
      state.actionMsg = 'Please select a player';
      bolContinue = false;
    }
    
    if(bolContinue) {
      state = this.saveAction(state);
      state.actionModal = false;
      state.shopModal = false;

      if(state.selectedAction === 'shops' || state.selectedAction === 'stock_market' || state.selectedAction === 'shipping_offices' || state.selectedAction === 'rumor') {
        
        state = this.calculateDividends(state);
        
        state.dividendModal = true;
      }
    }

    this.setState( state );
  }

  getDividendAmount = (state) => {
    if( state.selectedAction === 'shipping_offices' ) {
      let office = (actionStats.nshipping.current) ? 'nshipping' : 'sshipping';
      let _i = state.shops.findIndex((s) => { return s.key === office });

      state.players.forEach( (item, i) => {
        // state.players[i].stocks[ office ]
      });
    }
  }

  saveAction = (state) => {
    switch(state.selectedAction) {
      case 'mercato':
        state = Actions.mercato(state);
        break;
      case 'shipping_offices':
        state = Actions.shipping_offices(state);
        break;
      case 'stock_market':
        state = Actions.stock_market(state);
        break;
      case 'favor':
        state = Actions.favor(state);
        break;
      case 'rumor':
        state = Actions.rumor(state);
        break;
      case 'bidding':
        state = Actions.bidding(state);
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
            selectedAction={this.state.selectedAction}
            handleActionChange={this.selectAction}
            actionStats={this.state.actionStats}
            actionMsg={this.state.actionMsg}
            actions={actions}
            showDividend={this.showDividend}
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
            actions={actions}
          />
          <PlayersList
            currentName={this.state.currentName}
            setCurrentName={this.setCurrentName}
            addPlayer={this.addPlayer}
            players={this.state.players}
            currentPlayer={this.state.currentPlayer}
            saveCurrentPlayer={this.saveCurrentPlayer}
          />
        </div>
      </MuiThemeProvider>
    );
  }
}

export default App;
