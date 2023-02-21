const jwt = require("jsonwebtoken");
require("dotenv").config();

function jwtGenerator(uid) {
  const payload = {
    uid: uid
  };

  return jwt.sign(payload, "${process.env.JWT_SECRET}", {expiresIn: "90d"});
}

module.exports = jwtGenerator;