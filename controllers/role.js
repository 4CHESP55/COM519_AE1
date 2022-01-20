const User = require("../models/User");
const Competency = require("../models/Competency");
const Role = require("../models/Role");

exports.list = async (req, res) => {
    try {
        const roles = await Role.aggregate([
            {
              $group: {
                _id: '$career', 
                role: {
                  $first: '$role'
                }, 
                competencies: {
                  $push: {
                    roleId: '$_id',
                    competency: '$competency', 
                    level: '$level'
                  }
                }
              }
            }, {
                '$sort': {
                  '_id': 1
                }
              }
          ]);


        res.render("roles", {
          page_name: 'Roles',
          user: req.user,
            roles: roles
        }

        );
    }catch (e) {
        res.status(404).send({ message: "could not list tastings" + e });
      }
};

exports.delete = async (req, res) => {
    const id = req.params.id;
  
    try {
  
      await Role.findByIdAndRemove(id);
      res.redirect("/roles");
    } catch (e) {
      res.status(404).send({
        message: `could not delete record ${id}.`,
      });
    }
  };

exports.edit = async (req, res) => {
    const id = req.params.id;
    try {
      const role = await Role.findById(id)
      res.render('update-role', { role: role, id: id, user: req.user, page_name: 'Roles' });
    } catch (e) {
      res.status(404).send({
        message: `could find role with career ${id}.`,
      });
    }
  };

  exports.update = async (req, res) => {
    const id = req.params.id;
    try {
      const role = await Role.findByIdAndUpdate(id, req.body);
      res.redirect('/roles/?message=role has been updated');
    } catch (e) {
      res.status(404).send({
        message: `could find role with career ${id}.`,
      });
    }
  };