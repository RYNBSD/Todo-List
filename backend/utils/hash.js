const { hashSync, compareSync, genSaltSync } = require("bcrypt");

const hashPassword = (password) => {
  return hashSync(password, genSaltSync(12));
}

const comparePassword = (password, hash) => {
  return compareSync(password, hash);
}

module.exports = {
  hashPassword,
  comparePassword,
}