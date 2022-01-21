const mongoose = require("mongoose");
const { Schema } = mongoose;

const roleSchema = new Schema(
    {
        career: String,
        role: String,
        competency: String,
        level: String
    },
    { timestamps: true }
);

module.exports = mongoose.model("Role", roleSchema);