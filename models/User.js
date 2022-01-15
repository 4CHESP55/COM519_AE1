const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema(
    {
       'first name': String,
       'last name': String,
       email: String,
       competencies: 
       [{
            _id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Competency"
            }
        }] 
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);