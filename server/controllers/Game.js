const models = require('../models');
const igbd = require('igdb-api-node').default;

const Game = models.Game;
const igbdKey = process.env.igbd || '7d5dde2197753afed047fb704b503de4';

const gamePage = (req, res) => {
  Game.GameModel.findByOwner(req.session.account._id, (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occured' });
    }

    return res.render('app', { csrfToken: req.csrfToken(), games: docs });
  });
};

// Creates a new game from input data. If trying to create an already existing
// game it will update instead.
const makeGame = (req, res) => {
  if ((!req.body.name || !req.body.status) ||
  (req.body.status === 'In Progress' && !req.body.progress)) {
    return res.status(400).json(
      { error: 'Name is required Progress is required if available' }
    );
  }

  // prevent game name from being a number since it would break some html stuff
  if (!isNaN(req.body.name)) {
    return res.status(400).json({ error: 'Game name cannot be a number' });
  }

  let gameToSave = null;

  const gameData = {
    name: req.body.name,
    status: req.body.status,
    owner: req.session.account._id,
    progress: req.body.progress,
    cover: req.body.cover,
  };

  // If the game already exists, update the data instead.
  return Game.GameModel.findOne({ name: req.body.name, owner: req.session.account._id },
    (err, game) => {
      if (game) {
        game.set(gameData);
        gameToSave = game;
      } else {
        gameToSave = new Game.GameModel(gameData);
      }

      const gamePromise = gameToSave.save();

      gamePromise.then(() => res.json({ redirect: '/games' }));

      gamePromise.catch((err2) => {
        if (err2.code === 11000) {
          return res.status(400).json({ error: 'Game already exists.' });
        }

        return res.status(400).json({ error: 'An error occured' });
      });

      return gamePromise;
    });
};

// Edit game data. It takes place separately to handle an error if the game isn't found
const editGame = (req, res) => {
  console.dir(req.body);

  if (!req.body.status) {
    return res.status(400).json({ error: 'Status is required. Stop messing with things' });
  }

  if ((req.body.status === 'In Progress' || req.body.status === 'Aiming for 100%')
  && !req.body.progress) {
    return res.status(400).json({ error: 'Progress is required if available' });
  }

  if (!isNaN(req.body.name)) {
    return res.status(400).json({ error: 'Game name cannot be a number' });
  }

  const gameData = {
    status: req.body.status,
    progress: req.body.progress,
  };

  let gameToSave = null;

  // If the game already exists, update the data instead.
  return Game.GameModel.findOne({ name: req.body.gameName }, (err, game) => {
    if (game) {
      game.set(gameData);
      gameToSave = game;
    } else {
      return res.status(404).json({ error: 'Game not found' });
    }

    const gamePromise = gameToSave.save();

    gamePromise.then(() => res.json({ redirect: '/games' }));

    gamePromise.catch((err2) => {
      console.log(err2);
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
  const req = request;
  const res = response;

  Game.GameModel.remove({ name: req.body.gameName, owner: req.session.account._id }, (err) => {
    console.dir(err);
    if (err) {
      return res.status(400).json({ error: 'An error occured while deleting the game' });
    }
    return res.status(200).json({ success: 'success' });
  });
};

const search = (request, response) => {
  const req = request;
  const res = response;
  console.dir(req.body);

  if (req.body.name !== '') {
    const client = igbd(igbdKey);

    client.games({
      field: 'name',
      limit: '10',
      search: req.body.name,
    }, [
      'name',
      'cover',
    ]).then(gamesRes => res.status(200).json({ games: gamesRes })).catch(() => {

    });
  }
};

module.exports.gamePage = gamePage;
module.exports.getGames = getGames;
module.exports.deleteGame = deleteGame;
module.exports.make = makeGame;
module.exports.editGame = editGame;
module.exports.search = search;

