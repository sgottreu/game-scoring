


export var mercato = (state) => {
  let stats = state.actionStats;

  Object.entries(stats).forEach(([key, stat]) => {
    if(stat.quantity > 0){
      let _i = state.shops.findIndex((s) => { return s.key === key });
      
      if(stat.action === 'buy'){
        state.shops[ _i ].resource_price += (stat.quantity * 5);
      } else {
        state.shops[ _i ].resource_price -= (stat.quantity * 5);
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
      let shop = state.shops[ _i ];
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
      state.players[ p ].tmpPayments += (player.stocks[ office ].quantity * (state.shops[ _i ].share_price /2));
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
          if(state.shops[ _i ].shop){
            state.shops[ _i ].share_price += 5;
            state.shops[ _i ].shares -= stat.quantity;
          }
          state.players[ player ].stocks[ key ].quantity += stat.quantity;
          
        } else {
          if(state.shops[ _i ].shop){
            state.shops[ _i ].share_price -= (stat.quantity * 10);
            if(state.shops[ _i ].share_price < 5) {
              state.shops[ _i ].share_price = 5;
            }

            state.shops[ _i ].shares += stat.quantity;
          }
          state.players[ player ].stocks[ key ].quantity -= stat.quantity;
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
    if(stat.move_orders !== 0){
      let _i = state.shops.findIndex((s) => { return s.key === key });
      state.shops[ _i ].orders += stat.move_orders;

      if(state.shops[ _i ].orders < 0){
        state.shops[ _i ].orders = 0;
      }
    }
    if(stat.move_share !== 0){
      let _i = state.shops.findIndex((s) => { return s.key === key });
      state.shops[ _i ].share_price += (stat.move_share * 5);

      if(state.shops[ _i ].share_price < 5){
        state.shops[ _i ].share_price = 5;
      }
    }
    if(stat.move_price !== 0){
      let _i = state.shops.findIndex((s) => { return s.key === key });
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

  Object.entries(stats).forEach(([key, stat]) => {
    if(stat.move_orders !== 0){
      let _i = state.shops.findIndex((s) => { return s.key === key });
      state.shops[ _i ].orders += stat.move_orders;

      if(state.shops[ _i ].orders < 0){
        state.shops[ _i ].orders = 0;
      }
    }
  });

  return state;
}