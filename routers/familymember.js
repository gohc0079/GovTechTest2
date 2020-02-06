const express = require("express");
const router = express.Router();
const FamilyMember = require("../models/familymember");
const Household = require("../models/household");
const moment = require("moment");
router.post("/familymember/:household_id", async (req, res) => {
  const household_id = req.params.household_id;
  const familymember = new FamilyMember({
    ...req.body,
    household_id
  });
  try {
    await familymember.save();
    res.status(201).send({
      familymember
    });
  } catch (e) {
    console.log(e);
  }
});

router.get("/households", async (req, res) => {
  // Household.find().populate({
  //     path: "familymembers"
  // }).exec().then(households => {
  //     res.status(200).json({
  //         temp: households.map(({
  //             _id,
  //             HousingType,
  //             familymembers
  //         }) => {
  //             return {
  //                 _id,
  //                 HousingType,
  //                 familymembers,
  //             }
  //         })
  //     })
  // })
  const households = await Household.find()
    .populate({
      path: "familymembers"
    })
    .exec();

  res.status(200).json({
    list: households.map(({ _id, HousingType, familymembers }) => {
      return {
        _id,
        HousingType,
        familymembers
      };
    })
  });
});

router.get("/household/:id", async (req, res) => {
  const household = await Household.findById(req.params.id);
  await household
    .populate({
      path: "familymembers"
    })
    .execPopulate();
  const { HousingType, familymembers } = household;
  res.send({
    HousingType,
    familymembers
  });
});

router.get("/disbursement", async (req, res) => {
  const queryObj = req.query;
  const members = await FamilyMember.find({});
  const selectedMember = members.filter(member => {
    const age = parseInt(moment(member.DOB).fromNow());
    return age > 50;
  });
  console.log(selectedMember);

  res.json({
      
  })
});
module.exports = router;
