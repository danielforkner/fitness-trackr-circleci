require("dotenv").config()
const express = require("express")
const app = express();
const morgan = require("morgan");
const cors = require("cors");
const chalk = require("chalk")


app.use(express.json());
app.use(morgan("dev"))

app.use(cors());

app.use((req, res, next) => {
    console.log(chalk.red.underline("<____Body Logger START____>"));
    console.log(chalk.magenta(JSON.stringify(req.body)));
    console.log(chalk.blue.underline("<____Body Logger END_____>"));
  
    next();
  });

  const apiRouter = require("./api");
  
  
  
  app.use("/api", apiRouter);

  // eslint-disable-next-line no-unused-vars


  app.use((req, res) => {
    res.status(404).send(
      {success: false , message: "Request failed with status 404"} 
    );
  });
  
  app.use((req, res) => {
    res
      .status(500)
      .send(
        {success: false, message: "Request failed with status 500" }
      );
  });
  
module.exports = app;
