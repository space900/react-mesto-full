const mongoose = require('mongoose');
const isURL = require('validator/lib/isURL');
const messages = require('../errors/messages');

const cardValidity = /^(http:\/\/|https:\/\/w*\w)/;

const cardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
  },
  link: {
    type: String,
    required: true,
    validate: {
      validator: (v) => {
        cardValidity.test(v);
        const isValid = isURL(v);
        return isValid;
      },
      message: messages.BAD_URL_VALID,
    },
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  likes: {
    type: Array,
    ref: 'user',
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
},
{ versionKey: false });

module.exports = mongoose.model('card', cardSchema);
