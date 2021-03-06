const express = require("express");
const router = express.Router();
const FamilyMember = require("../models/familymember");
const Household = require("../models/household");
const moment = require("moment");
const {
  generateandPushArrObject,
  jsonObject
} = require("../utils/reusables");

router.post("/households", async (req, res) => {
  const household = new Household(req.body);
  try {
    await household.save();
    res.send({
      household
    });
  } catch (e) {
    res.status(404).send({
      error: "Household Item not saved"
    });
  }
});

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

  res.send({
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

router.put("/familymember/:id", async (req, res) => {
  try {
    const Spouse = req.params.id;
    const body = req.body;
    const found = await FamilyMember.findById(Spouse);
    const partner = await FamilyMember.findById(body.Spouse)
    partner["Spouse"] = Spouse
    Object.assign(found, body);
    const result = await found.save();
    const otherhalf = await partner.save()
    res.send({
      result,
      otherhalf
    });
  } catch (e) {
    res.send({
      error: e
    });
  }
});

router.get("/disbursement", async (req, res) => {
  const allFamilies = await FamilyMember.find();
  let selectedFamilies = [];

  if (req.query.age == "50") {
    const date = moment()
      .subtract(parseInt(req.query.age), "years")
      .toISOString();
    Household.aggregate([{
      $lookup: {
        from: "familymembers",
        let: {
          id: "$_id"
        },
        pipeline: [{
          $match: {
            $expr: {
              $and: [{
                  $eq: ["$$id", "$household_id"]
                },
                {
                  $lt: ["$DOB", new Date(date)]
                }
              ]
            }
          }
        }],
        as: "result"
      }
    }]).exec((e, result) => {
      const ElderBonus = result.filter(item => {
        return item.result.length > 0;
      });
      res.send({
        ElderBonus
      });
    });
  } else if (req.query.age == "5") {
    const date = moment()
      .subtract(5, "years")
      .toISOString();
    Household.aggregate([{
      $lookup: {
        from: "familymembers",
        let: {
          id: "$_id"
        },
        pipeline: [{
          $match: {
            $expr: {
              $and: [{
                  $eq: ["$$id", "$household_id"]
                },
                {
                  $gt: ["$DOB", new Date(date)]
                }
              ]
            }
          }
        }],
        as: "result"
      }
    }]).exec((e, result) => {
      const BabySunshineGrant = result.filter(item => {
        return item.result.length > 0;
      });
      res.send({
        BabySunshineGrant
      });
    });
  } else if (req.query.totalincome == "100000") {
    const households = await Household.find()
      .populate({
        path: "familymembers"
      })
      .exec();
    let initialIncome = 0;
    const selectedFamilies = households.filter(household => {
      const sum = household.familymembers.reduce((total, household) => {
        return total + household.AnnualIncome;
      }, initialIncome);

      return sum < 100000 && household.familymembers.length > 0;
    });
    res.send({
      YOLOGSTGrant: selectedFamilies.map(
        ({
          _id,
          HousingType,
          familymembers
        }) => {
          return {
            _id,
            HousingType,
            familymembers
          };
        }
      )
    });
  } else if (
    req.query.age == "16" &&
    req.query.totalincome == "150000" &&
    req.query.occupation == "student"
  ) {
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
          return (
            family.household_id == String(doc._id) &&
            age > date &&
            family.OccupationType == req.query.occupation
          );
        });
        generateandPushArrObject(doc._id, data, array);
      });
      res.send(jsonObject(array));
    });
  } else if (req.query.age == "18" && req.query.status == "married") {
    const date = moment()
      .subtract(18, "years")
      .toISOString();
    Household.aggregate([{
      $lookup: {
        from: "familymembers",
        let: {
          id: "$_id"
        },
        pipeline: [{
          $match: {
            $expr: {
              $and: [{
                  $eq: ["$$id", "$household_id"]
                },
                {
                  $or: [{
                      $gt: ["$DOB", new Date(date)]
                    },
                    {
                      $and: [{
                          $gt: ["$Spouse", null]
                        },
                        {
                          $eq: ["$MaritalStatus", "married"]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          }
        }],
        as: "result"
      }
    }]).exec((e, r) => {
      selectedFamilies = r.filter(family => {
        const couple = family.result.filter(item => {
          return item.Spouse;
        });
        const chilren = family.result.filter(item => {
          return !couple.includes(item);
        });
        return (couple.length > 1) & (couple.length % 2 == 0) & (chilren.length > 0);
      });
      res.send({
        FamilyTogetherness: selectedFamilies.map(
          ({
            _id,
            HousingType,
            result
          }) => {
            return {
              _id,
              HousingType,
              result
            };
          }
        )
      });
    });
  }
});

module.exports = router;