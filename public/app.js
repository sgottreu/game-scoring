  var socket = io();
  var game_name = 'continental_divide';
  var game_oid;
  var user = localStorage.getItem("game-scoring--username");
  var email = localStorage.getItem("game-scoring--email");
  var userFullname = localStorage.getItem("game-scoring--fullname");
  var user_treasury = 0;
  var companies = ['blue','red', 'yellow', 'pink', 'green', 'purple', 'brown', 'black'];

  var current_company = false;

  var connected_users = [];

  var nsp_socket;

$( document ).ready(function() {
  if(user !== undefined && user !== null && user != ''){
    $("#name").val(userFullname);
    $("#email").val(email);
  }

  /**** Navigation Tab Events ******/
  $(".player_block").on('click', function(){
    socket.emit('get_player_totals', { game_oid: game_oid, user: user });
  });

  $(".endofround_block").on('click', function(){

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

  addCompanyDividends();

  $('.modal-header button').on('click', function() {
    $(".modal-backdrop").remove();
  });

  $('.modal-footer button').on('click', function() {
    $(".modal-backdrop").remove();
  });

  $(".company_pane .btn").click(function(){
    $(".company_pane .btn").removeClass('active');
    $(this).toggleClass('active');

    $(".purchaseCompanyStock").removeClass('hidden');
    $('.increaseCompanyIncome').removeClass('hidden');

    socket.emit('get_company', { game_oid: game_oid, company_name: $(".company_pane .btn.active").text().toLowerCase() });
  });

  $("#modal--username button").click(function(event){
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

        var current_location = JSON.parse(localStorage.getItem("game-scoring--current_location"));

        var action = (_id == 'new') ? 'add_game_instance' : 'join_game_instance';

        socket.emit('save_username', {tag: username, email: $("#email").val(), name: $("#name").val(), location: current_location });

        setUserRoom();

        socket.emit(action,
          { game: {
              name: game_name,
              _id: $('.available_games_dd .dropdown.selected a').data('oid'),
              num_players: $('.num_players .dropdown.selected a').data('numplayers')
            },
            user: {tag: username, name: $("#name").val(), email: $("#email").val(), location: current_location }
          }
        );

        user = username;
        $('#modal--username').modal('toggle');
      }
  });

  $(".purchaseCompanyStock").click(function(){
    $('#modal--buyStock').modal('toggle');

    socket.emit('get_stock_values', {
      game_oid: game_oid,
      purchase: true,
      user: user
    });

    socket.emit('get_players', {
      game_oid: game_oid,
      client: user
    });

    confirmUserTreasury();

    if(current_company.open) {
      $("#modal--buyStock .stock_value").addClass('hidden');
      $("#modal--buyStock .stocks_issued").addClass('hidden');
    } else {
      $("#modal--buyStock .stock_value").removeClass('hidden');
      $("#modal--buyStock .stocks_issued").removeClass('hidden');
    }

  });

  $("#modal--buyStock .modal-footer button").click(function(event){
    if($('.purchase_price input').val() > user_treasury){
      alert_msg('modal-body', 'You do not have enough money to purchase that amount of stock.');
    } else {
      var action = (!current_company.open) ? 'init_company': '';
      update(action);
    }
  });

  $(".increaseCompanyIncome").click(function(){
    $("#rr_income").val(current_company.rr_income);
    $("#modal--income .modal-header h5").text( current_company.name );
    $('#modal--income').modal('toggle');
  });

  $("#modal--income .modal-footer button").click(function(event){
    current_company.rr_income = parseInt( $("#rr_income").val(), 10);

    socket.emit('modify_railroad_income', {
      game_oid: game_oid,
      user: user,
      company: current_company
    });
  });

  $(".showCompanyDividends").click(function(){
    $('#modal--company-dividend').modal('toggle');

    socket.emit('get_company_dividends', { game_oid: game_oid });
  });

  $("#modal--company-dividend .modal-footer button").click(function(){
    $('#modal--company-dividend').modal('toggle');

    socket.emit('update_company_treasury', { game_oid: game_oid, user: user });
  });


  $(".showPlayerDividends ").click(function(){
    $('#modal--player-dividend').modal('toggle');
    socket.emit('get_player_dividends', { game_oid: game_oid, user: user });
  });

  $("#modal--player-dividend .modal-footer button").click(function(){
    $('#modal--player-dividend').modal('toggle');
    socket.emit('update_player_treasury', { game_oid: game_oid, user: user });
  });

  $("#modal--gameLink .modal-footer button").click(function(){
    $('#modal--gameLink').modal('toggle');
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

});

  function alert_msg(klass, msg){
    $('.'+klass).prepend('<div class="alert alert-warning alert-dismissible fade in" role="alert"> <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">×</span></button> <strong>'+msg+'</div>');
    $('.'+klass+' .alert').fadeTo(2000, 500).slideUp(500, function(){
      $('.'+klass+' .alert').slideUp(500);
      $('.'+klass+' .alert').remove();
    });
  }

  function createGameLink(){
    var focusedElement, url;

    if(getQueryVariable('game_id') === undefined){
      url = window.location+'?game_id='+game_oid;
    } else {
      url = window.location;
    }

    $(".game_link_txt").val(url);
    // $('.game_link_txt').focus();

    // setTimeout(function () { 
    //   $('.game_link_txt').select(); 
    // }, 100); 

    $(document).on('focus', '.game_link_txt', function () {
      if (focusedElement == this) return; //already focused, return so user can now place cursor at specific point in input.
      focusedElement = this;
      setTimeout(function () { focusedElement.select(); }, 50); //select all text in any field on focus for easy re-entry. Delay sightly to allow focus to "stick" before selecting.
    });
  }

  function log_actions(msg){
    $('.log').append($('<li>').text(msg));
  }

  function updateValue(spinner, action, dir) {
    var val = parseInt($(spinner).val(), 10);

    switch (action) {
      case "stock_value":
        var old_val = val;
        if(dir == 'inc'){
          if(val < 50){
            val++;
            $(spinner).val( val );
          }
        } else {
          if(val > 10){
            val--;
            $(spinner).val( val );
          }
        }

        if(old_val != val){
          $('.purchase_price input').val( val );
        }

        break;
      case "stocks_issued":
        if(dir == 'inc'){
          if(val < 10){
            $(spinner).val( val + 1);
          }
        } else {
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
        } else {
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
        } else {
          var price = current_company.open ? current_company.stock_price * num_purchased_stocks : 10;
          if(val > price){
            $(spinner).val( val - 1);
          }
        }
        break;
      case "rr_income":
        if(dir == 'inc'){
          $(spinner).val( val + 1);
        } else {
          var price = current_company.rr_income;
          if(val > price){
            $(spinner).val( val - 1);
          }
        }
        break;
      default:
        break;
    }

    if($('.purchase_price input').val() > user_treasury){
      alert_msg('modal-body', 'You do not have enough money to purchase that amount of stock.');
    }

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

    current_company = company;
  }

  function confirmUserTreasury(){
    if(current_company.stock_price > user_treasury){
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

    socket.emit('update_company', {
      game_oid: game_oid,
      action: action,
      company: company,
      user: $('.player_name select').val(),
      num_purchased_stocks: parseInt($(".num_purchased_stocks input").val()),
      purchase_price: parseInt($(".purchase_price input").val()),
      client: user
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


/**** GeoLocation ******/


function greatCircleDistance(loc1, loc2) {
  var lat1 = loc1[0], lon1 = loc1[1], lat2 = loc2[0], lon2 = loc2[1];
  var R = 3959; // Radius of the earth in miles
  var dLat = (lat2 - lat1) * Math.PI / 180;  // deg2rad below
  var dLon = (lon2 - lon1) * Math.PI / 180;
  var a =
     0.5 - Math.cos(dLat)/2 +
     Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
     (1 - Math.cos(dLon))/2;

  return R * 2 * Math.asin(Math.sqrt(a));
}

if ("geolocation" in navigator) {
  /* geolocation is available */
} else {
  /* geolocation IS NOT available */
}

navigator.geolocation.getCurrentPosition(function(position) {
  var coords = {lat: position.coords.latitude, lon: position.coords.longitude };
  localStorage.setItem("game-scoring--current_location", JSON.stringify(coords) );

  if(getQueryVariable('game_id')){
    game_oid = getQueryVariable('game_id');
  }

  socket.emit('available_games', {name: game_name, location: coords, game_oid: game_oid});
});

/******** Socket IO commands *****/

  socket.on('available_games', function(games){
    var html = '<li role="presentation" class="dropdown"><a href="#" class="dropdown-toggle" id="new_instance" data-toggle="dropdown" data-oid="new" role="button" aria-haspopup="true" aria-expanded="false">+ Add New Instance</a></li>';
    for(var x=0,len=games.length;x<len;x++){
      html += '<li role="presentation" class="dropdown">';
      html += '<a href="#" class="dropdown-toggle" id="'+games[x]._id+'" data-creator="'+games[x].creator.name+'" data-oid="'+games[x]._id+'" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">';
      html += games[x].creator.name+' - Dist: '+games[x].distance;
      html += '</a></li>';
    }
    $('.dropdown-menu[aria-labelledby="available_games_dd"]').html(html);

    if(game_oid !== undefined){
      preselectGameInstance(game_oid);
    }
  });

  socket.on('joined_game', function(msg){
    game_oid = msg._id;
    user_treasury = msg.users[ msg.newest_user ].cash_total;
    log_actions(msg.newest_user+' has joined the game');

    addPlayerDividends(msg.users);
  });

  socket.on('get_company', function(company){
    log_actions('information about '+company.name+' requested');

    if($('.company_pane .btn.active') && company.tag == $('.company_pane .btn.active').text().toLowerCase() ){
      $(".company_pane__fields").removeClass("hidden");
      populateCompany(company);
    }
  });

  socket.on('update_company', function(company){
    var active_company = $(".company_pane .btn.active").text().toLowerCase();

    if(active_company == company.tag){
      populateCompany(company);
    }

    if($("li.player_block").hasClass('active')){
      socket.emit('get_player_totals', { game_oid: game_oid, user: user });
    }
  });

  socket.on('get_company_dividends', function(dividends){
    updateCompanyDividends(dividends);
  });

  socket.on('update_company_treasury', function(dividends){
    socket.emit('get_company', { game_oid: game_oid, company_name: $(".company_pane .btn.active").text().toLowerCase() });
  });

  socket.on('get_stock_values', function(obj){
    var cv = obj.companies;
    var company = $('.company_pane .btn.active').text().toLowerCase();

    user_treasury = obj.user_treasury;

    $("#modal--buyStock .modal-header h5").text(cv[ company ].name );
    $("#modal--income .modal-header h5").text(cv[ company ].name );

    var prv_sv = [], min_sv = 10;
    if(obj.purchase){
      if(cv[ company ].open){
        $(".purchase_price input").val( cv[ company ].stock_price );

        $(".num_purchased_stocks").removeClass("hidden");

        $("#modal--buyStock .stock_value").addClass("hidden");
        $("#modal--buyStock .stocks_issued").addClass("hidden");
      } else {
        for(var x=0,len=companies.length;x<len;x++){
          if(cv[ companies[x] ].open && !inArray(cv[ companies[x] ].stock_value, prv_sv)){
            prv_sv.push(cv[ companies[x] ].stock_value);
          }
        }
        prv_sv.sort(sortNumber);
        for(var x=0,len=prv_sv.length;x<len;x++){
          if(prv_sv[x] == min_sv){
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

  });

  socket.on('update_player_treasury', function(users){
    if($("li.player_block").hasClass('active')){
      socket.emit('get_player_totals', { game_oid: game_oid, user: user });
    }
  });

  function setUserRoom(){
    nsp_socket = io('/'+user );

    nsp_socket.on('close_purchase_window', function(company){
      $('#modal--buyStock').modal('toggle');
    });

    nsp_socket.on('close_income_window', function(company){
      $('#modal--income').modal('toggle');
    });

    nsp_socket.on('close_company_dividend_window', function(company){
      $('#modal--company-dividend').modal('toggle');
    });

    nsp_socket.on('close_player_dividend_window', function(company){
      $('#modal--player-dividend').modal('toggle');
    });

    nsp_socket.on('get_players', function(players){
      var html = '', selected = '';
      for(var x=0,len=players.length;x<len;x++){
        selected = (players[x].name == user) ? 'selected' : '';
        html += '<option '+selected+' value="'+players[x].tag+'">'+players[x].name+'</option>';
      }
      $(".player_name select").html(html);
    });

    nsp_socket.on('get_player_totals', function(player){
      $('#user_treasury__txt').text(player.user_treasury);
      $('#player_dividend__txt').text(player.dividend_payment);
    });

    nsp_socket.on('get_player_dividends', function(players){
      console.log(players);
      for (var user in players) {
        if (players.hasOwnProperty(user)) {
            $('#modal--player-dividend .'+players[user].tag+' .panel-body').text(players[user].dividend_payment);
        }
      }
    });

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