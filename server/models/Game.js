const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const _ = require('underscore');

let GameModel = {};

const convertId = mongoose.Types.ObjectId;
const setName = (name) => _.escape(name).trim();

const GameSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    set: setName,
  },
  status: {
    type: String,
    required: true,
  },
  progress: {
    type: String,
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'Account',
  },
  createdData: {
    type: Date,
    default: Date.now,
  },
  cover: {
    type: String,
  }
});

GameSchema.statics.toAPI = (doc) => ({
  name: doc.name,
  status: doc.status,
  progress: doc.progress,
  cover: doc.cover,
});

GameSchema.statics.findByOwner = (ownerId, callback) => {
  const search = {
    owner: convertId(ownerId),
  };

  return GameModel.find(search).select('name status progress cover').exec(callback);
};

GameModel = mongoose.model('Game', GameSchema);

module.exports = {
  GameModel,
  GameSchema,
};
