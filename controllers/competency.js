const Competency = require("../models/Competency");
const Role = require("../models/Role");

exports.list = async (req, res) => {
    try {
        const competencies = await Competency.aggregate(
            [
                {
                  '$lookup': {
                    'from': 'roles', 
                    'localField': 'roles._id', 
                    'foreignField': '_id', 
                    'as': 'roles'
                  }
                }, {
                  '$group': {
                    '_id': '$competency', 
                    'description': {
                      '$first': '$description'
                    }, 
                    'levels': {
                      '$push': {
                        '_id': '$_id', 
                        'level': '$level', 
                        'indicator': '$indicator', 
                        'roles': '$roles'
                      }
                    }
                  }
                }
              ]
        );
        
        res.render("competencies", {
            page_name: 'Competencies',
            user: req.user,
            competencies: competencies
        }

        );
    }catch (e) {
        res.status(404).send({ message: "could not list tastings" });
      }
};

exports.view = async (req, res) => {
    const id = req.params.id
    try {
        const competency = await Competency.aggregate(
            [
                {
                  '$lookup': {
                    'from': 'roles', 
                    'localField': 'roles._id', 
                    'foreignField': '_id', 
                    'as': 'roles'
                  }
                }, {
                  '$group': {
                    '_id': '$competency', 
                    'description': {
                      '$first': '$description'
                    }, 
                    'levels': {
                      '$push': {
                        '_id': '$_id', 
                        'level': '$level', 
                        'indicator': '$indicator', 
                        'roles': '$roles'
                      }
                    }
                  }
                }, {
                  '$match': {
                    '_id': id
                  }
                }
              ]
        );
        
        res.render("competencies-view", {
            page_name: 'Competencies',
            user: req.user,
            competency: competency
        }

        );
    }catch (e) {
        res.status(404).send({ message: "could not list tastings" });
      }
};

exports.edit = async (req, res) => {
    const id = req.params.id
    try {
        const competencies = await Competency.find({ competency: id });
        const roles = await Role.find({ competency: id });
        res.render("competencies-edit", {
            page_name: 'Competencies',
            user: req.user,
            competencies: competencies,
            roles: roles
        }

        );
    }catch (e) {
        res.status(404).send({ message: "could not list competency" });
      }
};

exports.save = async (req, res) => {
    const id = req.body.id
    try {
        const competency = await Competency.findByIdAndUpdate(id, req.body);
        res.redirect('/competencies/edit/'+req.body.competency+'?message=role has been updated');

    }catch (e) {
        res.status(404).send({ message: "could not update competency" });
      }
};

exports.roleAdd = async (req, res) => {
    const id = req.params.id
    try {
        const role = new Role({ career: req.body.career, role: req.body.role, competency: req.body.competency, level: req.body.level });
        await role.save();
        await Competency.updateOne( {  _id: id}, { $push : { roles : { _id :  role._id } } } );
        res.redirect('/competencies/edit/'+req.body.competency+'?message=role has been updated');
    }catch (e) {
        res.status(404).send({ message: "could not list competency" });
      }
};

exports.roleDelete = async (req, res) => {
    const id = req.params.id
    try {
        await Competency.updateOne( {  _id: id}, { $pull : { roles : { _id :  req.body.roleId } } } );
        res.redirect('/competencies/edit/'+req.body.competency+'?message=role has been updated');
    }catch (e) {
        res.status(404).send({ message: "could not list competency" });
      }
};