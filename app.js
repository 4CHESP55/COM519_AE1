require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const path = require("path");
const chalk = require("chalk");
const bodyParser = require("body-parser");
const { PORT, MONGODB_URI } = process.env;

const app = express();
app.set("view engine", "ejs");

mongoose.connect(MONGODB_URI, { useNewUrlParser: true });
mongoose.connection.on("error", (err) => {
  console.error(err);
  console.log(
    "MongoDB connection error. Please make sure MongoDB is running.",
    chalk.red("✗")
  );
  process.exit();
});

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", (req, res) => {
    res.render("index", { errors: {} });
  });


app.listen(PORT, () => {
    console.log(
      `Example app listening at http://localhost:${PORT}`,
      chalk.green("✓")
    );
  });