const Router = require("express").Router();
const { index } = require("../controllers/citizen");
Router.get("/citizens", index);

module.exports = Router;
