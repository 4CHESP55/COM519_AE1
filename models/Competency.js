const mongoose = require("mongoose");
const { Schema } = mongoose;

const competencySchema = new Schema(
    {
        competency: String,
        description: String,
        level: String,
        indicator: String,
        roles:
            [{
                _id: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Role"
                }
            }]
    },
    { timestamps: true }
);

module.exports = mongoose.model("Competency", competencySchema);