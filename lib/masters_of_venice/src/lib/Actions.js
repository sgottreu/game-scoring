


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


export var stock_market = (state) => {
  let stats = state.actionStats;

  Object.entries(stats).forEach(([key, stat]) => {
    if(stat.quantity > 0){
      let _i = state.shops.findIndex((s) => { return s.key === key });
      
      if(stat.action === 'buy'){
        state.shops[ _i ].share_price += 5;
      } else {
        state.shops[ _i ].share_price -= (stat.quantity * 10);
        if(state.shops[ _i ].share_price < 5) {
          state.shops[ _i ].share_price = 5;
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

export var bidding = (state) => {
  let stats = state.actionStats;

  Object.entries(stats).forEach(([key, stat]) => {
    if(stat.move_orders != 0){
      let _i = state.shops.findIndex((s) => { return s.key === key });
      state.shops[ _i ].orders += stat.move_orders;

      if(state.shops[ _i ].orders < 0){
        state.shops[ _i ].orders = 0;
      }
    }
  });

  return state;
}