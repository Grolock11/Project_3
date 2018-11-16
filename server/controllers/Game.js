const models = require('../models');

const Game = models.Game;

const gamePage = (req, res) => {
  Game.GameModel.findByOwner(req.session.account._id, (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occured' });
    }

    return res.render('app', { csrfToken: req.csrfToken(), games: docs });
  });
};

//Creates a new game from input data. If trying to create an already existing game it will update instead.
const makeGame = (req, res) => {
  console.dir(req.body);

  if ((!req.body.name || !req.body.status) ||
  (req.body.status === 'In Progress' && !req.body.progress)) {
    return res.status(400).json({ error: 'RAWR! Both name and age are required' });
  }

  //prevent game name from being a number since it would break some html stuff
  if(!isNaN(req.body.name)) {
    return res.status(400).json({ error: 'Game name cannot be a number' });
  }

  let gameToSave = null;

  const gameData = {
    name: req.body.name,
    status: req.body.status,
    owner: req.session.account._id,
    progress: req.body.progress,
  };

  //If the game already exists, update the data instead.
  Game.GameModel.findOne({ name: req.body.name }, (err, game) => {
    if (game) {
      game.set(gameData);
      gameToSave = game;
    }
    else {
      gameToSave = Game.GameModel(gameData);
    }

    const gamePromise = gameToSave.save();

    gamePromise.then(() => res.json({ redirect: '/games' }));

    gamePromise.catch((err) => {
      console.log(err);
      if (err.code === 11000) {
        return res.status(400).json({ error: 'Game already exists.' });
      }

      return res.status(400).json({ error: 'An error occured' });
    });

    return gamePromise;
  });
};

//Edit game data. It takes place separately to handle an error if the game isn't found
const editGame = (req, res) => {
  console.dir(req.body);

  if ((!req.body.name || !req.body.status) ||
  (req.body.status === 'In Progress' && !req.body.progress)) {
    return res.status(400).json({ error: 'Missing data' });
  }

  if(!isNaN(req.body.name)) {
    return res.status(400).json({ error: 'Game name cannot be a number' });
  }

  const gameData = {
    name: req.body.name,
    status: req.body.status,
    progress: req.body.progress,
  };

  //If the game already exists, update the data instead.
  Game.GameModel.findOne({ name: req.body.gameName }, (err, game) => {
    if (game) {
      game.set(gameData);
      gameToSave = game;
    }
    else {
      return res.status(404).json({error: 'Game not found' });
    }

    const gamePromise = gameToSave.save();

    gamePromise.then(() => res.json({ redirect: '/games' }));

    gamePromise.catch((err) => {
      console.log(err);
      return res.status(400).json({ error: 'An error occured' });
    });

    return gamePromise;
  });
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

module.exports.gamePage = gamePage;
module.exports.getGames = getGames;
module.exports.deleteGame = deleteGame;
module.exports.make = makeGame;
module.exports.editGame = editGame;

