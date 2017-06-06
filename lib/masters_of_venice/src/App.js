import React, { Component } from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import injectTapEventPlugin from 'react-tap-event-plugin';

import './App.css';
import ShopListings from './shopListings';
import ShopModal from './shopModal';
import PlayersList from './playersList';
import ActionModal from './actionModal';

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
      selectedShop: false,
      selectedAction: false,
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
    this.selectAction       = this.selectAction.bind(this);
    this.handleClose        = this.handleClose.bind(this);
    this.updateStat         = this.updateStat.bind(this);
    this.openActionModal    = this.openActionModal.bind(this);
  }

  setCurrentName = (e, v) => {
    this.setState( { currentName: v } );
  }
  addPlayer = (e,i,v) => {
    let state = this.state;
    state.players.push(
      { name: state.currentName, stocks: clone(stocks), bank: 0 }
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
    console.log( i );
    this.setState( { selectedAction: v } );
  }

  openActionModal = () => {
    this.setState( { actionModal: true } );
  }

  handleClose = (modal) => {
    let state = this.state;
    state[ modal ] = false;
    this.setState( state );
  };

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
          />
          <PlayersList
            currentName={this.state.currentName}
            setCurrentName={this.setCurrentName}
            addPlayer={this.addPlayer}
            players={this.state.players}
          />
        </div>
      </MuiThemeProvider>
    );
  }
}

export default App;
