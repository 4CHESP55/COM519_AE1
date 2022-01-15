const User = require("../models/User");
const Competency = require("../models/Competency");
const Role = require("../models/Role");

exports.list = async (req, res) => {
    try {
        const users = await User.find({});
        
        const competenciesId = [];
        users.forEach(user => {
            user.competencies.forEach(competency => {
                competenciesId.push(competency._id);
            });
        });
        const competencies = await Competency.find({'_id': { $in: competenciesId }});

        const competencyNames = [];
        const competencyLevels = [];
        const competencyColour = [];
        const competencySizes = [];
        var EntryC = 0;
        var IntermediateC = 0;
        var AdvancedC = 0;
        var ExpertC = 0;
        competencies.forEach(competency =>{
            competencyNames.push(competency.competency)
            if (competency.level == "Entry") {
                EntryC = EntryC + 1
            } else if (competency.level == "Intermediate"){
                IntermediateC = IntermediateC + 1
            } else if (competency.level == "Advanced") {
                AdvancedC = AdvancedC + 1
            } else if (competency.level == "Expert"){
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
            user: users,
            competencies: competencies,
            competencyNames: competencyNames,
            competencyColour: competencyColour,
            competencySizes: competencySizes,
            competencyLevels: competencyLevels
        }

        );
    }catch (e) {
        res.status(404).send({ message: "could not list tastings" });
      }
};