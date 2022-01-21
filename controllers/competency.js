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
    } catch (e) {
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
    } catch (e) {
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
    } catch (e) {
        res.status(404).send({ message: "could not list competency" });
    }
};

exports.save = async (req, res) => {
    const id = req.body.id
    try {
        const competency = await Competency.findByIdAndUpdate(id, req.body);
        req.flash('success_msg', 'Role has been updated')
        res.redirect('/competencies/edit/' + req.body.competency);

    } catch (e) {
        res.status(404).send({ message: "could not update competency" });
    }
};

exports.roleAdd = async (req, res) => {
    const id = req.params.id
    try {
        const role = new Role({ career: req.body.career, role: req.body.role, competency: req.body.competency, level: req.body.level });
        await role.save();
        await Competency.updateOne({ _id: id }, { $push: { roles: { _id: role._id } } });
        req.flash('success_msg', 'Role has been updated')
        res.redirect('/competencies/edit/' + req.body.competency);
    } catch (e) {
        res.status(404).send({ message: "could not list competency" });
    }
};

exports.roleDelete = async (req, res) => {
    const id = req.params.id
    try {
        await Competency.updateOne({ _id: id }, { $pull: { roles: { _id: req.body.roleId } } });
        req.flash('success_msg', 'Role has been updated')
        res.redirect('/competencies/edit/' + req.body.competency);
    } catch (e) {
        res.status(404).send({ message: "could not list competency" });
    }
};

exports.delete = async (req, res) => {
    try {
        await Competency.deleteMany({ competency: req.body.id });
        req.flash('success_msg', 'Competency has been deleted')
        res.redirect("/competencies");
    } catch (e) {
        res.status(404).send({
            message: `could not delete Competency ${id}.`,
        });
    }
};

exports.add = async (req, res) => {
    try {
        const competency = new Competency({ competency: req.body.competency, description: req.body.description, level: req.body.level, indicator: req.body.indicator });
        await competency.save();
        req.flash('success_msg', 'competency has been added')
        res.redirect('/competencies');
    } catch (e) {
        res.status(404).send({ message: "could add competency" });
    }
};