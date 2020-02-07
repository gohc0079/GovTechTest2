const express = require("express");
const router = express.Router();
const FamilyMember = require("../models/familymember");
const Household = require("../models/household");
const moment = require("moment");
const {
  generateandPushArrObject,
  jsonObject,
  groupBy
} = require("../utils/reusables")
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
  const households = await Household.find()
    .populate({
      path: "familymembers"
    })
    .exec();

  res.status(200).json({
    list: households.map(({
      _id,
      HousingType,
      familymembers
    }) => {
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
  const {
    HousingType,
    familymembers
  } = household;
  res.send({
    HousingType,
    familymembers
  });
});

router.get("/disbursement", async (req, res) => {
  const allFamilies = await FamilyMember.find();
  let selectedFamilies = [];
  const groupByID = groupBy("household_id");
  if (req.query.age == "50") {
    const date = moment()
      .subtract(50, "years")
      .toISOString();
    selectedFamilies = await FamilyMember.find({
      DOB: {
        $lt: date
      }
    })
    const grouped = groupByID(selectedFamilies);
    res.send({
      ElderBonus: grouped
    });

  } else if (req.query.age == "5") {
    const date = moment()
      .subtract(5, "years")
      .toISOString();

    selectedFamilies = await FamilyMember.find({
      DOB: {
        $gt: date
      }
    })
    const grouped = groupByID(selectedFamilies);
    res.send({
      BabySunshineGrant: grouped
    });

  } else if (req.query.totalincome == "100000") {
    FamilyMember.aggregate([{
        $group: {
          _id: "$household_id",
          totalincome: {
            $sum: "$AnnualIncome"
          }
        }
      },
      {
        $match: {
          totalincome: {
            $lt: parseInt(req.query.totalincome)
          }
        }
      }
    ]).exec((e, r) => {
      let array = [];
      r.forEach(doc => {
        const data = allFamilies.filter(family => {
          return family.household_id == String(doc._id);
        });
        generateandPushArrObject(doc._id, doc.totalincome, data, array)
      });
      res.json(jsonObject(array));
    });
  } else if (req.query.age == "16" && req.query.totalincome == "150000") {
    const date = moment()
      .subtract(16, "years")
      .toISOString();
    FamilyMember.aggregate([{
        $group: {
          _id: "$household_id",
          totalincome: {
            $sum: "$AnnualIncome"
          }
        }
      }, {
        $match: {
          totalincome: {
            $lt: parseInt(req.query.totalincome)
          }

        }
      }

    ]).exec((e, r) => {
      let array = [];
      r.forEach((doc) => {
        const data = allFamilies.filter(family => {
          const age = moment(family.DOB).toISOString()
          return (family.household_id == String(doc._id) && age > date)
        });
        generateandPushArrObject(doc._id, doc.totalincome, data, array)
      })
      res.json(jsonObject(array));

    })

  }



});

module.exports = router;