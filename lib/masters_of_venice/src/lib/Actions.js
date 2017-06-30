


export var mercato = (state) => {
  let stats = state.game.actionStats;
  let p = state.game.currentPlayer;

  Object.entries(stats).forEach(([key, stat]) => {
    if(stat.quantity > 0){
      let _i = state.game.shops.findIndex((s) => { return s.key === key });
      
      if(stat.action === 'buy'){
        state.game.players[ p ].bank -= (state.game.shops[ _i ].resource_price * stat.quantity);

        state.game.shops[ _i ].resource_price += (stat.quantity * 5);
      } else {
        state.game.players[ p ].bank += (state.game.shops[ _i ].resource_price * stat.quantity);

        state.game.shops[ _i ].resource_price -= (stat.quantity * 5);
      }

      if(state.game.shops[ _i ].resource_price > 100) {
        state.game.shops[ _i ].resource_price = 40;
      }
    }
  });

  return state;
}

export var docks = (state) => {
  let stats = state.game.actionStats;
  let p = state.game.currentPlayer;

  Object.entries(stats).forEach(([key, stat]) => {
    if(stat.quantity > 0){
      let _i = state.game.shops.findIndex((s) => { return s.key === key });
      
      state.game.players[ p ].bank -= state.game.shops[ _i ].resource_price * stat.quantity;
      state.game.shops[ _i ].resource_price += (stat.quantity * 5);  

      if(state.game.shops[ _i ].resource_price > 100) {
        state.game.shops[ _i ].resource_price = 40;
      }
    }
  });

  return state;
}

export var shops = (state) => {
  let stats = state.game.actionStats;
  let p = state.game.currentPlayer;

  Object.entries(stats).forEach(([key, stat]) => {
    if(stat.quantity > 0){
      let _i = state.game.shops.findIndex((s) => { return s.key === key });
      
      let transaction_price = (state.game.shops[ _i ].resource_price * 2) * stat.quantity;
      let dividend = (Math.round(transaction_price/100)) * 10;

      // Calculate dividend

      state.game.players.forEach( (player, p) => {
        if(player.stocks[ key ].quantity > 0){
          state.game.players[ p ].tmpDividends += player.stocks[ key ].quantity * dividend;
        }
      });


      // Update resource price, share price, orders & player bank
      state.game.players[ p ].bank += transaction_price;
      state.game.shops[ _i ].resource_price += (stat.quantity * 5);  
      state.game.shops[ _i ].share_price += (stat.quantity * 5);  
      state.game.shops[ _i ].orders -= stat.quantity;

      //Fix negative orders
      if(state.game.shops[ _i ].orders < 0) {
        state.game.shops[ _i ].orders = 0;
      }

      //Price Control

      if(state.game.shops[ _i ].resource_price > 100) {
        state.game.shops[ _i ].resource_price = 40;
      }

      // Stock Split

      if(state.game.shops[ _i ].share_price > 100){
        state.game.players.forEach( (player, p) => {
          if(player.stocks[ key ].quantity > 0){
            state.game.players[ p ].tmpVP += player.stocks[ key ].quantity;
            state.game.players[ p ].vp += player.stocks[ key ].quantity;
          }
        });

        if(state.game.shops[ _i ].share_price % 10 === 0){
          state.game.shops[ _i ].share_price = state.game.shops[ _i ].share_price / 2;
        } else {
          state.game.shops[ _i ].share_price = (state.game.shops[ _i ].share_price + 5) / 2;
        }
      }
    }
  });

  return state;
}

export var calculateVP = (state, cp) => {
  let vp;
  if(state.game.players[ cp ].guildOrders > 5){
    vp = 6;
  } else {
    vp = state.game.players[ cp ].guildOrders + 2;
  }
  return vp;
}


export var guild_hall = (state) => {
  let stats = state.game.actionStats;
  let cp = state.game.currentPlayer;

  state.game.players[ cp ].guildOrders++;

  state.game.players[ cp ].tmpVP = calculateVP(state, cp);
  
  Object.entries(stats).forEach(([key, stat]) => {
    if(stat.quantity > 0){
      let _i = state.game.shops.findIndex((s) => { return s.key === key });

      // Update resource price, share price, orders 

      state.game.shops[ _i ].resource_price += (stat.quantity * 5);  
      state.game.shops[ _i ].share_price += (stat.quantity * 5);  
      state.game.shops[ _i ].orders -= stat.quantity;

      //Fix negative orders
      if(state.game.shops[ _i ].orders < 0) {
        state.game.shops[ _i ].orders = 0;
      }

      //Price Control

      if(state.game.shops[ _i ].resource_price > 100) {
        state.game.shops[ _i ].resource_price = 40;
      }

      // Stock Split

      if(state.game.shops[ _i ].share_price > 100){
        state.game.players.forEach( (player, p) => {
          if(player.stocks[ key ].quantity > 0){
            state.game.players[ p ].vp += player.stocks[ key ].quantity;
          }
        });

        if(state.game.shops[ _i ].share_price % 10 === 0){
          state.game.shops[ _i ].share_price = state.game.shops[ _i ].share_price / 2;
        } else {
          state.game.shops[ _i ].share_price = (state.game.shops[ _i ].share_price + 5) / 2;
        }
      }
    }
  });
  return state;
}


export var shipping_offices = (state) => {
  let stats = state.game.actionStats;

  let office = (stats.nshipping.current) ? 'nshipping' : 'sshipping';
  Object.entries(stats).forEach(([key, stat]) => {
    if(stats[ key ].quantity > 0){
      let _i = state.game.shops.findIndex((s) => { return s.key === key });
      for(var x=1;x<=stats[ key ].quantity;x++){
        if(state.game.shops[ _i ].resource_price > 5){
          state.game.shops[ _i ].resource_price -= 5;
        } else {
          state.game.shops[ _i ].orders++;
        }
      }
    }
  });

  let _i = state.game.shops.findIndex((s) => { return s.key === office });

  state.game.players.forEach( (player, p) => {
    if(player.stocks[ office ].quantity > 0){
      let payment =  (player.stocks[ office ].quantity * (state.game.shops[ _i ].share_price /2));
      state.game.players[ p ].tmpDividends += payment;
      state.game.players[ p ].bank += payment;
    }
  });

  return state;
}


export var stock_market = (state) => {
  let stats = state.game.actionStats;
  let player = state.game.currentPlayer;

  Object.entries(stats).forEach(([key, stat]) => {
    if(stat.quantity > 0){
      let _i = state.game.shops.findIndex((s) => { return s.key === key });
      
      if(state.game.shops[ _i ].stocks) {
        if(stat.action === 'buy'){
          state.game.players[ player ].stocks[ key ].quantity += stat.quantity;
          state.game.players[ player ].bank -= state.game.shops[ _i ].share_price;

          if(state.game.shops[ _i ].shop){
            state.game.shops[ _i ].share_price += 5;
            state.game.shops[ _i ].shares -= stat.quantity;
          }
          
          
        } else {
          state.game.players[ player ].stocks[ key ].quantity -= stat.quantity;
          state.game.players[ player ].bank += state.game.shops[ _i ].share_price;

          if(state.game.shops[ _i ].shop){
            state.game.shops[ _i ].share_price -= (stat.quantity * 10);
            if(state.game.shops[ _i ].share_price < 5) {
              state.game.shops[ _i ].share_price = 5;
            }

            state.game.shops[ _i ].shares += stat.quantity;
          }
        }

        if(state.game.shops[ _i ].share_price > 100){

          state.game.players.forEach( (player, p) => {
            if(player.stocks[ key ].quantity > 0){
              state.game.players[ p ].tmpVP += player.stocks[ key ].quantity;
              state.game.players[ p ].vp += player.stocks[ key ].quantity;
            }
          });

          if(state.game.shops[ _i ].share_price % 10 === 0){
            state.game.shops[ _i ].share_price = state.game.shops[ _i ].share_price / 2;
          } else {
            state.game.shops[ _i ].share_price = (state.game.shops[ _i ].share_price+5) / 2;
          }
        }

      }


    }
  });

  return state;
}

export var favor = (state) => {
  let stats = state.game.actionStats;

  Object.entries(stats).forEach(([key, stat]) => {
    if(stat.move_orders > 0){
      let _i = state.game.shops.findIndex((s) => { return s.key === key });
      state.game.shops[ _i ].orders += stat.move_orders;
    }
  });
  return state;
}

export var rumor = (state) => {
  let stats = state.game.actionStats;

  Object.entries(stats).forEach(([key, stat]) => {
    let _i = state.game.shops.findIndex((s) => { return s.key === key });

    if(stat.move_orders !== 0){
      state.game.shops[ _i ].orders += stat.move_orders;

      if(state.game.shops[ _i ].orders < 0){
        state.game.shops[ _i ].orders = 0;
      }
    }
    if(stat.move_share !== 0){
      state.game.shops[ _i ].share_price += (stat.move_share * 5);

      if(state.game.shops[ _i ].share_price < 5){
        state.game.shops[ _i ].share_price = 5;
      }

      if(state.game.shops[ _i ].share_price > 100){
        state.game.players.forEach( (player, p) => {
          if(player.stocks[ key ].quantity > 0){
            state.game.players[ p ].tmpVP += player.stocks[ key ].quantity;
            state.game.players[ p ].vp += player.stocks[ key ].quantity;
          }
        });

        if(state.game.shops[ _i ].share_price % 10 === 0){
          state.game.shops[ _i ].share_price = state.game.shops[ _i ].share_price / 2;
        } else {
          state.game.shops[ _i ].share_price = (state.game.shops[ _i ].share_price + 5) / 2;
        }
      }

    }
    if(stat.move_price !== 0){
      state.game.shops[ _i ].resource_price += (stat.move_price * 5);

      if(state.game.shops[ _i ].resource_price < 5){
        state.game.shops[ _i ].resource_price = 5;
      }
    }
  });

  return state;
}

export var bidding = (state) => {
  let stats = state.game.actionStats;
  let player = state.game.currentPlayer;

  Object.entries(stats).forEach(([key, stat]) => {
    if(stat.move_orders !== 0){
      let _i = state.game.shops.findIndex((s) => { return s.key === key });
      state.game.shops[ _i ].orders += stat.move_orders;

      let bidding_dollars = (stat.move_orders > 0) ? Math.abs( stat.move_orders * 5) : Math.abs( stat.move_orders * 10);

      state.game.players[ player ].bank -= bidding_dollars;

      if(state.game.shops[ _i ].orders < 0){
        state.game.shops[ _i ].orders = 0;
      }
    }
  });

  return state;
}


export var stock_majority = (state) => {
  let stats = state.game.actionStats;

  Object.entries(stats).forEach(([key, stat]) => {
    let _i = state.game.shops.findIndex((s) => { return s.key === key });

    if(key === state.game.selectedShop){
      if(!stat.stock_majority) {
        stat.stock_majority = 'increase';
      }
      if(stat.stock_majority === 'increase'){
        state.game.shops[ _i ].resource_price += 10;
        state.game.shops[ _i ].orders--;

        if(state.game.shops[ _i ].orders < 0){
          state.game.shops[ _i ].orders = 0;
        }
        if(state.game.shops[ _i ].resource_price > 100){
          state.game.shops[ _i ].resource_price = 40;
        }
      } else {
        state.game.shops[ _i ].resource_price -= 10;
        state.game.shops[ _i ].orders++;

        if(state.game.shops[ _i ].orders > 15){
          state.game.shops[ _i ].orders = 15;
        }
        if(state.game.shops[ _i ].resource_price < 5){
          state.game.shops[ _i ].resource_price = 5;
        }
      }
    }
  });

  return state;
}