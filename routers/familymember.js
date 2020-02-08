const express = require("express");
const router = express.Router();
const FamilyMember = require("../models/familymember");
const Household = require("../models/household");
const moment = require("moment");
const {
  generateandPushArrObject,
  jsonObject,
  groupBy
} = require("../utils/reusables");
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
      .subtract(parseInt(req.query.age), "years")
      .toISOString();
    Household.aggregate([{
      $lookup: {
        from: 'familymembers',
        let: {
          id: "$_id"
        },
        pipeline: [{
          $match: {
            $expr: {
              $and: [{
                $eq: ["$$id", "$household_id"]
              }, {
                $lt: ["$DOB", new Date(date)]
              }]
            }
          }
        }],
        as: "result"
      }
    }]).exec((e, result) => {

      const ElderBonus = result.filter(item => {
        return item.result.length > 0
      })
      res.json({
        ElderBonus
      })


    })

  } else if (req.query.age == "5") {
    const date = moment()
      .subtract(5, "years")
      .toISOString();
    Household.aggregate([{
      $lookup: {
        from: 'familymembers',
        let: {
          id: "$_id"
        },
        pipeline: [{
          $match: {
            $expr: {
              $and: [{
                $eq: ["$$id", "$household_id"]
              }, {
                $gt: ["$DOB", new Date(date)]
              }]
            }
          }
        }],
        as: "result"
      }
    }]).exec((e, result) => {
      const BabySunshineGrant = result.filter(item => {
        return item.result.length > 0
      })
      res.json({
        BabySunshineGrant
      })
    })

  } else if (req.query.totalincome == "100000") {
    const households = await Household.find()
      .populate({
        path: "familymembers"
      })
      .exec();
    let initialIncome = 0
    const selectedFamilies = households.filter(household => {
      const sum = household.familymembers.reduce((total, household) => {
        return total + household.AnnualIncome
      }, initialIncome)

      return sum < 100000 && household.familymembers.length > 0

    })
    res.json({
      YOLOGSTGrant: selectedFamilies.map(({
        _id,
        HousingType,
        familymembers
      }) => {
        return {
          _id,
          HousingType,
          familymembers
        }
      })
    })
  } else if (req.query.age == "16" && req.query.totalincome == "150000") {
    const date = moment()
      .subtract(parseInt(req.query.age), "years")
      .toISOString();
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
          const age = moment(family.DOB).toISOString();
          return family.household_id == String(doc._id) && age > date;
        });
        generateandPushArrObject(doc._id, data, array);
      });
      res.json(jsonObject(array));
    });
  } else if (req.query.age == "18" && req.query.spouse == "true") {
    const date = moment()
      .subtract(18, "years")
      .toISOString();
    Household.aggregate([{
      $lookup: {
        from: "familymembers",
        localField: "_id",
        foreignField: "household_id",
        as: "families"
      }

    }]).exec((e, r) => {
      let array = []
      r.forEach((family) => {
        const firstCond = family.families.filter(data => {
          const age = moment(data.DOB).toISOString()
          return age > date || data.Spouse

        })
        firstCond.forEach((result) => {
          if (result.Spouse) {

            const found = family.families.find((member) => {
              return member._id == String(result.Spouse)


            })
            firstCond.push(found)
          }
        })

        if (firstCond.length > 2) {
          generateandPushArrObject(family._id, firstCond, array)

        }

      })

      res.json(jsonObject(array))
    })
  }
});

module.exports = router;