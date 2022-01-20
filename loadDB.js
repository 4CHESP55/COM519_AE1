
const { MongoClient } = require("mongodb");
require("dotenv").config();
const fs = require("fs").promises;
const path = require("path");
const loading = require("loading-cli");
const { MONGODB_PRODUCTION_URI, MONGODB_URI } = process.env;
const bcrypt = require('bcrypt');


/**
 * constants
 */
 const client = new MongoClient(
  process.env.NODE_ENV === "production" ? MONGODB_PRODUCTION_URI : MONGODB_URI
);

async function main() {
  try {
    await client.connect();
    const db = client.db();
    const roles = await db.collection("roles").find({}).count();
    const competencies = await db.collection("competencies").find({}).count();
    const users = await db.collection("users").find({}).count();

    /**
     * If existing records then delete the current collections
     */
    if (roles) {
      db.dropCollection("roles");
    }
    if (competencies) {
      db.dropCollection("competencies");
    }
    if (users) {
      db.dropCollection("users");
    }

    /**
     * This is just a fun little loader module that displays a spinner
     * to the command line
     */
    const load = loading("importing your wine 🍷!!").start();

    /**
     * Import the JSON data into the database
     */

    const rolesData = await fs.readFile(path.join(__dirname, "roles.json"), "utf8");
    await db.collection("roles").insertMany(JSON.parse(rolesData));

    const competenciesData = await fs.readFile(path.join(__dirname, "competencies.json"), "utf8");
    await db.collection("competencies").insertMany(JSON.parse(competenciesData));

    const usersData = await fs.readFile(path.join(__dirname, "users.json"), "utf8");  

    await db.collection("users").insertMany(JSON.parse(usersData));

    // Hash a default password and insert
    const hash = await bcrypt.hash("password", 10);
    await db.collection("users").updateMany({}, { $set: { password: hash } });

    /**
     * This perhaps appears a little more complex than it is. Below, we are
     * grouping the wine tasters and summing their total tastings. Finally,
     * we tidy up the output so it represents the format we need for our new collection
     */

     const userCompetenciesRef = await db.collection("users").aggregate([
      {
        '$unwind': {
          'path': '$competencies'
        }
      }, {
        '$lookup': {
          'from': 'competencies', 
          'let': {
            'competenciesU': '$competencies.competency', 
            'levelU': '$competencies.level'
          }, 
          'pipeline': [
            {
              '$match': {
                '$expr': {
                  '$and': [
                    {
                      '$eq': [
                        '$competency', '$$competenciesU'
                      ]
                    }, {
                      '$eq': [
                        '$level', '$$levelU'
                      ]
                    }
                  ]
                }
              }
            }
          ], 
          'as': 'competencies'
        }
      }, {
        '$unwind': {
          'path': '$competencies'
        }
      }, {
        '$group': {
          '_id': '$_id', 
          'firstName': {
            '$first': '$firstName'
          }, 
          'lastName': {
            '$first': '$lastName'
          }, 
          'email': {
            '$first': '$email'
          }, 
          'password': {
            '$first': '$password'
          },
          'competencies': {
            '$push': {
              '_id': '$competencies._id'
            }
          }
        }
      }
    ]);
     /**
      * Below, we output the results of our aggregate into a
      * new collection
      */
    const userCompetencies = await userCompetenciesRef.toArray();
    db.dropCollection("users");
    await db.collection("users").insertMany(userCompetencies);

    const CompetencyRolesRef = await db.collection("competencies").aggregate([
      {
        '$lookup': {
          'from': 'roles', 
          'let': {
            'competencyU': '$competency', 
            'levelU': '$level'
          }, 
          'pipeline': [
            {
              '$match': {
                '$expr': {
                  '$and': [
                    {
                      '$eq': [
                        '$competency', '$$competencyU'
                      ]
                    }, {
                      '$eq': [
                        '$level', '$$levelU'
                      ]
                    }
                  ]
                }
              }
            }
          ], 
          'as': 'roles'
        }
      }, {
        '$unwind': {
          'path': '$roles'
        }
      }, {
        '$group': {
          '_id': '$_id', 
          'competency': {
            '$first': '$competency'
          }, 
          'description': {
            '$first': '$description'
          }, 
          'level': {
            '$first': '$level'
          }, 
          'indicator': {
            '$first': '$indicator'
          }, 
          'roles': {
            '$push': {
              '_id': '$roles._id'
            }
          }
        }
      }
    ]);

    const competencyRoles = await CompetencyRolesRef.toArray();
    db.dropCollection("competencies");
    await db.collection("competencies").insertMany(competencyRoles);

    // /** This data manipulation is to reference each document in the
    //  * tastings collection to a taster id. Further to this we also take the opportunity to
    //  * tidy up points (converting it to a int) and regions, adding them to a an array
    //  */

    // const updatedWineTastersRef = db.collection("tasters").find({});
    // const updatedWineTasters = await updatedWineTastersRef.toArray();
    // updatedWineTasters.forEach(async ({ _id, name }) => {
    //   await db.collection("tastings").updateMany({ taster_name: name }, [
    //     {
    //       $set: {
    //         taster_id: _id,
    //         regions: ["$region_1", "$region_2"],
    //         points: { $toInt: "$points" },
    //       },
    //     },
    //   ]);
    // });


    // /**
    //  * we can get rid of region_1/2 off our root document, since we've
    //  * placed them in an array
    //  */
    // await db
    //   .collection("tastings")
    //   .updateMany({}, { $unset: { region_1: "", region_2: " " } });

    // /**
    //  * Finally, we remove nulls regions from our collection of arrays
    //  * */
    // await db
    //   .collection("tastings")
    //   .updateMany({ regions: { $all: [null] } }, [
    //     { $set: { regions: [{ $arrayElemAt: ["$regions", 0] }] } },
    //   ])


    // db.collection("tastings").aggregate([
    //   { $group: { _id: "$variety" } },
    //   { $project: { name: "$_id", "_id": 0 } },
    //   { $out: "varieties" }
    // ]).toArray();

    // db.collection("tastings").aggregate([
    //   { $group: { _id: "$country" } },
    //   { $project: { name: "$_id", "_id": 0 } },
    //   { $out: "countries" }
    // ]).toArray()



    // await db.collection("tastings").aggregate([
    //   { $group: { _id: "$province" } },
    //   { $project: { name: "$_id", "_id": 0 } },
    //   { $out: "provinces" }
    // ]).toArray()

    // await db.collection("tastings").aggregate([
    //   { $unwind: "$regions" },
    //   { $group: { _id: "$regions" } },
    //   { $project: { name: '$_id', _id: 0 } },
    //   { $out: "regions" }
    // ]).toArray();


    // await db.collection("tastings").aggregate([
    //   { $unwind: "$regions" },
    //   { $group: { _id: "$regions" } },
    //   { $project: { name: "$_id", "_id": 0 } },
    //   { $out: "regions" }
    // ]).toArray()



    load.stop();
    console.info(
      `Wine collection set up! 🍷🍷🍷🍷🍷🍷🍷 \n I've also created a tasters collection for you 🥴 🥴 🥴`
    );


    process.exit();
  } catch (error) {
    console.error("error:", error);
    process.exit();
  }
}

main();
