const handlePasswordChange = (e) => {
  e.preventDefault();

  $('#snackbar').animate({height:'hide'}, 350);

  if($('#currentPass').val() == '' || $('#pass').val() == '' || $('#pass2').val() == '') {
    displaySnackbar('All fields are required');
    return false;
  }

  if($('#pass').val() !== $('#pass2').val()) {
    displaySnackbar('Passwords do not match');
    return false;
  }

  //send request to change password. Revert back to old ui with success message on success
  sendAjax('POST', $('#passwordChangeForm').attr('action'), $('#passwordChangeForm').serialize(), (response) => {
    if(response.status === 200) {
      cancelPasswordChange();

      displaySnackbar('Password Changed')
    }
  });

  return false;
};

const PasswordChangeForm = (props) => {
  return (
    <form id='passwordChangeForm' name='passwordChangeForm' onSubmit={handlePasswordChange} action='/changePass' method='POST' >

        <div className='mdl-textfield mdl-js-textfield'>
          <label htlmlFor='currentPass'>Current Password: </label>
          <input id='currentPass'className='mdl-textfield__input' type='password' name='currentPass' placeholder='current password' />
        </div>
        <div className='mdl-textfield mdl-js-textfield'>
          <label htmlFor='pass'>New Password: </label>
          <input id='pass' className='mdl-textfield__input' type='password' name='pass' placeholder='new password' />
        </div>
        <div className='mdl-textfield mdl-js-textfield'>
          <label htmlFor='pass2'>Retype New Password: </label>
          <input id='pass2' className='mdl-textfield__input' type='password' name='pass2' placeholder='retype password' />
        </div>

      <input type='hidden' name='_csrf' value={props.csrf} />
      <section className='formButtons'>
        <input className='passwordCancel mdl-button mdl-js-button mdl-button--raised mdl-button--colored' type='button' value='Cancel' onClick={cancelPasswordChange} />
        <input className='passwordSubmit mdl-button mdl-js-button mdl-button--raised mdl-button--colored' type='submit' value='Change Password' />
      </section>
    </form>
  );
};

const CancelPasswordChange = (props) => {
  return (
      <button id='passwordChangeButton' className='mdl-button mdl-js-button mdl-button--raised mdl-button--colored'>Change Password</button>
  )
};

const createPasswordChangeForm = (csrf) => {
  ReactDOM.render(
    <PasswordChangeForm csrf={csrf} />,
    document.querySelector('#passwordChange')
  );
};

const cancelPasswordChange = (csrf) => {
  ReactDOM.render(
    <CancelPasswordChange />,
    document.querySelector('#passwordChange')
  )

  const changePassword = document.querySelector('#passwordChangeButton');

  changePassword.addEventListener('click', (e) => {
    e.preventDefault();
    createPasswordChangeForm(csrf);
    return false;
  });
}

const setup = (csrf) => {
  const changePassword = document.querySelector('#passwordChangeButton');

  changePassword.addEventListener('click', (e) => {
    e.preventDefault();
    createPasswordChangeForm(csrf);
    return false;
  });
};

const getToken = () => {
  sendAjax('GET', '/getToken', null, (result) => {
    setup(result.csrfToken);
  });
};

$(document).ready(function() {
  getToken();
});









