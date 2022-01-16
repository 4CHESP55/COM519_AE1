const User = require("../models/User");
const Competency = require("../models/Competency");
const Role = require("../models/Role");

exports.list = async (req, res) => {
    try {
        const roles = await Role.aggregate([
            {
              $group: {
                _id: '$career level', 
                role: {
                  $first: '$role'
                }, 
                competencies: {
                  $push: {
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
            roles: roles
        }

        );
    }catch (e) {
        res.status(404).send({ message: "could not list tastings" + e });
      }
};