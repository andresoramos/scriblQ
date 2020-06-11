const jwt = require("jsonwebtoken");
const config = require("config");

const generatePasswordResetToken = (info) => {
  const token = jwt.sign(
    {
      ...info,
    },
    config.get("jwtPrivateKey")
  );
  return token;
};

module.exports = generatePasswordResetToken;
