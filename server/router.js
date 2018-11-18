const controllers = require('./controllers');
const mid = require('./middleware');
const router = (app) => {
  app.get('/getToken', mid.requiresSecure, controllers.Account.getToken);
  app.get('/getGames', mid.requiresLogin, controllers.Game.getGames);
  app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);
  app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);
  app.get('/logout', mid.requiresLogin, controllers.Account.logout);
  app.get('/games', mid.requiresLogin, controllers.Game.gamePage);
  app.delete('/game', mid.requiresLogin, controllers.Game.deleteGame);
  app.post('/games', mid.requiresLogin, controllers.Game.make);
  app.post('/editGame', mid.requiresLogin, controllers.Game.editGame);
  app.get('/account', mid.requiresLogin, controllers.Account.accountPage);
  app.post('/changePass', mid.requiresSecure, mid.requiresLogin,
   controllers.Account.changePassword);
  app.get('/', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.get('*', mid.requiresSecure, controllers.Account.notFound);
};

module.exports = router;
