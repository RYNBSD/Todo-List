const { comparePassword, hashPassword } = require("./hash");
const { signToken, verifyToken } = require("./jwt");

function escape(str) {
  return str.replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#39;"); 
}

module.exports = {
  comparePassword,
  hashPassword,
  signToken,
  verifyToken,
  escape,
}