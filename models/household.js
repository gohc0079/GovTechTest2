const mongoose = require("mongoose")
const householdschema = new mongoose.Schema({
    HousingType: {
        type: String,
        required: true
    }
})

householdschema.virtual('familymembers', {
    ref: 'FamilyMember',
    localField: '_id',
    //id is referencing the owner property in task which is also an objectID
    foreignField: 'owner'
})

householdschema.virtual('familymembers', {
    ref: 'FamilyMember',
    localField: '_id',
    foreignField: 'household_id'
})

const Household = mongoose.model('Household', householdschema);

module.exports = Household