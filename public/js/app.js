  var socket = io();
  var game_name = 'continental_divide';
  var game_oid;
  var user = localStorage.getItem("game-scoring--username");
  var email = localStorage.getItem("game-scoring--email");
  var userFullname = localStorage.getItem("game-scoring--fullname");
  var user_treasuries = {};
  var companies = ['blue','red', 'yellow', 'pink', 'green', 'purple', 'brown', 'black'];

  var stock_values = [];
  var waiting = { get_players: false, get_stock_values: false };

  var current_company = false;
  var current_round = 0;

  var victory_point_values = [
    {key: 'vp_central_region', value: 1, label: 'Entered Central Region'},
    {key: 'vp_western_region', value: 1, label: 'Western Central Region'},
    {key: 'vp_crossed_divide', value: 2, label: 'Crossed Continental Divide'},
    {key: 'vp_track_in_san', value: 1, label: 'Track in San Diego', city: true},
    {key: 'vp_track_in_lax', value: 1, label: 'Track in Los Angeles', city: true},
    {key: 'vp_track_in_pdx', value: 1, label: 'Track in Portland', city: true},
    {key: 'vp_track_in_sea', value: 2, label: 'Track in Seattle', city: true},
    {key: 'vp_track_in_saf', value: 1, label: 'Track in San Francisco', city: true},
    {key: 'vp_no_stock', value: 1, label: 'No Unsold Stock'}
  ];

  var connected_users = [];

  var nsp_socket;

$( document ).ready(function() {
  if(user !== undefined && user !== null && user != ''){
    $("#name").val(userFullname);
    $("#email").val(email);
  }

  /**** Navigation Tab Events ******/
  $(".player_block").on('click', function(){
    socket.emit('conDiv_get_player_dividends', { game_oid: game_oid, user: user, client: user+'_conDiv' });
    socket.emit('conDiv_get_player_totals', { game_oid: game_oid, user: user, client: user+'_conDiv' });
  });

  /*** Modal Setup ******/

  $('#modal--username').modal({
    show:true
  });

  $('#modal--buyStock').modal({
    show:false
  });

  $('#modal--gameLink').modal({
    show:false
  });

  $('#modal--victory-points').modal({
    show:false
  });

  addCompanyDividends();

  $('.modal-header button').on('click', function() {
    removeBackdrop();
  });

  $(".company_pane .btn").click(function(){
    clickCompanyButton(this);
  });

  $("#modal--username .modal-header button").click(function(event){
    event.preventDefault();
    $("#modal--username").on('hidden.bs.modal', function (e) {
      $("#modal--username").modal('show');
    });
  })

  $("#modal--username .modal-footer .btn-primary").click(function(event){
    var _id = $('.available_games_dd .dropdown.selected a').data('oid');
    var numplayers = $('.num_players .dropdown.selected a').data('numplayers');

      if($("#email").val() == '' || _id === undefined || (_id == 'new' && numplayers === undefined)){
        alert_msg('modal-body', 'Please enter your username, game preference && number of players.');
      } else {
        var username = $("#email").val();
        username = keyify(username.toLowerCase()),

        user = username;

        localStorage.setItem("game-scoring--username", username );
        localStorage.setItem("game-scoring--email", $("#email").val() );
        localStorage.setItem("game-scoring--fullname", $("#name").val() );

        var action = (_id == 'new') ? 'conDiv_add_game_instance' : 'conDiv_join_game_instance';

        socket.emit('conDiv_save_username', {tag: username, email: $("#email").val(), name: $("#name").val() });

        setUserRoom();

        socket.emit(action,
          { game: {
              name: game_name,
              _id: $('.available_games_dd .dropdown.selected a').data('oid'),
              num_players: $('.num_players .dropdown.selected a').data('numplayers')
            },
            user: {tag: username, name: $("#name").val(), email: $("#email").val() }
          }
        );

        user = username;
        $('#modal--username').modal('toggle');
        $(".current_player").html(userFullname);
        
        removeBackdrop();
      }
  });

  $(".purchaseCompanyStock").click(function(){
    $(this).html('<i class="fa fa-line-chart" aria-hidden="true"></i> <i class="fa fa-cog fa-spin fa-1x fa-fw"></i><span class="sr-only">Loading...</span>')
    waiting.get_stock_values = true;
    waiting.get_players = true;

    socket.emit('conDiv_get_stock_values', {
      game_oid: game_oid,
      purchase: true,
      user: user,
      client: user+'_conDiv'
    });

    socket.emit('conDiv_get_players', {
      game_oid: game_oid,
      client: user+'_conDiv'
    });
    

    var checkWaiting =window.setInterval(function(){
      if(!waiting.get_players && !waiting.get_stock_values){
        $(".purchaseCompanyStock").html('<i class="fa fa-line-chart" aria-hidden="true"></i>');
        finalizePurchaseStockDialog();
        clearInterval(checkWaiting);
      } 
    }, 500);

  });

  $(".decreaseCompanyCosts").click(function(){
    $('#modal--costs').modal('toggle');
    $("#rr_costs").val(0);
    $(".rr_treasury .panel-body").text(current_company.rr_treasury);
  });

  $("#modal--costs .modal-footer button").click(function(event){
    if( validatePurchase('rr_costs', $("#rr_costs")) ){
      subtractCosts();
    }
  });

  $(".completeGame").on('click', function(event){
    submitVictoryPointTotals();
  });

  $("#modal--buyStock .modal-footer button").click(function(event){
    var player = $(".player_name select").val();
    var bolValid = true;
    var tmpValid;
    var actions = (!$("#modal--buyStock .stock_value").hasClass('hidden')) ? ['stock_value', 'stocks_issued', 'purchase_price'] : ['num_purchased_stocks', 'purchase_price'];

    for(var x=0;x<actions.length;x++){
      tmpValid = validatePurchase(actions[x], $("."+actions[x]+' .spinner input') );
      if(!tmpValid){
        bolValid = false;
      }
    }

    if(bolValid){
      var srv_action = (!current_company.open) ? 'init_company': '';
      update(srv_action);
      removeBackdrop();
    }
  });

  $(".increaseCompanyIncome").click(function(){
    $("#modal--income .rr_income .panel-body").html(current_company.rr_income);
    $("#rr_income").val(0);
    $("#modal--income .modal-header h5").text( current_company.name );
    $('#modal--income').modal('toggle');
  });

  $("#modal--income .modal-footer button").click(function(event){
    current_company.rr_income = parseInt( $("#rr_income").val(), 10);

    socket.emit('conDiv_modify_railroad_income', {
      game_oid: game_oid,
      user: user,
      client: user+'_conDiv',
      company: current_company
    });
    removeBackdrop();
  });

  $(".showCompanyDividends").click(function(){
    $('#modal--company-dividend').modal('toggle');
    $("#modal--company-dividend .modal-header h5").html('<i class="fa fa-cog fa-spin fa-1x fa-fw"></i><span class="sr-only">Loading...</span> Loading Companies');
    socket.emit('conDiv_get_company_dividends', { game_oid: game_oid });
  });

  $("#modal--company-dividend .modal-footer button").click(function(){
    $('#modal--company-dividend').modal('toggle');
    removeBackdrop();
  });


  $(".showPlayerDividends ").click(function(){
    $('#modal--player-dividend').modal('toggle');
    socket.emit('conDiv_get_player_dividends', { game_oid: game_oid });
  });

  $("#modal--player-dividend .modal-footer button").click(function(){
    $('#modal--player-dividend').modal('toggle');
    removeBackdrop();
  });

  $("#modal--victory-points .modal-footer button").click(function(){
    $('#modal--victory-points').modal('toggle');
    removeBackdrop();
  });

  $("#modal--username .btn-warning").click(function(){
    $("#available_games_dd").append('<i class="fa fa-cog fa-spin fa-1x fa-fw"></i><span class="sr-only">Loading...</span>');
    socket.emit('conDiv_available_games', {name: game_name, game_oid: game_oid, email: $("#email").val() }); 
  });

  $('.modal .spinner .btn:first-of-type').on('click', function() {
    var spinner = $(this).parent().parent().find('input');
    var action = $(this).data('action');
    updateValue(spinner, action, 'inc');
  });

  $('.modal .spinner .btn:last-of-type').on('click', function() {
    var spinner = $(this).parent().parent().find('input');
    var action = $(this).data('action');
    updateValue(spinner, action, 'dec');
  });

  $('.available_games_dd').on('click', function(e) {
    var og_label = 'Game Instance', new_label;

    $('.available_games_dd .dropdown').removeClass('selected');

    if(e.originalEvent.target.id !== ''){
      $('#'+e.originalEvent.target.id).parent().addClass('selected');

      if(e.originalEvent.target.id == "new_instance"){
        new_label = og_label+' - Add New Game';
        $("#num_players").parent().removeClass('hidden');
      } else {
        new_label = og_label+' - Creator: '+$('#'+e.originalEvent.target.id).data('creator');
        $("#num_players").parent().addClass('hidden');
      }

      $("#available_games_dd").html(new_label+' <span class="caret"></span>');
    }
  });

  $('.num_players').on('click', function(e) {
    $('.num_players .dropdown').removeClass('selected');
    if(e.originalEvent.target.id !== ''){
      var og_label = 'Number of Players', new_label;

      $('#'+e.originalEvent.target.id.toString() ).parent().addClass('selected');
    
      new_label = og_label+' - '+$('#'+e.originalEvent.target.id).data('numplayers');

      $("#num_players").html(new_label+' <span class="caret"></span>');
    }
  });

  $(".game_link_block").on('click', function(e){ 
    createGameLink();
  });

  $(".player_name select").on('change', function() {
    confirmPlayerTreasury();
  });

  $(".completeCurrentRound").click(function(){
    calculateEndOfRound();
  });

  $(".spinner input").on("keyup", function(e){
    var action = $(this).data('action');
    var val = $(this);
    var dir;
    console.log(e.keyCode);
    if(e.keyCode == 38){
      dir = 'inc';
    }
    if(e.keyCode == 40){
      dir = 'dec';
    }
    if((e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 96 && e.keyCode <= 105)){
      dir = 'enter';
    }
    updateValue($(this), action, dir );
  });

});

  function alert_msg(klass, msg, fadeOut){
    fadeOut = (fadeOut === undefined) ? true : fadeOut;
    $('.'+klass).prepend('<div class="alert alert-warning alert-dismissible fade in" role="alert"> <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">×</span></button> <strong>'+msg+'</div>');
    if(fadeOut){
      $('.'+klass+' .alert').fadeTo(2000, 500).slideUp(500, function(){
        $('.'+klass+' .alert').slideUp(500);
        $('.'+klass+' .alert').remove();
      });
    }
  
  }

  function validatePurchase(action, spinner){
    var player = $(".player_name select").val();

    var bolValid = true;

    if(action == "stock_value"){
      if( parseInt( $(spinner).val()) < 10 || parseInt( $(spinner).val()) > 50){
        alert_msg('modal-body', 'This is not a valid opening stock value.');
        bolValid = false;
      }
    }
    if(action == "stocks_issued"){
      if( parseInt( $(spinner).val()) < 3 || parseInt( $(spinner).val()) > 10){
        alert_msg('modal-body', 'That is not a valid quantity for stocks.');
        bolValid = false;
      }
    }
    if(action == "rr_costs" && parseInt( $(spinner).val() ) > current_company.rr_treasury){
      alert_msg('modal-body', 'The company does not have enough money to pay these building costs.');
      bolValid = false;
    }
    if(action == "num_purchased_stocks" || action == "purchase_price"){
      if(parseInt($('.purchase_price input').val()) > user_treasuries[player]){
        alert_msg('modal-body', 'There is not enough money in the player\'s treasury.');
        bolValid = false;
      }
    }
    return bolValid;
  }

  function clickCompanyButton(el){
    $(".company_pane .btn").removeClass('active');
    $(el).toggleClass('active');
    var company_name = $(".company_pane .btn.active").text().toLowerCase();

    if(current_round <= 8){
      $(".purchaseCompanyStock").removeClass('hidden');
      $('.increaseCompanyIncome').removeClass('hidden');
      $('.decreaseCompanyCosts').removeClass('hidden');
    } else {
      $('.company_pane__fields.victory_points').removeClass('hidden');
      $('.vp_company').addClass('hidden');
      $('.vp_'+company_name).removeClass('hidden');
    }
    socket.emit('conDiv_get_company', { game_oid: game_oid, company_name: company_name });
  }

  function createGameLink(){
    var focusedElement, url;

    if(getQueryVariable('game_id') === undefined){
      url = window.location+'?game_id='+game_oid;
    } else {
      url = window.location;
    }

    $(".game_link_txt").val(url);

    $(document).on('focus', '.game_link_txt', function () {
      if (focusedElement == this) return; //already focused, return so user can now place cursor at specific point in input.
      focusedElement = this;
      setTimeout(function () { focusedElement.select(); }, 50); //select all text in any field on focus for easy re-entry. Delay sightly to allow focus to "stick" before selecting.
    });
  }

  function log_actions(msg){
    $('.log').append($('<li>').text(msg));
  }

  function calculateEndOfRound(){
    if(current_round <= 8){
      socket.emit('conDiv_end_of_round', { game_oid: game_oid, user: user, client: user+'_conDiv' });
    }
  }

  function submitVictoryPointTotals(){
    var label;
    var obj = {}
    for(var x=0,len=companies.length;x<len;x++){
      obj[companies[x]] = {};

      for(var y=0,len2=victory_point_values.length;y<len2;y++){
        label = victory_point_values[y].key+'_'+companies[x];
        var val = ($('#'+label).prop('checked')) ? parseInt( $('#'+label).val() ) : 0;

        obj[companies[x]][ victory_point_values[y].key ] = val;
      }
    }
    socket.emit('conDiv_score_game', { game_oid: game_oid, vp: obj });
  }

  function finalizePurchaseStockDialog(){
    $('#modal--buyStock').modal('toggle');
    confirmPlayerTreasury();

    if(current_company.open) {
      $("#modal--buyStock .stock_value").addClass('hidden');
      $("#modal--buyStock .stocks_issued").addClass('hidden');
    } else {
      $("#modal--buyStock .stock_value").removeClass('hidden');
      $("#modal--buyStock .stocks_issued").removeClass('hidden');
    }
  }

  function skipTakenStockValues(val,dir) {

    // if((!inArray(val, stock_values)) && (val >= 10 && val <= 50)){
    //   return val;
    // }

    if(dir == 'inc'){
      if(val < 50){
        val++;
      }
    } else if(dir == 'dec') {
      if(val > 10){
        val--;            
      }
    } else {
      if(val < 50){
        val++;
      }
    }

    if(val < 10 || val > 50){
      return false;
    }

    if((inArray(val, stock_values)) && (val >= 10 && val <= 50)){
      return skipTakenStockValues(val,dir);
    } else {
      return val;
    }
  }

  function updateValue(spinner, action, dir) {
    var val = parseInt($(spinner).val(), 10);

    switch (action) {
      case "stock_value":
        if(dir !== undefined){
          if(dir == 'enter') {
            val--;
          }
        }
        var old_val = val;
        val = skipTakenStockValues(val,dir);

        if(val){
          $(spinner).val( val );
          if(old_val != val){
            $('.purchase_price input').val( val );
          }
        }
        break;
      case "stocks_issued":
        if(dir == 'inc'){
          if(val < 10){
            $(spinner).val( val + 1);
          }
        } else if(dir == 'dec') {
          if(val > 3){
            $(spinner).val( val - 1);
          }
        }
        break;
      case "num_purchased_stocks":
        if(dir == 'inc'){
          if(val < current_company.remaining_stock){
            val++;
            $(spinner).val( val );
          }
        } else if(dir == 'dec') {
          if(val > 1){
            val--;
            $(spinner).val( val );
          }
        }
        $('.purchase_price input').val( current_company.stock_price * val );
        break;
      case "purchase_price":
        var num_purchased_stocks = $('.num_purchased_stocks input').val();
        if(dir == 'inc'){
          $(spinner).val( val + 1);
        } else if(dir == 'dec') {
          var price = current_company.open ? current_company.stock_price * num_purchased_stocks : 10;
          if(val > price){
            $(spinner).val( val - 1);
          }
        }
        break;
      case "rr_income":
        if(dir == 'inc'){
          $(spinner).val( val + 1);
        } else if(dir == 'dec') {
          var price = current_company.rr_income;
          if(val > price){
            $(spinner).val( val - 1);
          }
        }
        break;
      case "rr_costs":
        if(dir == 'inc'){
          if(val < current_company.rr_treasury){
            $(spinner).val( val + 1);
          } 
        } else if(dir == 'dec') {
          if(val > 0){
            $(spinner).val( val - 1);
          }
        }
        break;
      default:
        break;
    }

    validatePurchase(action, spinner);


  }

  function subtractCosts(){
    socket.emit('conDiv_subtract_costs', {
      game_oid: game_oid,
      company: current_company.tag,
      client: user+'_conDiv',
      costs: $('#rr_costs').val()
    });
  }

  function populateCompany(company){
    $(".company_name").text(company.name);

    $("#rr_treasury__txt").text(company.rr_treasury);
    $("#rr_income__txt").text(company.rr_income);

    $("#stocks_issued__txt").text(company.stocks_issued);
    $("#stock_value__txt").text(company.stock_value);

    $("#stock_price__txt").text(company.stock_price);
    $("#dividend__txt").text(company.dividend);
    $("#dividend_payment__txt").text(company.remaining_stock * company.dividend);
    $("#remaining_stock__txt").text(company.remaining_stock);
    $("#income__txt").text(company.rr_income);

    $(".rr_treasury .panel-body").text(company.rr_treasury);

    var html = '';
    var sh = company.stockholders;
    for(var x=0,len=sh.length;x<len;x++){
      if(sh[x].stocks > 0){
        html += '<li><span class="name">'+sh[x].name+'</span><span class="stocks">'+sh[x].stocks+'</span></li>';
      }
    }

    $(".company_pane__fields .stockholders").html(html);

    current_company = company;
  }

  function confirmPlayerTreasury(){
    var player = $(".player_name select").val();
    if(current_company.stock_price > user_treasuries[player]){
      alert_msg('modal-body', 'You do not have enough money to purchase that amount of stock.');
    }
  }

  function update(action){
    var company = current_company;

    if(action == 'init_company'){
      company.stocks_issued = parseInt($(".stocks_issued input").val());
      company.stock_value = parseInt($(".stock_value input").val());
      company.remaining_stock = parseInt($(".stocks_issued input").val());
    }

    socket.emit('conDiv_update_company', {
      game_oid: game_oid,
      action: action,
      company: company,
      user: $('.player_name select').val(),
      num_purchased_stocks: parseInt($(".num_purchased_stocks input").val()),
      purchase_price: parseInt($(".purchase_price input").val()),
      client: user+'_conDiv'
    });
  }

  function calcDividend(stocks_issued, rr_income){
    var si = parseInt(stocks_issued);
    var ri = parseInt(rr_income);

    return isNaN( parseFloat(ri/si) ) ? 0 : Math.ceil( parseFloat(ri/si) );
  }

  function addCompanyDividends(){

    var html = '';

    for(var x=0,len=companies.length;x<len;x++){
      html += '<div class="col-xs-6 col-md-3">';
        html += '<div class="panel panel-primary '+companies[x]+'"> ';
          html += '<div class="panel-heading">';
            html += '<h3 class="panel-title"></h3>';
          html += '</div>';
          html += '<div class="panel-body" id="">';
            html += 0;
          html += '</div>';
        html += '</div>';
      html += '</div>';
    }

    $("#modal--company-dividend .modal-body .row").html(html);
  }

  function addPlayerDividends(users){
    var html = '';
    for (var user in users) {
      if (users.hasOwnProperty(user)) {
        html += '<div class="col-xs-6 col-md-3">';
          html += '<div class="panel panel-primary '+users[user].tag+'"> ';
            html += '<div class="panel-heading">';
              html += '<h3 class="panel-title">'+users[user].name+'</h3>';
            html += '</div>';
            html += '<div class="panel-body" id="">';
              html += 0;
            html += '</div>';
          html += '</div>';
        html += '</div>';
      }
    }
    $("#modal--player-dividend .modal-body .row").html(html);
  }

  function updateCompanyDividends(dividends){

    $("#modal--company-dividend .modal-header h5").html('');

    var tag;

    for(var x=0,len=companies.length;x<len;x++){
      tag = companies[x];

      $("#modal--company-dividend .panel."+tag+' .panel-title').html(dividends[tag].name.replace(' ', "<Br>"));
      $("#modal--company-dividend .panel."+tag+' .panel-body').html(dividends[tag].dividend_payment);
    }
  }

  function preselectGameInstance(game_oid){
    var og_label = 'Game Instance', new_label;
    $('.available_games_dd .dropdown').removeClass('selected');

    if(game_oid !== ''){
      $('#'+game_oid).parent().addClass('selected');

      if(game_oid == "new_instance"){
        new_label = og_label+' - Add New Game';
        $("#num_players").parent().removeClass('hidden');
      } else {
        new_label = og_label+' - Creator: '+$('#'+game_oid).data('creator');
        $("#num_players").parent().addClass('hidden');
      }

      $("#available_games_dd").html(new_label+' <span class="caret"></span>');
    }
  
  }


  if(getQueryVariable('game_id')){
    game_oid = getQueryVariable('game_id');
  }

  getAvailableGames();
  

  function getAvailableGames(){
    $("#available_games_dd").append('<i class="fa fa-cog fa-spin fa-1x fa-fw"></i><span class="sr-only">Loading...</span>');
    socket.emit('conDiv_available_games', {name: game_name, game_oid: game_oid});
  }

  var setBuyStockDialog = function(obj){
    user_treasuries = obj.user_treasuries;
    var cv = obj.companies;
    var company = $('.company_pane .btn.active').text().toLowerCase();

    if(company != ''){
      $("#modal--buyStock .modal-header h5").text(cv[ company ].name );
      $("#modal--income .modal-header h5").text(cv[ company ].name );

      var prv_sv = [], min_sv = 10;
      if(obj.purchase){
        $('.num_purchased_stocks input').val(1);

        if(cv[ company ].open){
          $(".purchase_price input").val( cv[ company ].stock_price );

          $(".num_purchased_stocks").removeClass("hidden");

          $("#modal--buyStock .stock_value").addClass("hidden");
          $("#modal--buyStock .stocks_issued").addClass("hidden");
        } else {
          for(var x=0,len=companies.length;x<len;x++){
            if(cv[ companies[x] ].open && !inArray(cv[ companies[x] ].stock_value, stock_values)){
              stock_values.push(cv[ companies[x] ].stock_value);
            }
          }
          stock_values.sort(sortNumber);
          for(var x=0,len=stock_values.length;x<len;x++){
            if(stock_values[x] == min_sv){
              min_sv++;
            }
          }

          $("#modal--buyStock .stock_value").removeClass("hidden");
          $("#modal--buyStock .stocks_issued").removeClass("hidden");

          $(".stock_value input").val(min_sv);
          $(".stocks_issued input").val(3);

          $(".num_purchased_stocks").addClass("hidden");
          $(".purchase_price input").val(min_sv);
        }
      }   
    }
  
  };

  function setPlayerDropdown(players){
    var html = '', selected = '';
    for(var x=0,len=players.length;x<len;x++){
      selected = (players[x].name == user) ? 'selected' : '';
      html += '<option '+selected+' value="'+players[x].tag+'">'+players[x].name+'</option>';
    }
    $(".player_name select").html(html);

    $('.player_name select').val(user);
    waiting.get_players = false;
  }

  function updateRound(round, scoring){
    current_round = round;
    if(round <= 8){
      $(".current_round").text(round);
    } else {
      $(".current_round").parent().html('End of Game');
      victoryPointForm(scoring);
    }
  }

  function removeBackdrop(){
    $(".modal-backdrop").remove();
    $('.modal-body .alert').remove();
  }

  function victoryPointForm(scoring){
    var html, val, disabled = false;
    for(var x=0,len=companies.length;x<len;x++){
      html = '<div class="col-xs-12 col-md-12 hidden vp_company vp_'+companies[x]+'">';

      for(var y=0,len2=victory_point_values.length;y<len2;y++){
        val = victory_point_values[y];
        disabled = (val.key == 'vp_no_stock') ? 'disabled="disabled"' : '';
        html += '<div><input data-key="'+val.key+'" data-company="'+companies[x]+'" type="checkbox" '+disabled+' value="'+val.value+'" class="vp_chk_bx '+val.key+' '+companies[x]+'" id="'+val.key+'_'+companies[x]+'"> <label for="'+val.key+'_'+companies[x]+'">'+val.label+'</label></div>';
      }
      html += '</div>';
      $(".company_pane__fields.victory_points").append(html);
    }

    $(".vp_no_stock").prop('disabled', true);

    if(Object.keys(scoring).length > 0){
      populateCompanyScoring(scoring);
    }
    
    $(".vp_chk_bx").on('click', function(e){
      var vp_key, key, company, index;
      var vp_vals = victory_point_values;

      for(var y=0,len2=vp_vals.length;y<len2;y++){
        if(victory_point_values[y].key == $(this).data('key')) {
          key = victory_point_values[y].key;
          company = $(this).data('company');
          index = y;
        }
      }

      if(vp_vals[index].city){
        $("#vp_central_region_"+company).prop('checked', true);
        $("#vp_western_region_"+company).prop('checked', true);
        $("#vp_crossed_divide_"+company).prop('checked', true);
      }
    });
  }

/******** Socket IO commands *****/

  socket.on('conDiv_available_games', function(games){
    var game_found = false;
    var html = '<li role="presentation" class="dropdown"><a href="#" class="dropdown-toggle" id="new_instance" data-toggle="dropdown" data-oid="new" role="button" aria-haspopup="true" aria-expanded="false">+ Add New Instance</a></li>';
    for(var x=0,len=games.length;x<len;x++){
      html += '<li role="presentation" class="dropdown">';
      html += '<a href="#" class="dropdown-toggle" id="'+games[x]._id+'" data-creator="'+games[x].creator.name+'" data-oid="'+games[x]._id+'" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">';
      html += 'Creator: '+games[x].creator.name;
      if(games[x].distance > -1){
        html += ' - Distance: '+games[x].distance;
      }
      html += '; Date: '+games[x].date;
      html += '</a></li>';

      game_found = (game_oid !== undefined && game_oid == games[x]._id) ? true : game_found;
      log_actions(games[x].creator.name+' - Dist: '+games[x].distance);
    }
    $('.dropdown-menu[aria-labelledby="available_games_dd"]').html(html);

    $("#available_games_dd").html(' Game Instance <span class="caret"></span>');

    if(game_oid !== undefined && game_found){
      preselectGameInstance(game_oid);
    }

    if(games.length == 0){
      $("#modal--username .btn-warning").removeClass("hidden");
    } else {
      $("#modal--username .btn-warning").addClass("hidden");
    }

    if(game_oid !== undefined && !game_found){
      alert_msg('modal-body', 'The selected game does not exist. Please select a different one.', false);
    }
  });

  socket.on('conDiv_joined_game', function(msg){
    game_oid = msg._id;
    user_treasuries[msg.newest_user] = msg.users[ msg.newest_user ].cash_total;
    log_actions(msg.newest_user+' has joined the game');

    addPlayerDividends(msg.users);
    updateRound(msg.current_round, msg.scoring);

    if( msg.newest_user == user && $(".player_block.active").length > 0){
      socket.emit('conDiv_get_player_totals', { game_oid: game_oid, user: user, client: user+'_conDiv' });
    }
    socket.emit('conDiv_get_player_dividends', { game_oid: game_oid, user: user, client: user+'_conDiv' });

  });

  socket.on('conDiv_get_company', function(company){
    log_actions('information about '+company.name+' requested');

    if($('.company_pane .btn.active') && company.tag == $('.company_pane .btn.active').text().toLowerCase() ){
      if(current_round <= 8){
        $(".company_pane__fields").removeClass("hidden");
        populateCompany(company);
      } else {
        if(company.remaining_stock == 0 && company.stocks_issued > 0){
          $(".vp_no_stock."+company.tag).prop( "checked", true );
        }
      }
      
    }
  });

  socket.on('conDiv_update_company', function(company){
    var active_company = $(".company_pane .btn.active").text().toLowerCase();

    if(active_company == company.tag){
      populateCompany(company);
    }

    if($("#modal--company-dividend").hasClass('in')){
      socket.emit('conDiv_get_company_dividends', { game_oid: game_oid });
    }

    if($("#modal--player-dividend").hasClass('in')){
      socket.emit('conDiv_get_player_dividends', { game_oid: game_oid, user: user, client: user+'_conDiv' });
    }

    if($("li.player_block").hasClass('active')){
      socket.emit('conDiv_get_player_dividends', { game_oid: game_oid, user: user, client: user+'_conDiv' });
      socket.emit('conDiv_get_player_totals', { game_oid: game_oid, user: user, client: user+'_conDiv' });
    }
  });

  socket.on('conDiv_get_company_dividends', function(dividends){
    updateCompanyDividends(dividends);
  });

  socket.on('conDiv_get_stock_values', function(obj){
    setBuyStockDialog(obj);
    waiting.get_stock_values = false;
  });

  socket.on('conDiv_get_player_dividends', function(players){
    var html = '';
    for (var user in players) {
      if (players.hasOwnProperty(user)) {
        $('#modal--player-dividend .'+players[user].tag+' .panel-body').text(players[user].dividend_payment);

        html += '<tr><td>'+players[user].fullname+'</td><td>'+players[user].user_treasury+'</td><tr>';
      }
    }
    $("#collapsePlayers .table tbody").html(html);
  });

  socket.on('conDiv_end_of_round', function(obj){
    if($("li.player_block").hasClass('active')){
      socket.emit('conDiv_get_player_totals', { game_oid: game_oid, user: user, client: user+'_conDiv' });
    }
    if($(".company_pane .btn.active").length > 0){
      socket.emit('conDiv_get_company', { game_oid: game_oid, company_name: $(".company_pane .btn.active").text().toLowerCase() });
    }
    updateRound(obj.current_round, obj.scoring);
    
    if(obj.current_round > 8){
      $(".purchaseCompanyStock").addClass('hidden');
      $('.increaseCompanyIncome').addClass('hidden');
      $('.decreaseCompanyCosts').addClass('hidden');

      $('.company_pane__fields').addClass('hidden');
      $('.company_pane__fields.victory_points').removeClass('hidden');
    }
  });

  socket.on('conDiv_score_game', function(obj){
    $("#modal--victory-points .panel-body").html('');
    var html = '';
    for(var x=0,len=obj.length;x<len;x++){
      //console.log(obj[x].name+': '+obj[x].vp);
      html += '<li><span class="name">'+obj[x].name+'</span><span class="vp">'+obj[x].vp+'</span></li>';
    }
    $("#modal--victory-points .panel-body").html(html);
    $("#modal--victory-points").modal('toggle');
  });

  function setUserRoom(){
    nsp_socket = io('/'+user+'_conDiv' );

    nsp_socket.on('conDiv_close_purchase_window', function(company){
      $('#modal--buyStock').modal('hide');
    });

    nsp_socket.on('conDiv_close_income_window', function(company){
      $('#modal--income').modal('hide');
    });

    nsp_socket.on('conDiv_close_costs_window', function(company){
      $('#modal--costs').modal('hide');
    });

    nsp_socket.on('conDiv_close_company_dividend_window', function(company){
      $('#modal--company-dividend').modal('hide');
    });

    nsp_socket.on('conDiv_close_player_dividend_window', function(company){
      $('#modal--player-dividend').modal('hide');
    });

    nsp_socket.on('conDiv_get_players', function(players){
      setPlayerDropdown(players);
    });

    nsp_socket.on('conDiv_get_player_totals', function(player){
      $('#user_treasury__txt').text(player.user_treasury);
      $('#player_dividend__txt').text(player.dividend_payment);

      var html = '';
      var sh = player.stocks;
      for(var x=0,len=sh.length;x<len;x++){
        if(sh[x].stocks > 0){
          html += '<li><span class="name">'+sh[x].name+'</span><span class="stocks">'+sh[x].stocks+'</span></li>';
        }
      }
      $(".player_stocks .panel-body").html(html);
    });

  }

  function populateCompanyScoring(scoring){
    for (var c in scoring) {
      if (scoring.hasOwnProperty(c)) {
        for (var s in scoring[c]) {
          if (scoring[c].hasOwnProperty(s)) {
            if(scoring[c][s] > 0){
              $("#"+s+'_'+c).prop('checked', true);
            }
          }
        }
      }
    }
  }

  function inArray(needle, haystack) {
      var length = haystack.length;
      for(var i = 0; i < length; i++) {
          if(haystack[i] == needle) return true;
      }
      return false;
  }

  function keyify(key){
    return key.replace(/[@\.]/g, '_');
  }

  function sortNumber(a,b) {
      return a - b;
  }

  function getQueryVariable(variable) {
      var query = window.location.search.substring(1);
      var vars = query.split('&');
      for (var i = 0; i < vars.length; i++) {
          var pair = vars[i].split('=');
          if (decodeURIComponent(pair[0]) == variable) {
              return decodeURIComponent(pair[1]);
          }
      }
  }