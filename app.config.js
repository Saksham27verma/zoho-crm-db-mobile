// Load .env so EXPO_PUBLIC_* are available when running expo start
require("dotenv").config();

module.exports = ({ config }) => ({
  ...config,
  ...require("./app.json").expo,
});