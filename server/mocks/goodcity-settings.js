module.exports = function(app) {
  var express = require("express");
  var goodcitySettingsRouter = express.Router();

  var goodcity_settings_json = {
    goodcity_settings: [
      {
        id: 1,
        key: "app.allow_in_app_van_booking",
        value: "TRUE",
        description: "Allow or disable in-app van booking with true/false"
      }
    ]
  };

  goodcitySettingsRouter.get("/", function(req, res) {
    res.send(goodcity_settings_json);
  });

  app.use("/api/v1/goodcity_settings", goodcitySettingsRouter);
};
