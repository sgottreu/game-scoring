


export var mercato = (state) => {
  let stats = state.actionStats;
  let p = state.currentPlayer;

  Object.entries(stats).forEach(([key, stat]) => {
    if(stat.quantity > 0){
      let _i = state.shops.findIndex((s) => { return s.key === key });
      
      if(stat.action === 'buy'){
        state.players[ p ].bank -= state.shops[ _i ].resource_price;

        state.shops[ _i ].resource_price += (stat.quantity * 5);
      } else {
        state.players[ p ].bank += state.shops[ _i ].resource_price;

        state.shops[ _i ].resource_price -= (stat.quantity * 5);
      }

      if(state.shops[ _i ].resource_price > 100) {
        state.shops[ _i ].resource_price = 40;
      }
    }
  });

  return state;
}

export var docks = (state) => {
  let stats = state.actionStats;
  let p = state.currentPlayer;

  Object.entries(stats).forEach(([key, stat]) => {
    if(stat.quantity > 0){
      let _i = state.shops.findIndex((s) => { return s.key === key });
      
      state.players[ p ].bank -= state.shops[ _i ].resource_price * stat.quantity;
      state.shops[ _i ].resource_price += (stat.quantity * 5);  

      if(state.shops[ _i ].resource_price > 100) {
        state.shops[ _i ].resource_price = 40;
      }
    }
  });

  return state;
}

export var shops = (state) => {
  let stats = state.actionStats;
  let p = state.currentPlayer;

  Object.entries(stats).forEach(([key, stat]) => {
    if(stat.quantity > 0){
      let _i = state.shops.findIndex((s) => { return s.key === key });
      
      let transaction_price = (state.shops[ _i ].resource_price * 2) * stat.quantity;
      let dividend = (Math.round(transaction_price/100)) * 10;

      // Calculate dividend

      state.players.forEach( (player, p) => {
        if(player.stocks[ key ].quantity > 0){
          state.players[ p ].tmpPayments += player.stocks[ key ].quantity * dividend;
        }
      });


      // Update resource price, share price, orders & player bank
      state.players[ p ].bank += transaction_price;
      state.shops[ _i ].resource_price += (stat.quantity * 5);  
      state.shops[ _i ].share_price += (stat.quantity * 5);  
      state.shops[ _i ].orders -= stat.quantity;

      //Fix negative orders
      if(state.shops[ _i ].orders < 0) {
        state.shops[ _i ].orders = 0;
      }

      //Price Control

      if(state.shops[ _i ].resource_price > 100) {
        state.shops[ _i ].resource_price = 40;
      }

      // Stock Split

      if(state.shops[ _i ].share_price > 100){
        state.players.forEach( (player, p) => {
          if(player.stocks[ key ].quantity > 0){
            state.players[ p ].tmpVP += player.stocks[ key ].quantity;
            state.players[ p ].vp += player.stocks[ key ].quantity;
          }
        });

        if(state.shops[ _i ].share_price % 10 === 0){
          state.shops[ _i ].share_price = state.shops[ _i ].share_price / 2;
        } else {
          state.shops[ _i ].share_price = (state.shops[ _i ].share_price + 5) / 2;
        }
      }
    }
  });

  return state;
}


export var guild_hall = (state) => {
  let stats = state.actionStats;
  let cp = state.currentPlayer;

  state.players[ cp ].guildOrders++;

  if(state.players[ cp ].guildOrders > 5){
    state.players[ cp ].tmpVP = 6;
  } else {
    state.players[ cp ].tmpVP = state.players[ cp ].guildOrders + 2;
  }

  Object.entries(stats).forEach(([key, stat]) => {
    if(stat.quantity > 0){
      let _i = state.shops.findIndex((s) => { return s.key === key });

      // Update resource price, share price, orders 

      state.shops[ _i ].resource_price += (stat.quantity * 5);  
      state.shops[ _i ].share_price += (stat.quantity * 5);  
      state.shops[ _i ].orders -= stat.quantity;

      //Fix negative orders
      if(state.shops[ _i ].orders < 0) {
        state.shops[ _i ].orders = 0;
      }

      //Price Control

      if(state.shops[ _i ].resource_price > 100) {
        state.shops[ _i ].resource_price = 40;
      }

      // Stock Split

      if(state.shops[ _i ].share_price > 100){
        state.players.forEach( (player, p) => {
          if(player.stocks[ key ].quantity > 0){
            state.players[ p ].vp += player.stocks[ key ].quantity;
          }
        });

        if(state.shops[ _i ].share_price % 10 === 0){
          state.shops[ _i ].share_price = state.shops[ _i ].share_price / 2;
        } else {
          state.shops[ _i ].share_price = (state.shops[ _i ].share_price + 5) / 2;
        }
      }
    }
  });
  return state;
}


export var shipping_offices = (state) => {
  let stats = state.actionStats;

  let office = (stats.nshipping.current) ? 'nshipping' : 'sshipping';
  Object.entries(stats).forEach(([key, stat]) => {
    if(stats[ key ].quantity > 0){
      let _i = state.shops.findIndex((s) => { return s.key === key });
      for(var x=1;x<=stats[ key ].quantity;x++){
        if(state.shops[ _i ].resource_price > 5){
          state.shops[ _i ].resource_price -= 5;
        } else {
          state.shops[ _i ].orders++;
        }
      }
    }
  });

  let _i = state.shops.findIndex((s) => { return s.key === office });

  state.players.forEach( (player, p) => {
    if(player.stocks[ office ].quantity > 0){
      let payment =  (player.stocks[ office ].quantity * (state.shops[ _i ].share_price /2));
      state.players[ p ].tmpPayments += payment;
      state.players[ p ].bank += payment;
    }
  });

  return state;
}


export var stock_market = (state) => {
  let stats = state.actionStats;
  let player = state.currentPlayer;

  Object.entries(stats).forEach(([key, stat]) => {
    if(stat.quantity > 0){
      let _i = state.shops.findIndex((s) => { return s.key === key });
      
      if(state.shops[ _i ].stocks) {
        if(stat.action === 'buy'){
          state.players[ player ].stocks[ key ].quantity += stat.quantity;
          state.players[ player ].bank -= state.shops[ _i ].share_price;

          if(state.shops[ _i ].shop){
            state.shops[ _i ].share_price += 5;
            state.shops[ _i ].shares -= stat.quantity;
          }
          
          
        } else {
          state.players[ player ].stocks[ key ].quantity -= stat.quantity;
          state.players[ player ].bank += state.shops[ _i ].share_price;

          if(state.shops[ _i ].shop){
            state.shops[ _i ].share_price -= (stat.quantity * 10);
            if(state.shops[ _i ].share_price < 5) {
              state.shops[ _i ].share_price = 5;
            }

            state.shops[ _i ].shares += stat.quantity;
          }
        }

        if(state.shops[ _i ].share_price > 100){

          state.players.forEach( (player, p) => {
            if(player.stocks[ key ].quantity > 0){
              state.players[ p ].tmpVP += player.stocks[ key ].quantity;
              state.players[ p ].vp += player.stocks[ key ].quantity;
            }
          });

          if(state.shops[ _i ].share_price % 10 === 0){
            state.shops[ _i ].share_price = state.shops[ _i ].share_price / 2;
          } else {
            state.shops[ _i ].share_price = (state.shops[ _i ].share_price+5) / 2;
          }
        }

      }


    }
  });

  return state;
}

export var favor = (state) => {
  let stats = state.actionStats;

  Object.entries(stats).forEach(([key, stat]) => {
    if(stat.move_orders > 0){
      let _i = state.shops.findIndex((s) => { return s.key === key });
      state.shops[ _i ].orders += stat.move_orders;
    }
  });
  return state;
}

export var rumor = (state) => {
  let stats = state.actionStats;

  Object.entries(stats).forEach(([key, stat]) => {
    let _i = state.shops.findIndex((s) => { return s.key === key });

    if(stat.move_orders !== 0){
      state.shops[ _i ].orders += stat.move_orders;

      if(state.shops[ _i ].orders < 0){
        state.shops[ _i ].orders = 0;
      }
    }
    if(stat.move_share !== 0){
      state.shops[ _i ].share_price += (stat.move_share * 5);

      if(state.shops[ _i ].share_price < 5){
        state.shops[ _i ].share_price = 5;
      }

      if(state.shops[ _i ].share_price > 100){
        state.players.forEach( (player, p) => {
          if(player.stocks[ key ].quantity > 0){
            state.players[ p ].tmpVP += player.stocks[ key ].quantity;
            state.players[ p ].vp += player.stocks[ key ].quantity;
          }
        });

        if(state.shops[ _i ].share_price % 10 === 0){
          state.shops[ _i ].share_price = state.shops[ _i ].share_price / 2;
        } else {
          state.shops[ _i ].share_price = (state.shops[ _i ].share_price + 5) / 2;
        }
      }

    }
    if(stat.move_price !== 0){
      state.shops[ _i ].resource_price += (stat.move_price * 5);

      if(state.shops[ _i ].resource_price < 5){
        state.shops[ _i ].resource_price = 5;
      }
    }
  });

  return state;
}

export var bidding = (state) => {
  let stats = state.actionStats;
  let player = state.currentPlayer;

  Object.entries(stats).forEach(([key, stat]) => {
    if(stat.move_orders !== 0){
      let _i = state.shops.findIndex((s) => { return s.key === key });
      state.shops[ _i ].orders += stat.move_orders;

      let bidding_dollars = (stat.move_orders > 0) ? Math.abs( stat.move_orders * 5) : Math.abs( stat.move_orders * 10);

      state.players[ player ].bank -= bidding_dollars;

      if(state.shops[ _i ].orders < 0){
        state.shops[ _i ].orders = 0;
      }
    }
  });

  return state;
}


export var stock_majority = (state) => {
  let stats = state.actionStats;

  Object.entries(stats).forEach(([key, stat]) => {
    let _i = state.shops.findIndex((s) => { return s.key === key });

    if(key === state.selectedShop){
      if(!stat.stock_majority) {
        stat.stock_majority = 'increase';
      }
      if(stat.stock_majority === 'increase'){
        state.shops[ _i ].resource_price += 10;
        state.shops[ _i ].orders--;

        if(state.shops[ _i ].orders < 0){
          state.shops[ _i ].orders = 0;
        }
        if(state.shops[ _i ].resource_price > 100){
          state.shops[ _i ].resource_price = 40;
        }
      } else {
        state.shops[ _i ].resource_price -= 10;
        state.shops[ _i ].orders++;

        if(state.shops[ _i ].orders > 15){
          state.shops[ _i ].orders = 15;
        }
        if(state.shops[ _i ].resource_price < 5){
          state.shops[ _i ].resource_price = 5;
        }
      }
    }
  });

  return state;
}