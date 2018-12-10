'use strict';

var handleLogin = function handleLogin(e) {
  e.preventDefault();

  $('snackbar').animate({ height: 'hide' }, 350);

  if ($('#user').val() == '' || $('#pass').val() == '') {
    displaySnackbar('Username or password is empty');
    return false;
  }

  console.log($('input[name=_csrf]').val());

  sendAjax('POST', $('#loginForm').attr('action'), $('#loginForm').serialize(), redirect);

  return false;
};

var handleSignup = function handleSignup(e) {
  e.preventDefault();

  $('#snackbar').animate({ height: 'hide' }, 350);

  if ($('#user').val() == '' || $('#pass').val() == '' || $('#pass2').val() == '') {
    displaySnackbar('All fields are required');
    return false;
  }

  if ($('#pass').val() !== $('#pass2').val()) {
    displaySnackbar('Passwords do not match');
    return false;
  }

  sendAjax('POST', $('#signupForm').attr('action'), $('#signupForm').serialize(), redirect);

  return false;
};

var LoginWindow = function LoginWindow(props) {
  return React.createElement(
    'form',
    { id: 'loginForm', name: 'loginForm', onSubmit: handleLogin, action: '/login', method: 'POST', className: 'mainForm' },
    React.createElement(
      'label',
      { htlmlFor: 'username' },
      'Username: '
    ),
    React.createElement('input', { id: 'user', className: 'mdl-textfield__input', type: 'text', name: 'username', placeholder: 'username' }),
    React.createElement(
      'label',
      { htmlFor: 'pass' },
      'Password: '
    ),
    React.createElement('input', { id: 'pass', className: 'mdl-textfield__input', type: 'password', name: 'pass', placeholder: 'password' }),
    React.createElement('input', { type: 'hidden', name: '_csrf', value: props.csrf }),
    React.createElement('input', { className: 'formSubmit mdl-button mdl-js-button mdl-button--raised mdl-button--colored', type: 'submit', value: 'Sign in' })
  );
};

var SignupWindow = function SignupWindow(props) {
  return React.createElement(
    'form',
    { id: 'signupForm', name: 'signupForm', onSubmit: handleSignup, action: '/signup', method: 'POST', className: 'mainForm' },
    React.createElement(
      'label',
      { htlmlFor: 'username' },
      'Username: '
    ),
    React.createElement('input', { id: 'user', className: 'mdl-textfield__input', type: 'text', name: 'username', placeholder: 'username' }),
    React.createElement(
      'label',
      { htmlFor: 'pass' },
      'Password: '
    ),
    React.createElement('input', { id: 'pass', className: 'mdl-textfield__input', type: 'password', name: 'pass', placeholder: 'password' }),
    React.createElement(
      'label',
      { htmlFor: 'pass2' },
      'Password: '
    ),
    React.createElement('input', { id: 'pass2', className: 'mdl-textfield__input', type: 'password', name: 'pass2', placeholder: 'retype password' }),
    React.createElement('input', { type: 'hidden', name: '_csrf', value: props.csrf }),
    React.createElement('input', { className: 'formSubmit mdl-button mdl-js-button mdl-button--raised mdl-button--colored', type: 'submit', value: 'Sign Up' })
  );
};

var createLoginWindow = function createLoginWindow(csrf) {
  ReactDOM.render(React.createElement(LoginWindow, { csrf: csrf }), document.querySelector('#content'));
};

var createSignupWindow = function createSignupWindow(csrf) {
  ReactDOM.render(React.createElement(SignupWindow, { csrf: csrf }), document.querySelector('#content'));
};

var setup = function setup(csrf) {
  var loginButton = document.querySelector('#loginButton');
  var signupButton = document.querySelector('#signupButton');

  signupButton.addEventListener('click', function (e) {
    e.preventDefault();
    createSignupWindow(csrf);
    return false;
  });

  loginButton.addEventListener('click', function (e) {
    e.preventDefault();
    createLoginWindow(csrf);
    return false;
  });

  createLoginWindow(csrf);
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