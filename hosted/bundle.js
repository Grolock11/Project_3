'use strict';

//Global edit mode object. Used for storing which games are in edit mode so they don't resize at inproper times
var editMode = {};

var handleGame = function handleGame(e) {
  e.preventDefault();
  $('#snackbar').animate({ height: 'hide' }, 350);

  //Only check name since status always has some value. Progress is never required
  if ($('#gameName').val() == '') {
    displaySnackbar('Game name is required');
    return false;
  }

  sendAjax('POST', $('#gameForm').attr('action'), $('#gameForm').serialize(), function () {
    loadGamesFromServer();
  });

  return false;
};

//send a request to delete the game
var deleteGame = function deleteGame(e, name) {
  e.preventDefault();

  sendAjax('DELETE', '/game', $('.delete' + name.replace(/\s|:|-|'/g, "QZ")).serialize(), function () {
    loadGamesFromServer();
  });

  return false;
};

//send a request to edit the game
var editGame = function editGame(e, game) {
  e.preventDefault();

  ReactDOM.render(React.createElement(GameEditMode, { game: game }), document.querySelector('.' + game.name.replace(/\s|:|-|'/g, "QZ")));

  return false;
};

//Go back to edit mode without making any request
var cancelEdit = function cancelEdit(e, game) {
  e.preventDefault();

  ReactDOM.render(React.createElement(GameReadMode, { game: game }), document.querySelector('.' + game.name.replace(/\s|:|-|'/g, "QZ")));

  return false;
};

//send a request to edit the game
var submitEdit = function submitEdit(e, game, oldGame) {
  e.preventDefault();

  sendAjax('POST', '/editGame', $('.edit' + oldGame.name.replace(/\s|:|-|'/g, "QZ")).serialize(), function () {
    ReactDOM.render(React.createElement(GameReadMode, { game: game }), document.querySelector('.' + oldGame.name.replace(/\s|:|-|'/g, "QZ")));

    loadGamesFromServer();
  });

  return false;
};

//populate autocomplete based on user search
var searchGames = function searchGames(currentSearch) {

  //reset underlying value for game image so it doesn't save the wrong one
  $('#gameCover').val('');

  sendAjax('POST', '/searchGames', $('#gameForm').serialize(), function (response) {
    var games = response.games.body;
    console.dir(response.games.body);

    if (games.length) {
      var gameNames = games.map(function (game) {
        return game.name;
      });

      //set the autocomplete to show the games found from the search
      $('#gameName').autocomplete({
        source: gameNames,
        select: function select(event, ui) {
          var selected = games.filter(function (game) {
            return game.name == ui.item.value;
          });

          console.dir(ui.item.value);
          console.dir(selected);

          //Set the image for the game if it has one
          if (selected[0].cover) {
            $('#gameCover').val(selected[0].cover.url);
          } else {
            $('#gameCover').val('');
          }
        }
      });
    }
  });
};

//using a comment attribute temporarily in react to store comments inline
var GameForm = function GameForm(props) {
  return React.createElement(
    'form',
    { id: 'gameForm', onSubmit: handleGame, name: 'gameForm', action: 'games', method: 'POST', className: 'gameForm' },
    React.createElement(
      'div',
      { id: 'gameFormInputs' },
      React.createElement(
        'div',
        null,
        React.createElement(
          'label',
          { htmlFor: 'gameName' },
          'Game: '
        ),
        React.createElement('input', { id: 'gameName', type: 'text', name: 'name', placeholder: 'Game Name', onChange: function onChange(e) {
            return searchGames(e.target.value);
          } })
      ),
      React.createElement(
        'div',
        null,
        React.createElement(
          'label',
          { htmlFor: 'gameStatus' },
          'Status: '
        ),
        React.createElement(
          'select',
          { id: 'gameStatus', name: 'status', placeholder: 'Current Status', onChange: statusChange },
          React.createElement(
            'option',
            { value: 'Not yet started' },
            'Not yet started'
          ),
          React.createElement(
            'option',
            { value: 'In Progress' },
            'In Progress'
          ),
          React.createElement(
            'option',
            { value: 'Completed' },
            'Completed'
          ),
          React.createElement(
            'option',
            { value: 'Aiming for 100%' },
            'Aiming for 100%'
          ),
          React.createElement(
            'option',
            { value: 'Completed 100%' },
            'Completed 100%'
          )
        )
      ),
      React.createElement('div', { id: 'progressArea' })
    ),
    React.createElement('input', { id: 'csrf', type: 'hidden', name: '_csrf', value: props.csrf }),
    React.createElement('input', { id: 'gameCover', type: 'hidden', name: 'cover', value: '' }),
    React.createElement('input', { className: 'gameSubmit', type: 'submit', value: 'Submit' })
  );
};

//display progress when it may be needed
var DisplayProgress = function DisplayProgress(props) {
  return React.createElement(
    'div',
    null,
    React.createElement(
      'label',
      { htmlFor: 'progress' },
      'Progress: '
    ),
    React.createElement('input', { id: 'progress', type: 'text', name: 'progress', placeholder: 'Current Progress' })
  );
};

//hides progress on when it's not needed
var HideProgress = function HideProgress(props) {
  return React.createElement('div', null);
};

//to perform on status change to display/hide progress
var statusChange = function statusChange() {

  var value = $('#gameStatus').val();

  if (checkStatus(value)) {
    ReactDOM.render(React.createElement(DisplayProgress, null), document.querySelector('#progressArea'));

    $('#gameForm').animate({ height: '110' }, 50);
  } else {
    ReactDOM.render(React.createElement(HideProgress, null), document.querySelector('#progressArea'));

    $('#gameForm').animate({ height: '87' }, 50);
  }
};

//called when the status in an edit field is changed
var editStatusChange = function editStatusChange(value, game) {
  game.status = value;

  if ($('.edit' + game.name.replace(/\s|:|-|'/g, "QZ") + 'Progress').length) {
    ReactDOM.render(React.createElement(RefreshProgress, { game: game }), document.querySelector('.edit' + game.name.replace(/\s|:|-|'/g, "QZ") + 'Progress'));
  }
};

//refreshes the progress section of an edit mode game
var RefreshProgress = function RefreshProgress(props) {
  var game = props.game;

  return React.createElement(
    'div',
    { className: 'edit' + game.name.replace(/\s|:|-|'/g, "QZ") + 'Progress progressDiv' },
    React.createElement(
      'h3',
      { className: 'gameProgress editLabel progressEditLabel' },
      'Progress: ',
      !checkStatus(game.status) && 'N/A'
    ),
    checkStatus(game.status) && React.createElement('input', { className: 'editInput progressInput', name: 'progress', type: 'text', value: game.progress, onChange: function onChange(e) {
        return onInputChange(e.target.value, game, 'progress');
      } })
  );
};

//Quick function to check if the status is one that could use a progress field
var checkStatus = function checkStatus(status) {
  if (status === 'In Progress' || status === 'Aiming for 100%') {
    return true;
  }
  return false;
};

//Edit button has no functionality behind it yet
var GameList = function GameList(props) {
  if (props.games.length === 0) {
    return React.createElement(
      'div',
      { className: 'gameList' },
      React.createElement(
        'h3',
        { className: 'emptyGame' },
        'No games found on this account'
      )
    );
  };

  var gameNodes = props.games.map(function (game) {
    var classes = 'game ' + game.name.replace(/\s|:|-|'/g, "QZ"); //to set mutliple classes since `` quotes apparently don't like className
    console.dir(game);
    return React.createElement(
      'div',
      { key: game._id, className: classes, onClick: function onClick() {
          testDivClick(game);
        } },
      game.cover && React.createElement('img', { src: game.cover }),
      !game.cover && React.createElement(
        'h3',
        { className: 'imgAlt' },
        'No Image'
      ),
      React.createElement(
        'h3',
        { className: 'gameName' },
        ' ',
        game.name,
        ' '
      ),
      React.createElement(
        'h3',
        { className: 'gameStatus' },
        ' Status: ',
        game.status,
        ' '
      ),
      React.createElement(
        'h3',
        { className: 'gameProgress' },
        ' Progress: ',
        game.progress || 'N/A',
        ' '
      ),
      React.createElement(
        'form',
        { className: 'delete' + game.name.replace(/\s|:|-|'/g, "QZ"), onSubmit: function onSubmit(e) {
            return deleteGame(e, game.name);
          } },
        React.createElement('input', { className: 'deleteGame', type: 'submit', value: 'Delete' }),
        React.createElement('input', { id: 'csrf', type: 'hidden', name: '_csrf', value: $('#csrf').val() }),
        React.createElement('input', { type: 'hidden', name: 'gameName', value: game.name })
      ),
      React.createElement(
        'form',
        { className: 'edit' + game.name.replace(/\s|:|-|'/g, "QZ"), onSubmit: function onSubmit(e) {
            return editGame(e, game);
          } },
        React.createElement('input', { className: 'editGame', type: 'submit', value: 'Edit' }),
        React.createElement('input', { id: 'csrf', type: 'hidden', name: '_csrf', value: $('#csrf').val() }),
        React.createElement('input', { type: 'hidden', name: 'gameName', value: game.name })
      )
    );
  });

  return React.createElement(
    'div',
    { className: 'gameList' },
    gameNodes
  );
};

var testDivClick = function testDivClick(game) {
  var div = $('.' + game.name.replace(/\s|:|-|'/g, "QZ"));

  if (div.css('height') != '200px') {
    div.animate({ height: '200' }, 300);
  } else if (!editMode[game.name.replace(/\s|:|-|'/g, "QZ")]) {
    div.animate({ height: '75' }, 300);
  }
};

//switches a game to edit mode
var GameEditMode = function GameEditMode(props) {
  //one copy for editing and a separate copy to revert back to on cancel
  var game = props.game;
  editMode[game.name.replace(/\s|:|-|'/g, "QZ")] = true;

  $('.' + game.name.replace(/\s|:|-|'/g, "QZ")).animate({ height: '200' }, 300);

  var oldGame = {
    name: game.name,
    progress: game.progress,
    status: game.status,
    cover: game.cover
  };
  return React.createElement(
    'form',
    { className: 'edit' + game.name.replace(/\s|:|-|'/g, "QZ") + ' editForm', onSubmit: function onSubmit(e) {
        return submitEdit(e, game, oldGame);
      } },
    game.cover && React.createElement('img', { src: game.cover }),
    !game.cover && React.createElement(
      'h3',
      { className: 'imgAlt' },
      'No Image'
    ),
    React.createElement(
      'h3',
      { className: 'gameName' },
      ' ',
      game.name,
      ' '
    ),
    React.createElement(
      'div',
      { className: 'editStatusDiv' },
      React.createElement(
        'h3',
        { className: 'gameStatus editLabel' },
        ' Status:'
      ),
      React.createElement(
        'select',
        { id: 'gameStatus', className: 'editInput', name: 'status', onChange: function onChange(e) {
            editStatusChange(e.target.value, game);
          } },
        game.status == 'Not yet started' && React.createElement(
          'option',
          { value: 'Not yet started', selected: true },
          'Not yet started'
        ),
        game.status != 'Not yet started' && React.createElement(
          'option',
          { value: 'Not yet started' },
          'Not yet started'
        ),
        game.status == 'In Progress' && React.createElement(
          'option',
          { value: 'In Progress', selected: true },
          'In Progress'
        ),
        game.status != 'In Progress' && React.createElement(
          'option',
          { value: 'In Progress' },
          'In Progress'
        ),
        game.status == 'Completed' && React.createElement(
          'option',
          { value: 'Completed', selected: true },
          'Completed'
        ),
        game.status != 'Completed' && React.createElement(
          'option',
          { value: 'Completed' },
          'Completed'
        ),
        game.status == 'Aiming for 100%' && React.createElement(
          'option',
          { value: 'Aiming for 100%', selected: true },
          'Aiming for 100%'
        ),
        game.status != 'Aiming for 100%' && React.createElement(
          'option',
          { value: 'Aiming for 100%' },
          'Aiming for 100%'
        ),
        game.status == 'Completed 100%' && React.createElement(
          'option',
          { value: 'Completed 100%', selected: true },
          'Completed 100%'
        ),
        game.status != 'Completed 100%' && React.createElement(
          'option',
          { value: 'Completed 100%' },
          'Completed 100%'
        )
      )
    ),
    React.createElement('input', { className: 'cancelEdit', type: 'button', value: 'Cancel', onClick: function onClick(e) {
        return cancelEdit(e, oldGame);
      } }),
    React.createElement('input', { className: 'editGame', type: 'submit', value: 'Submit' }),
    React.createElement('input', { id: 'csrf', type: 'hidden', name: '_csrf', value: $('#csrf').val() }),
    React.createElement('input', { type: 'hidden', name: 'gameName', value: game.name }),
    React.createElement(
      'div',
      { className: 'edit' + game.name.replace(/\s|:|-|'/g, "QZ") + 'Progress progressDiv' },
      React.createElement(
        'h3',
        { className: 'gameProgress editLabel progressEditLabel' },
        'Progress: ',
        !checkStatus(game.status) && 'N/A'
      ),
      checkStatus(game.status) && React.createElement('input', { className: 'editInput progressInput', name: 'progress', type: 'text', value: game.progress, onChange: function onChange(e) {
          return onInputChange(e.target.value, game, 'progress');
        } })
    )
  );
};

//switches the game back to read only mode
var GameReadMode = function GameReadMode(props) {
  var game = props.game;
  editMode[game.name.replace(/\s|:|-|'/g, "QZ")] = false;

  return React.createElement(
    'div',
    null,
    game.cover && React.createElement('img', { src: game.cover }),
    !game.cover && React.createElement(
      'h3',
      { className: 'imgAlt' },
      'No Image'
    ),
    React.createElement(
      'h3',
      { className: 'gameName' },
      ' ',
      game.name,
      ' '
    ),
    React.createElement(
      'h3',
      { className: 'gameStatus' },
      ' Status: ',
      game.status,
      ' '
    ),
    React.createElement(
      'h3',
      { className: 'gameProgress' },
      ' Progress: ',
      game.progress || 'N/A',
      ' '
    ),
    React.createElement(
      'form',
      { className: 'delete' + game.name.replace(/\s|:|-|'/g, "QZ"), onSubmit: function onSubmit(e) {
          return deleteGame(e, game.name);
        } },
      React.createElement('input', { className: 'deleteGame', type: 'submit', value: 'Delete' }),
      React.createElement('input', { id: 'csrf', type: 'hidden', name: '_csrf', value: $('#csrf').val() }),
      React.createElement('input', { type: 'hidden', name: 'gameName', value: game.name })
    ),
    React.createElement(
      'form',
      { className: 'edit' + game.name.replace(/\s|:|-|'/g, "QZ"), onSubmit: function onSubmit(e) {
          return editGame(e, game);
        } },
      React.createElement('input', { className: 'editGame', type: 'submit', value: 'Edit' }),
      React.createElement('input', { id: 'csrf', type: 'hidden', name: '_csrf', value: $('#csrf').val() }),
      React.createElement('input', { type: 'hidden', name: 'gameName', value: game.name })
    )
  );
};

//Reload the games from the sever
var loadGamesFromServer = function loadGamesFromServer() {
  sendAjax('GET', '/getGames', null, function (data) {
    ReactDOM.render(React.createElement(GameList, { games: data.games, csrf: csrf }), document.querySelector('#games'));
  });
};

var setup = function setup(csrf) {
  ReactDOM.render(React.createElement(GameForm, { csrf: csrf }), document.querySelector('#addGame'));

  ReactDOM.render(React.createElement(GameList, { games: [] }), document.querySelector('#games'));

  loadGamesFromServer();
};

var getToken = function getToken() {
  sendAjax('GET', '/getToken', null, function (result) {
    setup(result.csrfToken);
  });
};

var onInputChange = function onInputChange(val, game, field) {
  game['' + field] = val;

  setState({
    name: val
  });
};

$(document).ready(function () {
  getToken();
});
'use strict';

var displaySnackbar = function displaySnackbar(message) {
  $('#snackbarMessage').text(message);
  $('#snackbar').animate({ height: 'toggle' }, 350);
};

var redirect = function redirect(response) {
  $('#snackbar').animate({ height: 'hide' }, 350);
  window.location = response.redirect;
};

var sendAjax = function sendAjax(type, action, data, success) {
  $.ajax({
    cache: false,
    type: type,
    url: action,
    data: data,
    dataType: "json",
    success: success,
    error: function error(xhr, status, _error) {
      var messageObj = JSON.parse(xhr.responseText);
      displaySnackbar(messageObj.error);
    }
  });
};