
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
    const load = loading("importing your competencies 📝!!").start();

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
    * Below, we perform aggregate functions to overwrite the collections
    * in a way we want our database to look
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



    load.stop();
    console.info(
      `All collections set up! 📝📝📝📝📝 \n `
    );


    process.exit();
  } catch (error) {
    console.error("error:", error);
    process.exit();
  }
}

main();
