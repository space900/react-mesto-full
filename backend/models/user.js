const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
// const validator = require('validator');
const isEmail = require('validator/lib/isEmail');
const isURL = require('validator/lib/isURL');
const isStrongPassword = require('validator/lib/isStrongPassword');
const messages = require('../errors/messages');
const { UnauthorizedError } = require('../errors/classes/unauthorizedError');

const avatarValidity = /^(http:\/\/|https:\/\/w*\w)/;

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false,
    minlength: 2,
    maxlength: 30,
    default: 'Жак-Ив Кусто',
  },
  about: {
    type: String,
    required: false,
    minlength: 2,
    maxlength: 30,
    default: 'Исследователь',
  },
  avatar: {
    type: String,
    required: false,
    default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
    validate: {
      validator: (v) => {
        avatarValidity.test(v);
        const isValid = isURL(v);
        return isValid;
      },
      message: messages.BAD_URL_VALID,
    },
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (v) => {
        const isValid = isEmail(v);
        return isValid;
      },
      message: messages.BAD_EMAIL_VALID,
    },
  },
  password: {
    type: String,
    required: true,
    select: false,
    minlength: 8,
    validate: {
      validator: (v) => {
        const isValid = isStrongPassword(v);
        return isValid;
      },
      message: messages.TOO_EASY_PASSWORD,
    },
  },
},
{ versionKey: false });

// eslint-disable-next-line func-names
userSchema.statics.findUserByCredentials = function (email, password) {
  return this.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(new UnauthorizedError(messages.UNAUTH_REQUEST_DATA));
      }
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            return Promise.reject(new UnauthorizedError(messages.UNAUTH_REQUEST_DATA));
          }
          return user;
        });
    });
};

module.exports = mongoose.model('user', userSchema);
