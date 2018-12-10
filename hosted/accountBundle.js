'use strict';

var handlePasswordChange = function handlePasswordChange(e) {
  e.preventDefault();

  $('#snackbar').animate({ height: 'hide' }, 350);

  if ($('#currentPass').val() == '' || $('#pass').val() == '' || $('#pass2').val() == '') {
    displaySnackbar('All fields are required');
    return false;
  }

  if ($('#pass').val() !== $('#pass2').val()) {
    displaySnackbar('Passwords do not match');
    return false;
  }

  //send request to change password. Revert back to old ui with success message on success
  sendAjax('POST', $('#passwordChangeForm').attr('action'), $('#passwordChangeForm').serialize(), function (response) {
    if (response.status === 200) {
      cancelPasswordChange();

      displaySnackbar('Password Changed');
    }
  });

  return false;
};

var PasswordChangeForm = function PasswordChangeForm(props) {
  return React.createElement(
    'form',
    { id: 'passwordChangeForm', name: 'passwordChangeForm', onSubmit: handlePasswordChange, action: '/changePass', method: 'POST' },
    React.createElement(
      'div',
      { className: 'mdl-textfield mdl-js-textfield' },
      React.createElement(
        'label',
        { htlmlFor: 'currentPass' },
        'Current Password: '
      ),
      React.createElement('input', { id: 'currentPass', className: 'mdl-textfield__input', type: 'password', name: 'currentPass', placeholder: 'current password' })
    ),
    React.createElement(
      'div',
      { className: 'mdl-textfield mdl-js-textfield' },
      React.createElement(
        'label',
        { htmlFor: 'pass' },
        'New Password: '
      ),
      React.createElement('input', { id: 'pass', className: 'mdl-textfield__input', type: 'password', name: 'pass', placeholder: 'new password' })
    ),
    React.createElement(
      'div',
      { className: 'mdl-textfield mdl-js-textfield' },
      React.createElement(
        'label',
        { htmlFor: 'pass2' },
        'Retype New Password: '
      ),
      React.createElement('input', { id: 'pass2', className: 'mdl-textfield__input', type: 'password', name: 'pass2', placeholder: 'retype password' })
    ),
    React.createElement('input', { type: 'hidden', name: '_csrf', value: props.csrf }),
    React.createElement(
      'section',
      { className: 'formButtons' },
      React.createElement('input', { className: 'passwordCancel mdl-button mdl-js-button mdl-button--raised mdl-button--colored', type: 'button', value: 'Cancel', onClick: cancelPasswordChange }),
      React.createElement('input', { className: 'passwordSubmit mdl-button mdl-js-button mdl-button--raised mdl-button--colored', type: 'submit', value: 'Change Password' })
    )
  );
};

var CancelPasswordChange = function CancelPasswordChange(props) {
  return React.createElement(
    'button',
    { id: 'passwordChangeButton', className: 'mdl-button mdl-js-button mdl-button--raised mdl-button--colored' },
    'Change Password'
  );
};

var createPasswordChangeForm = function createPasswordChangeForm(csrf) {
  ReactDOM.render(React.createElement(PasswordChangeForm, { csrf: csrf }), document.querySelector('#passwordChange'));
};

var cancelPasswordChange = function cancelPasswordChange(csrf) {
  ReactDOM.render(React.createElement(CancelPasswordChange, null), document.querySelector('#passwordChange'));

  var changePassword = document.querySelector('#passwordChangeButton');

  changePassword.addEventListener('click', function (e) {
    e.preventDefault();
    createPasswordChangeForm(csrf);
    return false;
  });
};

var setup = function setup(csrf) {
  var changePassword = document.querySelector('#passwordChangeButton');

  changePassword.addEventListener('click', function (e) {
    e.preventDefault();
    createPasswordChangeForm(csrf);
    return false;
  });
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