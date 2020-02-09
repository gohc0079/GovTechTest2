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
      res.json({
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
      res.json({
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
    res.json({
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
  } else if (req.query.age == "16" && req.query.totalincome == "150000" && req.query.occupation == "student") {
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
          return family.household_id == String(doc._id) && age > date && family.OccupationType == req.query.occupation;
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
    }]).exec((e, r) => {
      r.forEach((family, i) => {
        if (family.result.length > 0) {
          const husbandarr = allFamilies.filter(member => {
            return member.Spouse && family._id == String(member.household_id) && member.MaritalStatus !== "divorce";
          });
          family.result.push(...husbandarr);
          husbandarr.forEach(husband => {
            const wife = allFamilies.find(member => {
              return member._id == String(husband.Spouse) && member.MaritalStatus !== "divorce";
            });
            family.result.push(wife);
          });
        }
      });
      selectedFamilies = r.filter(data => {
        return data.result.length > 2;
      });

      res.json({
        list: selectedFamilies.map(({
          _id,
          HousingType,
          result
        }) => {
          return {
            _id,
            HousingType,
            result
          };
        })
      });
    });
  }
});

module.exports = router;