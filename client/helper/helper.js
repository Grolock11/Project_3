const displaySnackbar = (message) => {
  $('#snackbarMessage').text(message);
  $('#snackbar').animate({height: 'toggle'}, 350);
};

const redirect = (response) => {
  $('#snackbar').animate({height: 'hide'}, 350);
  window.location = response.redirect;
};

const sendAjax = (type, action, data, success) => {
  $.ajax({
    cache: false,
    type: type,
    url: action,
    data: data,
    dataType: "json",
    success: success,
    error: function(xhr, status, error) {
      var messageObj = JSON.parse(xhr.responseText);
      displaySnackbar(messageObj.error);
    }
  });
};
