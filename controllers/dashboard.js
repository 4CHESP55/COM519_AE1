const User = require("../models/User");
const Competency = require("../models/Competency");
const Role = require("../models/Role");

exports.list = async (req, res) => {
    try {
        const user = req.user

        const competenciesId = [];
            user.competencies.forEach(competency => {
                competenciesId.push(competency._id);
            });
        const competencies = await Competency.find({ '_id': { $in: competenciesId } });

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

        const noMatch = [];
        const match = [];

        roles.forEach(role => {
            role.competencies.forEach(competency => {
                noMatch.push([role._id, competency.competency, competency.level])
                competencies.forEach(UserCompetency => {
                    if (competency.competency == UserCompetency.competency) {
                        if (competency.level == UserCompetency.level) {
                            match.push([role._id, competency.competency, competency.level])
                            noMatch.pop()
                        }
                        if (UserCompetency.level == 'Intermediate' && competency.level == 'Entry') {
                            match.push([role._id, competency.competency, competency.level])
                            noMatch.pop()
                        }
                        if (UserCompetency.level == 'Advanced' && competency.level == 'Entry') {
                            match.push([role._id, competency.competency, competency.level])
                            noMatch.pop()
                        }
                        if (UserCompetency.level == 'Advanced' && competency.level == 'Intermediate') {
                            match.push([role._id, competency.competency, competency.level])
                            noMatch.pop()
                        }
                        if (UserCompetency.level == 'Expert' && competency.level == 'Entry') {
                            match.push([role._id, competency.competency, competency.level])
                            noMatch.pop()
                        }
                        if (UserCompetency.level == 'Expert' && competency.level == 'Intermediate') {
                            match.push([role._id, competency.competency, competency.level])
                            noMatch.pop()
                        }
                        if (UserCompetency.level == 'Expert' && competency.level == 'Advanced') {
                            match.push([role._id, competency.competency, competency.level])
                            noMatch.pop()
                        }
                    }
                })
            })
        });

        const matchCount = {};
        for (var x = 0; x < match.length; x++) {
            matchCount[match[x][0]] = (matchCount[match[x][0]] || 0) + 1;
        }
        const noMatchCount = {};
        for (var x = 0; x < noMatch.length; x++) {
            noMatchCount[noMatch[x][0]] = (noMatchCount[noMatch[x][0]] || 0) + 1;
        }

        const matchLen = Object.keys(matchCount).map((key) => [(key), matchCount[key]]);
        const noMatchLen = Object.keys(noMatchCount).map((key) => [(key), noMatchCount[key]]);

        const currRole = matchLen.slice();

        for (var x = 0; x < matchLen.length; x++) {
            for (var x1 = 0; x1 < noMatchLen.length; x1++) {
                if (noMatchLen[x1][0] === matchLen[x][0]) {
                    currRole.splice(currRole.indexOf(matchLen[x]), 1)
                }
            }
        };

        const currRole1D = [];
        for (var x = 0; x < currRole.length; x++) {
            currRole1D.push(currRole[x][0])
        }

        const currRoleString = currRole1D.sort().reverse()[0]

        console.log(currRoleString)



        const competencyNames = [];
        const competencyLevels = [];
        const competencyColour = [];
        const competencySizes = [];
        var EntryC = 0;
        var IntermediateC = 0;
        var AdvancedC = 0;
        var ExpertC = 0;
        competencies.forEach(competency => {
            competencyNames.push(competency.competency)
            if (competency.level == "Entry") {
                EntryC = EntryC + 1
            } else if (competency.level == "Intermediate") {
                IntermediateC = IntermediateC + 1
            } else if (competency.level == "Advanced") {
                AdvancedC = AdvancedC + 1
            } else if (competency.level == "Expert") {
                ExpertC = ExpertC + 1
            }
        }
        );

        if (EntryC != 0) {
            competencySizes.push(EntryC)
            competencyColour.push("rgb(255, 255, 0)/")
            competencyLevels.push("Entry")
        }
        if (IntermediateC != 0) {
            competencySizes.push(IntermediateC)
            competencyColour.push("rgb(205, 127, 50)/")
            competencyLevels.push("Intermediate")
        }
        if (AdvancedC != 0) {
            competencySizes.push(AdvancedC)
            competencyColour.push("rgb(192, 192, 192)/")
            competencyLevels.push("Advanced")
        }
        if (ExpertC != 0) {
            competencySizes.push(ExpertC)
            competencyColour.push("rgb(255, 215, 0)/")
            competencyLevels.push("Expert")
        }
        competencyColour.push(" ")

        res.render("dashboard", {
            page_name: 'Dashboard',
            user: req.user,
            matchLen: matchLen,
            noMatchLen: noMatchLen,
            currRoleString: currRoleString,
            match: match,
            noMatch: noMatch,
            competencies: competencies,
            competencyNames: competencyNames,
            competencyColour: competencyColour,
            competencySizes: competencySizes,
            competencyLevels: competencyLevels
        }

        );
    }catch (e) {
        res.status(404).send({ message: "could not list competencies" });
    }
};

exports.edit = async (req, res) => {
    try {
        const user = req.user

        const competenciesId = [];
            user.competencies.forEach(competency => {
                competenciesId.push(competency._id);
            });
        const competencies = await Competency.find({ '_id': { $in: competenciesId } });

        res.render("dashboard-edit", {
            page_name: 'Dashboard',
            user: req.user,
            competencies: competencies
        });
    }catch (e) {
        res.status(404).send({ message: "could not list competencies" });
    }
};

exports.delete = async (req, res) => {
  
    try {
        const id = req.params.id;
        const user = req.user

        await User.updateOne( {  _id: user._id}, { $pull : { competencies : { _id :  id } } } );
  
         res.redirect("/dashboard/edit");
    } catch (e) {
      res.status(404).send({
        message: `could not remove competency ${id}.`,
      });
    }
  };

exports.add = async (req, res) => {
    try {
        const competencies = await Competency.find({}).sort({competency: 1});
        res.render("dashboard-add", {
            page_name: 'Dashboard',
            user: req.user,
            competencies: competencies
        });
    }catch (e) {
        res.status(404).send({ message: "could not list competencies" });
    }
};

exports.save = async (req, res) => {
    try {
        const user = req.user
        const id = req.body.id;
        await User.updateOne( {  _id: user._id}, { $push : { competencies : { _id :  id } } } );
         res.redirect("/dashboard/edit");
    }catch (e) {
        res.status(404).send({ message: "could not add competency" });
    }
};