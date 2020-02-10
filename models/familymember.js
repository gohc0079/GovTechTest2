const mongoose = require("mongoose")
const memberschema = new mongoose.Schema({
    Name: {
        type: String,
        required: true,
        trim: true
    },
    Gender: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            let array = ["male", "female", "m", "f"];
            if (!array.includes(value)) {
                throw Error("Invalid gender")
            }
        }

    },
    MaritalStatus: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            let array = ["single", "married", "divorce"];
            if (!array.includes(value)) {
                throw Error("Invalid status")
            }
        }
    },
    Spouse: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        trim: true,
        ref: 'FamilyMember'
    },
    OccupationType: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        validate(value) {
            let array = ["student", "unemployed", "employed"];
            if (!array.includes(value)) {
                throw Error("Invalid gender")
            }
        }
    },
    AnnualIncome: {
        type: Number,
        required: true,
        validate(value) {
            if (value < 0) {
                throw Error("Income cannot be negative")
            }
        }

    },
    DOB: {
        type: Date,
        required: true,
        trim: true
    },
    household_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Household'

    }


})


const FamilyMember = mongoose.model('FamilyMember', memberschema);

module.exports = FamilyMember