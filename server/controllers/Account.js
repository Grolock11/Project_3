const models = require('../models');

const Account = models.Account;

const loginPage = (req, res) => {
  res.render('login', { csrfToken: req.csrfToken() });
};

//Display account page with badic info
//I'm pretty sure this is giving me an error becaouse I made it an async dunction,
//but it had to be in order for the await to be used so I'm not sure what I could do about that.
const accountPage = async (req, res) => {
  const totalGames = await models.Game.GameModel.findByOwner(req.session.account._id);
  const numGames = totalGames.length;
  res.render('account', { csrfToken: req.csrfToken(), username: req.session.account.username, totalGames: numGames});
};

//Redirect to games page if user is logged in. Login page if not
const notFound = (req, res) => {
  if(req.session.account) {
    res.redirect('/games');
  }
  else {
    res.redirect('/');
  }
};

const logout = (req, res) => {
  req.session.destroy();
  res.redirect('/');
};

const login = (request, response) => {
  const req = request;
  const res = response;

  const username = `${req.body.username}`;
  const password = `${req.body.pass}`;

  if (!username || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  return Account.AccountModel.authenticate(username, password, (err, account) => {
    if (err || !account) {
      return res.status(401).json({ error: 'Wrong username or password' });
    }

    req.session.account = Account.AccountModel.toAPI(account);

    return res.json({ redirect: '/games' });
  });
};

const signup = (request, response) => {
  const req = request;
  const res = response;

  req.body.username = `${req.body.username}`;
  req.body.pass = `${req.body.pass}`;
  req.body.pass2 = `${req.body.pass2}`;

  if (!req.body.username || !req.body.pass || !req.body.pass2) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (req.body.pass !== req.body.pass2) {
    return res.status(400).json({ error: 'passwords do not match ' });
  }

  return Account.AccountModel.generateHash(req.body.pass, (salt, hash) => {
    const accountData = {
      username: req.body.username,
      salt,
      password: hash,
    };

    const newAccount = new Account.AccountModel(accountData);
    const savePromise = newAccount.save();

    savePromise.then(() => {
      req.session.account = Account.AccountModel.toAPI(newAccount);
      return res.json({ redirect: '/games' });
    });
    savePromise.catch((err) => {
      console.log(err);

      if (err.code === 11000) {
        return res.status(400).json({ error: 'Username already in use.' });
      }

      return res.status(400).json({ error: 'An error occured' });
    });
  });
};

const changePassword = (request, response) => {
  const req = request;
  const res = response;

  const username = req.session.account.username;
  const password = `${req.body.currentPass}`;
  const newPassword = `${req.body.pass}`;
  const newPassword2 = `${req.body.pass2}`;

  if (!password || !newPassword || !newPassword2) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (newPassword !== newPassword2) {
    return res.status(400).json({ error: 'Passwords must match'})
  }

  return Account.AccountModel.authenticate(username, password, (err, account) => {
    console.dir(req.body);
    if (err || !account) {
      return res.status(401).json({ error: 'Wrong password' });
    }

    if(account) {
      Account.AccountModel.generateHash(req.body.pass, (salt, hash) => {
        const accountData = {
          username,
          salt,
          password: hash,
        };

        Account.AccountModel.findByUsername(username, (err, user) => {
          user.set(accountData);
          user.save();

          return res.status(200).json({status: 200});
        });
      });
    }
  });
}

const getToken = (request, response) => {
  const req = request;
  const res = response;

  const csrfJSON = {
    csrfToken: req.csrfToken(),
  };

  res.json(csrfJSON);
};

module.exports = {
  loginPage,
  accountPage,
  notFound,
  changePassword,
  login,
  logout,
  getToken,
  signup,
};
