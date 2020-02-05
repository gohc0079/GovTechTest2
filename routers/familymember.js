const express = require("express");
const router = express.Router();
const FamilyMember = require("../models/familymember")
const Household = require('../models/household')
router.post('/familymember/:household_id', async (req, res) => {
    const household_id = req.params.household_id
    const familymember = new FamilyMember({
        ...req.body,
        household_id
    })
    try {
        await familymember.save();
        res.status(201).send({
            familymember
        })
    } catch (e) {
        console.log(e)
    }
})

const generateHouseHoldObject = (HousingType, familyArr) => {
    return {
        HousingType,
        familyArr
    }

}
router.get('/households', async (req, res) => {
    const households = await Household.find({})
    const householdsArr = []
    households.forEach(async ({
        _id,
        HousingType
    }) => {
        const familymembers = await FamilyMember.find({
            household_id: _id
        })


        householdsArr.push(generateHouseHoldObject(HousingType, familymembers))

        console.log(householdsArr.toString())

    })

    res.send(JSON.stringify(householdsArr))

})


router.get('/household/:id', async (req, res) => {
    try {
        const household = await Household.findById(req.params.id)
        const {
            HousingType
        } = household
        const familymembers = await FamilyMember.find({
            household_id: req.params.id
        })
        res.send({
            HousingType,
            familymembers
        })
    } catch (e) {
        res.status(404).send({
            "error": e
        })
    }
})
module.exports = router