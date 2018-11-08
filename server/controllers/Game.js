const models = require('../models');

const Game = models.Game;

const makerPage = (req, res) => {
  Game.GameModel.findByOwner(req.session.account._id, (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occured' });
    }

    return res.render('app', { csrfToken: req.csrfToken(), games: docs });
  });
};


const makeGame = (req, res) => {
  console.dir(req.body);

  if ((!req.body.name || !req.body.status) ||
  (req.body.status === 'In Progress' && !req.body.progress)) {
    return res.status(400).json({ error: 'RAWR! Both name and age are required' });
  }

  const gameData = {
    name: req.body.name,
    status: req.body.status,
    owner: req.session.account._id,
    progress: req.body.progress,
  };

  const newGame = new Game.GameModel(gameData);

  const gamePromise = newGame.save();

  gamePromise.then(() => res.json({ redirect: '/maker' }));

  gamePromise.catch((err) => {
    console.log(err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Game already exists.' });
    }

    return res.status(400).json({ error: 'An error occured' });
  });

  return gamePromise;
};

const getGames = (request, response) => {
  const req = request;
  const res = response;

  return Game.GameModel.findByOwner(req.session.account._id, (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occured' });
    }

    return res.json({ csrfToken: req.csrfToken(), games: docs });
  });
};

const deleteGame = (request, response) => {
  console.log('made it into deleteGame');

  const req = request;
  const res = response;

  Game.GameModel.remove({ name: req.body.gameName }, (err) => {
    console.dir(err);
    if (err) {
      return res.status(400).json({ error: 'An error occured while deleting the game' });
    }
    return res.status(200).json({ success: 'success' });
  });
};

module.exports.makerPage = makerPage;
module.exports.getGames = getGames;
module.exports.deleteGame = deleteGame;
module.exports.make = makeGame;

