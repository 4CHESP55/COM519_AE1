[
  {
    '$unwind': {
      'path': '$competencies'
    }
  }, {
    '$lookup': {
      'from': 'competencyProficiencies', 
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
      'as': 'competenciesWithProficiencies'
    }
  }, {
    '$lookup': {
      'from': 'competenciesForRoles', 
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
                    '$profficency level', '$$levelU'
                  ]
                }
              ]
            }
          }
        }
      ], 
      'as': 'competenciesForRoles'
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
      'competencies': {
        '$push': {
          '_id': {
            '$first': '$competenciesWithProficiencies._id'
          }, 
          'competency': {
            '$first': '$competenciesWithProficiencies.competency'
          }, 
          'level': {
            '$first': '$competenciesWithProficiencies.level'
          }, 
          'indicator': {
            '$first': '$competenciesWithProficiencies.indicator'
          }, 
          'roles': '$competenciesForRoles.role', 
          'career levels': '$competenciesForRoles.career level'
        }
      }
    }
  }
]