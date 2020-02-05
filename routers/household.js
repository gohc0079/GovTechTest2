const express = require('express')
const router = express.Router();
const Household = require('../models/household')

router.post('/households', async (req, res) => {
    const household = new Household(req.body)
    try {
        await household.save();
        res.send({
            household
        })
    } catch (e) {
        res.status(404).send({
            "error": "Household Item not saved"
        })
    }
})



module.exports = router