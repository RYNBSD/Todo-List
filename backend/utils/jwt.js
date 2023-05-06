const { sign, verify } = require("jsonwebtoken");
const { JWT_SECRET } = require("../constants");

const signToken = (id) => {
  return sign({ id }, JWT_SECRET, {
    expiresIn: "7d"
  });
}

const verifyToken = (token) => {
  let payload = null;

  try {
    payload = verify(token, JWT_SECRET);
  }
  catch (e) {
    // payload = null;
  }

  return payload;
}

module.exports = {
  signToken,
  verifyToken,
}