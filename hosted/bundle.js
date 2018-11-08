'use strict';

var handleDomo = function handleDomo(e) {
  e.preventDefault();
  $('#domoMessage').animate({ width: 'hide' }, 350);

  if ($('#gameName').val() == '' || $('#status').val() == '') {
    handleError('RAWR! All fields are required');
    return false;
  }

  sendAjax('POST', $('#gameForm').attr('action'), $('#gameForm').serialize(), function () {
    loadGamesFromServer();
  });

  return false;
};

//send a request to delete the domo
var deleteDomo = function deleteDomo(e, name) {
  e.preventDefault();

  sendAjax('DELETE', '/game', $('.' + name).serialize(), function () {
    loadGamesFromServer();
  });

  return false;
};

//using a comment attribute temporarily in react to store comments inline
var GameForm = function GameForm(props) {
  return React.createElement(
    'form',
    { id: 'gameForm', onSubmit: handleDomo, name: 'gameForm', action: 'maker', method: 'POST', className: 'gameForm' },
    React.createElement(
      'label',
      { htmlFor: 'gameName' },
      'Game: '
    ),
    React.createElement('input', { id: 'gameName', type: 'text', name: 'name', placeholder: 'Domo Name' }),
    React.createElement(
      'label',
      { htmlFor: 'progress' },
      'Progress: '
    ),
    React.createElement('input', { id: 'progress', type: 'text', name: 'progress', placeholder: 'Current Progress', comment: 'Will likely be hidden and appear if \'in progress\' is selected form the status drop down' }),
    React.createElement(
      'label',
      { htmlFor: 'gameStatus' },
      'Status: '
    ),
    React.createElement('input', { id: 'gameStatus', type: 'text', name: 'status', placeholder: 'Current Status', comment: 'make a dropdown with options Completed, in progress, planned, possibly others.' }),
    React.createElement('input', { id: 'csrf', type: 'hidden', name: '_csrf', value: props.csrf }),
    React.createElement('input', { className: 'gameSubmit', type: 'submit', value: 'Submit', comment: 'class was domoMakerSubmit for css' })
  );
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
        'No Entries yet, add one!'
      )
    );
  };

  var gameNodes = props.games.map(function (game) {
    return React.createElement(
      'div',
      { key: game._id, className: 'game' },
      React.createElement(
        'h3',
        { className: 'gameName' },
        ' Name: ',
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
        { className: 'gameProgress', comment: 'Should only appear if status is in progress' },
        ' Progress: ',
        game.progress,
        ' '
      ),
      React.createElement(
        'form',
        { className: game.name, onSubmit: function onSubmit(e) {
            return deleteDomo(e, game.name);
          } },
        React.createElement('input', { className: 'deleteGame', type: 'submit', value: 'Delete' }),
        React.createElement('input', { id: 'csrf', type: 'hidden', name: '_csrf', value: $('#csrf').val() }),
        React.createElement('input', { type: 'hidden', name: 'domoName', value: game.name })
      ),
      React.createElement(
        'form',
        { className: game.name, onSubmit: function onSubmit(e) {
            return deleteDomo(e, game.name);
          } },
        React.createElement('input', { className: 'editGame', type: 'submit', value: 'Edit' }),
        React.createElement('input', { id: 'csrf', type: 'hidden', name: '_csrf', value: $('#csrf').val() }),
        React.createElement('input', { type: 'hidden', name: 'domoName', value: game.name })
      )
    );
  });

  return React.createElement(
    'div',
    { className: 'gameList' },
    gameNodes
  );
};

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

$(document).ready(function () {
  getToken();
});
'use strict';

var handleError = function handleError(message) {
  $('#errorMessage').text(message);
  $('#domoMessage').animate({ width: 'toggle' }, 350);
};

var redirect = function redirect(response) {
  $('#domoMessage').animate({ width: 'hide' }, 350);
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
      handleError(messageObj.error);
    }
  });
};
