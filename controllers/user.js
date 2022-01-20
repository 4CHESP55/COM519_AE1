const User = require("../models/User");
const bcrypt = require('bcrypt');

exports.create = async (req, res) => {

    try {
      const user = new User({ firstName: req.body.firstName, lastName: req.body.lastName, email: req.body.email, password: req.body.password });
      await user.save();
      req.flash('success_msg','You have now registered!')
      res.redirect('/login')
    } catch (e) {
      if (e.errors) {
        console.log(e.errors);
        req.flash('error_msg', e.errors)
        res.render('register', {page_name: 'Register'})
        return;
      }
      return res.status(400).send({
        message: JSON.parse(e),
      });
    }
  }