import React, { Component } from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import injectTapEventPlugin from 'react-tap-event-plugin';
import AppBar from 'material-ui/AppBar';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import Drawer from 'material-ui/Drawer';
import FontIcon from 'material-ui/FontIcon';
import io from 'socket.io-client';

import './App.css';
import ShopListings from './shopListings';
import ShopModal from './shopModal';
import ShareModal from './shareModal';
import JoinModal from './joinModal';
import PlayersList from './playersList';
import ActionModal from './actionModal';
import DividendModal from './dividendModal';

import * as Actions from './lib/Actions';
import * as Generic from './lib/Generic';

injectTapEventPlugin();

let host;
if(process !== undefined && process.env !== undefined && process.env.NODE_ENV === 'development'){
  host = 'http://localhost:4000';
} else {
  host = 'https://board-game-scoring.herokuapp.com';
}

var socket = io(host);

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
        'blacksmith': { quantity: 0, action: 'buy', move_share: 0, move_price: 0, move_orders: 0, stock_majority: false},
        'tailor': { quantity: 0, action: 'buy', move_share: 0, move_price: 0, move_orders: 0, stock_majority: false},
        'miller': { quantity: 0, action: 'buy', move_share: 0, move_price: 0, move_orders: 0, stock_majority: false},
        'jeweler': { quantity: 0, action: 'buy', move_share: 0, move_price: 0, move_orders: 0, stock_majority: false},
        'spices': { quantity: 0, action: 'buy', move_share: 0, move_price: 0, move_orders: 0, stock_majority: false},
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
  {name: 'Bidding', key: 'bidding', type: 'sub'},
  {name: 'Stock Majority', key: 'stock_majority', type: 'sub'}
]

const clone = (data) => {
  return (data === undefined) ? {} : JSON.parse(JSON.stringify(data));
}

class App extends Component {

  constructor(props){
    super(props);

    this.initialState = { 
      game_name: 'masters_of_venice',
      drawer: false,
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
      actionPayments: { amount: 0, type: false},
      special: {},
      modalConfirm: false,
      shareModal: false,
      game_oid: false,
      joinModal: true,
      user: {
        username: '',
        name: '',
        email: ''
      },
      availableGames: []
    };

    this.state = clone(this.initialState);

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
    this.clearState             = this.clearState.bind(this);
    this.calculateVpPayments    = this.calculateVpPayments.bind(this);
    this.updateVP               = this.updateVP.bind(this);
    this.confirmButton          = this.confirmButton.bind(this);
    this.shareGame              = this.shareGame.bind(this);
    this.joinGame               = this.joinGame.bind(this);
    this.selectGameInstance     = this.selectGameInstance.bind(this);
    this.changeJoinName         = this.changeJoinName.bind(this);
    this.changeJoinEmail        = this.changeJoinEmail.bind(this);
    this.updateAvailableGames   = this.updateAvailableGames.bind(this);
    this.updateGameInstance     = this.updateGameInstance.bind(this);


    // this.specialUpdate          = this.specialUpdate.bind(this);

    let state = JSON.parse(localStorage.getItem("masters_of_venice"));

    if(state !== null) {
      this.state = state;
    }

  }

  componentDidMount() {
    let _this = this;
    socket.on('masVen_joined_game', function(game){
      _this.updateGameInstance(game);
    });
  }

  componentWillUpdate(nextProps, nextState) {
    localStorage.setItem("masters_of_venice", JSON.stringify(nextState) );
  }

  resetApp = () => {
    this.setState( this.initialState );
  }

  // specialUpdate = (type, e) => {
  //   let state = this.state;
  //   if(type === 'selectedShop'){
  //     state.selectedShop = e.target.value;
  //   } else {
  //     let selectedShop = this.state.selectedShop;
  //     let _i = state.shops.findIndex((s) => { return s.key === selectedShop });
  //     let key = state.shops[ _i ].key;  

  //     state.shops[ _i ][ type ] = parseInt(e.target.value, 10);
  //   }

  //   this.setState(state); 
  // }

  confirmButton = (e, v) => {
    let _this = this;
    setTimeout(function() {
      _this.setState( { modalConfirm: true } );
    }, 200);
  } 

  clearState = (state) => {
    state.actionStats = clone(actionStats);
    state.actionMsg = '';
    state.actionPayments = { amount: 0, type: false };
    state.dividendModal = false;
    state.shop_type = false;
    state.currentPlayer = false;
    state.selectedShop = false;
    state.selectedAction = false;
    state.modalConfirm = false;

    state.players.forEach( (player, p) => {
      state.players[ p ].tmpDividends = 0;
      state.players[ p ].tmpVP = 0;
      state.players[ p ].tmpVpPayments = 0;
    });

    this.setState( state );
  }

  setCurrentName = (e, v) => {
    this.setState( { currentName: v } );
  }
  addPlayer = (e,i,v) => {
    let state = this.state;

    if(state.currentName !== ''){
      state.players.push(
        { name: state.currentName, stocks: clone(dividends), bank: 150, vp: 0, tmpDividends: 0, tmpVP: 0, tmpVpPayments: 0, guildOrders: 0 }
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
    let state = this.state;
    if(state.selectedAction){
      state.actionMsg = '';
    } 
    if(state.currentPlayer !== false){
      state.actionMsg = '';
    }
    state.actionModal = true;
    this.setState( state );
  }

  saveCurrentPlayer = (event, index) => {
    this.setState( { currentPlayer: index } );
  }

  handleClose = (modal) => {
    let state = this.state;

    state.actionPayments = { amount: 0, type: false};
    state[ modal ] = false;
    state.modalConfirm = false;

    this.setState( state );
  };

  changeActionQuantity = (key, e) => {
    let state = this.state;
    state.actionStats[ key ].quantity = parseInt(e.target.value, 10);

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

  updateVP = () => {
    let state = this.state;

    state.players.map( (player, i) => {
      player.vp += Math.trunc(player.tmpVP);
      player.bank += Math.trunc(player.tmpVpPayments);
      return player;
    });

    this.clearState(state);
  }

  calculateVpPayments = (pIndex, e) => {
    let state = this.state;
    let vp = Actions.calculateVP(state, pIndex);
    let payment = vp - e.target.value;

    if(e.target.value > 0 && e.target.value <= vp){
      state.players[ pIndex ].tmpVP = e.target.value;
      state.players[ pIndex ].tmpVpPayments = payment * 50;
      
      this.setState( state );
    } else {
      if(e.target.value < 0){
        state.players[ pIndex ].tmpVP = 0;
        state.players[ pIndex ].tmpVpPayments = vp * 50;
      }
      if(e.target.value >= vp){
        state.players[ pIndex ].tmpVP = vp;
        state.players[ pIndex ].tmpVpPayments = 0;
      }
      this.setState( state );
    }    
  };

  updateStat = (type, e) => {
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
      let selectedShop = this.state.selectedShop;
      let _i = this.state.shops.findIndex((s) => { return s.key === selectedShop });
      let key = this.state.shops[ _i ].key;

      if(type === 'stock_majority'){
        state.actionStats[ key ][ type ] = e.target.value;
      } else {
        state.actionStats[ key ][ type ] = parseInt(e.target.value, 10);
      }
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
        } else if(state.selectedAction === 'shops') {
          receivable += state.shops[ _i ].resource_price * stat.quantity * 2;
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
    
    if(state.selectedAction === 'guild_hall' || state.selectedAction === 'shops'){
      let stats = state.actionStats;

      Object.entries(stats).forEach(([key, stat]) => {
        let _i = state.shops.findIndex((s) => { return s.key === key });

        if(stat.quantity > 0 && stat.quantity > state.shops[ _i ].orders){
          state.actionMsg = 'There are not enough orders.';
          bolContinue = false;
        }
      });
    }

    if(bolContinue) {
      state = this.saveAction(state);
      state.actionModal = false;
      state.shopModal = false;

      if(state.selectedAction === 'guild_hall' || state.selectedAction === 'shops' || state.selectedAction === 'stock_market' || state.selectedAction === 'shipping_offices' || state.selectedAction === 'rumor') {
        state.dividendModal = true;
      } else {
        this.clearState(state);
        return false;
      }
    }

    this.setState( state );
  }

  shareGame = () => {
    this.setState( { shareModal: true } );
  };

  joinGame = () => {
    let state = this.state;

    let username = Generic.keyify(state.user.email.toLowerCase());

    var action = (state.game_oid == 'new') ? 'masVen_add_game_instance' : 'masVen_join_game_instance';

    socket.emit(action,
      { game: {
          name: state.game_name,
          _id: state.game_oid,
          state: state
        },
        user: {tag: username, email: state.user.email, name: state.user.name }
      }
    );
  };

  changeJoinName = (e) => {
    let state = this.state;
    state.user.name = e.target.value;
    this.setState( state );
  }

  changeJoinEmail = (e) => {
    let state = this.state;
    state.user.email = e.target.value;
    this.setState( state );
  }
  updateGameInstance = (game) => {
    this.setState( { game_oid: game._id, joinModal: false} );
  }
  selectGameInstance = (event, index) => {
    this.setState( { game_oid: (index === 0) ? 'new' : this.state.availableGames[index-1]} );
  };

  updateAvailableGames = (games) => {
    this.setState( { availableGames: games } );
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
      case 'docks':
        state = Actions.docks(state);
        break;
      case 'shops':
        state = Actions.shops(state);
        break;
      case 'guild_hall':
        state = Actions.guild_hall(state);
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
      case 'stock_majority':
        state = Actions.stock_majority(state);
        break;
      default:
        break;

    }

    return state;
  }

  render() {
    return (
      <MuiThemeProvider>
        <div className="App">
          <AppBar
            title="Merchants of Venice"
            onLeftIconButtonTouchTap={ () => { this.setState( { drawer: !this.state.drawer }) } }
            iconElementRight={<FlatButton onTouchTap={this.openActionModal} label="Perform Action" />}
          />
          <Drawer 
            open={this.state.drawer}
            onRequestChange={(open) => this.setState({drawer : false})}
          >
            <div className="addPlayers">
              <FlatButton onTouchTap={(open) => this.setState({drawer : false})} 
                label={ <FontIcon className="fa fa-times-circle" /> }
                style={ {float:'right'} }
              />
              <TextField hintText="Player Name" name="player_name"
                value={this.state.currentName}
                onChange={this.setCurrentName}/>
                <br/>
                <RaisedButton onTouchTap={this.addPlayer} label="Add Player" secondary={true} 
                />

                <RaisedButton onTouchTap={this.resetApp} className="resetApp" label="Start New Game" secondary={true} 
                />
            </div>
          </Drawer>
          <ShareModal 
            handleClose={this.handleClose}
            open={this.state.shareModal} 
            onShareGame={this.shareGame}
          />
          <JoinModal 
            handleClose={this.handleClose}
            open={this.state.joinModal} 
            joinGame={this.joinGame}
            user={this.state.user}
            socket={socket}
            game_name={this.state.game_name}
            game_oid={this.state.game_oid}
            availableGames={this.state.availableGames}
            selectGameInstance={this.selectGameInstance}
            changeJoinName={this.changeJoinName}
            changeJoinEmail ={this.changeJoinEmail}
            updateAvailableGames={this.updateAvailableGames}
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
            modalConfirm={this.state.modalConfirm}
            confirmButton={this.confirmButton}
          />
          <DividendModal 
            shops={this.state.shops} 
            handleClose={this.handleClose}
            open={this.state.dividendModal} 
            actionStats={this.state.actionStats}
            selectedAction={this.state.selectedAction}
            players={this.state.players}
            updateVP={this.updateVP}
            calculateVpPayments={this.calculateVpPayments}
            modalConfirm={this.state.modalConfirm}
            confirmButton={this.confirmButton}
          />
          <ActionModal 
            players={this.state.players}
            currentPlayer={this.state.currentPlayer}
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
            modalConfirm={this.state.modalConfirm}
            confirmButton={this.confirmButton}
          />
          <PlayersList
            currentName={this.state.currentName}
            setCurrentName={this.setCurrentName}
            addPlayer={this.addPlayer}
            players={this.state.players}
            currentPlayer={this.state.currentPlayer}
            saveCurrentPlayer={this.saveCurrentPlayer}
          />
          <ShopListings 
            shops={this.state.shops} 
            selectShop={this.selectShop}
          />
          <RaisedButton
            label="Share Game"
            primary={true}
            onTouchTap={this.shareGame}
            />
          {/*<div className="hide">
            <select id="special_shop" onChange={this.specialUpdate.bind(this, 'selectedShop')}>
            <option>Choose</option>
          {
              
              shops.map( (shop, i) => {
                return (
                  <option key={uuidV4()} value={shop.key}>{shop.name}</option>
                );  
              })
            }
            </select>
      

                <input type="text" id="special_price" onChange={this.specialUpdate.bind(this, 'resource_price')} value={(ss !== false) ? this.state.shops[ _i ].resource_price : ''} />
                <input type="text" id="special_share" onChange={this.specialUpdate.bind(this, 'share_price')} value={(ss !== false) ? this.state.shops[ _i ].share_price : ''} />
                <input type="text" id="special_orders" onChange={this.specialUpdate.bind(this, 'orders')} value={(ss !== false) ? this.state.shops[ _i ].orders : ''} />


        </div>*/}



        </div>

      </MuiThemeProvider>
    );
  }
}

export default App;
