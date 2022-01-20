require("dotenv").config();

const mongoose = require("mongoose");
const express = require("express");
const path = require("path");
const chalk = require("chalk");
const bodyParser = require("body-parser");
const { PORT, MONGODB_URI } = process.env;
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
require("./config/passport")(passport)
const {ensureAuthenticated} = require("./config/auth.js")

const dashboardController = require("./controllers/dashboard");
const rolesController = require("./controllers/role");
const userController = require("./controllers/user");
const competencyController = require("./controllers/competency");

const app = express();
app.set("view engine", "ejs");

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
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

//express session
app.use(session({
    secret : 'secret',
    resave : true,
    saveUninitialized : true
   }));

   app.use(passport.initialize());
app.use(passport.session());
   //use flash
app.use(flash());
app.use((req,res,next)=> {
     res.locals.success_msg = req.flash('success_msg');
     res.locals.error_msg = req.flash('error_msg');
     res.locals.error  = req.flash('error');
   next();
   })

app.get("/", (req, res) => {
    res.render("index", { errors: {}, user: req.user, page_name: 'Home'});
  });

  app.get("/login", (req, res) => {
    res.render("login", { errors: {}, page_name: 'Login' });
  });

  app.get("/logout", (req, res) => {
    req.logout();
req.flash('success_msg','Now logged out');
res.redirect('/login');
  });

  app.post("/login", (req, res, next) => {
    passport.authenticate('local',{
        successRedirect : '/dashboard',
        failureRedirect : '/login',
        failureFlash : true,
        })(req,res,next);

  });
  app.get("/register", (req, res) => {
    res.render("register", { errors: {}, page_name: 'Register' });
  });
  app.post("/register", userController.create);

  app.get("/dashboard",ensureAuthenticated, dashboardController.list);
  app.get("/dashboard/edit",ensureAuthenticated, dashboardController.edit);
  app.get("/dashboard/add",ensureAuthenticated, dashboardController.add);
  app.post("/dashboard/add",ensureAuthenticated, dashboardController.save);
  app.get("/dashboard/delete/:id",ensureAuthenticated, dashboardController.delete);
  app.get("/competencies",ensureAuthenticated, competencyController.list);
  app.get("/competencies/view/:id",ensureAuthenticated, competencyController.view);
  app.get("/competencies/edit/:id",ensureAuthenticated, competencyController.edit);
  app.post("/competencies/edit/:id",ensureAuthenticated, competencyController.save);
  app.post("/competencies/role/delete/:id",ensureAuthenticated, competencyController.roleDelete);
  app.post("/competencies/role/add/:id",ensureAuthenticated, competencyController.roleAdd);
  app.get("/roles",ensureAuthenticated, rolesController.list);
  app.get("/roles/delete/:id",ensureAuthenticated, rolesController.delete);

  app.get("/update-role/:id",ensureAuthenticated, rolesController.edit);
  app.post("/update-role/:id",ensureAuthenticated, rolesController.update);

app.listen(PORT, () => {
    console.log(
      `Example app listening at http://localhost:${PORT}`,
      chalk.green("✓")
    );
  });