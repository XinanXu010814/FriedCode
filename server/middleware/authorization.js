const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = async (req, res, next) => {
  try {

    // Token should be given from header of request
    const jwtToken = req.header("token");

    // If not, respond with failure
    if (!jwtToken || jwtToken === "undefined") {
      return res.status(403).json("Not Authorized");
    }

    // Verify token
    const payload = jwt.verify(jwtToken, "${process.env.JWT_SECRET}");

    // Set uid in req for next use
    req.uid = payload.uid;

  } catch (error) {
    console.error(error.message);
    return res.status(403).json("Not Authorized");
  }

  next();
}