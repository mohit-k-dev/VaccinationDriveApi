const Router = require("express").Router();
const { citizens, greet } = require("../controllers");
Router.get("/citizens", citizens);
Router.get("/", greet);

module.exports = Router;
