const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcrypt = require('bcrypt');

const userSchema = new Schema(
    {
        'firstName': String,
        'lastName': String,
        email: { type: String, required: [true, 'email is required'], unique: true },
        password: { type: String, required: [true, 'password is required'] },
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

userSchema.pre('save', async function (next) {
    try {
        const hash = await bcrypt.hash(this.password, 10);
        this.password = hash;
        next();
    } catch (e) {
        throw Error('could not hash password');
    }
});

userSchema.pre('insertMany', async function (next) {
    try {
        const hash = await bcrypt.hash(this.password, 10);
        this.password = hash;
        next();
    } catch (e) {
        throw Error('could not hash password');
    }
});

module.exports = mongoose.model("User", userSchema);