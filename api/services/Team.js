/**
 * Booking.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
var Schema = sails.mongoose.Schema;
var schema = new Schema({
  sfaid: Number,
  year: String,
  school: {
    type: Schema.Types.ObjectId,
    ref: "School",
    index: true
  },
  name: String,
  sport: {
    type: Schema.Types.ObjectId,
    ref: "SportsList",
    index: true
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: "FirstCategory",
    index: true
  },
  agegroup: {
    type: Schema.Types.ObjectId,
    ref: "Agegroup",
    index: true
  },
  captain: {
    type: Schema.Types.ObjectId,
    ref: "Student",
    index: true
  },
  gender: String,
  coach: String,
  players: [{
    type: Schema.Types.ObjectId,
    ref: 'Student',
    index: true
  }]
});
module.exports = sails.mongoose.model('Team', schema);
var models = {
  saveData: function(data, callback) {
    var team = this(data);
    var matchObj = {};
    if (data.category && data.category === "") {
      delete data.category;
      matchObj = {
        school: data.school,
        sport: data.sport,
        agegroup: data.agegroup,
        gender: data.gender
      };
    } else {
      matchObj = {
        school: data.school,
        sport: data.sport,
        agegroup: data.agegroup,
        gender: data.gender,
        category: data.category
      };
    }
    console.log(matchObj);
    if (data._id) {
      this.findOneAndUpdate({
        _id: data._id
      }, data, function(err, data2) {
        if (err) {
          callback(err, null);
        } else {
          callback(null, data2);
        }
      });
    } else {
      Team.update(matchObj, {
        $set: {
          name: data.name + " 'A'"
        }
      }).exec(function(err, updated) {
        if (err) {
          console.log(err);
          callback(err, null);
        } else if (updated.nModified > 0) {
          team.name = data.name + " 'B'";
          Team.getLastId({}, function(err, data3) {
            if (err) {
              console.log(err);
              callback(err, null);
            } else {
              team.sfaid = data3;
              team.save(function(err, data2) {
                if (err) {
                  console.log(err);
                  callback(err, null);
                } else {
                  callback(null, data2);
                }
              });
            }
          });
        } else {
          Team.getLastId({}, function(err, data3) {
            if (err) {
              console.log(err);
              callback(err, null);
            } else {
              team.sfaid = data3;
              team.save(function(err, data2) {
                if (err) {
                  console.log(err);
                  callback(err, null);
                } else {
                  callback(null, data2);
                }
              });
            }
          });
        }
      });
    }
  },
  getTeamsbySport: function(data, callback) {
    //
    if (data.sfaid) {
      teamconstraints = {
        'sfaid': data.sfaid
      };
    } else {
      data.search = new RegExp(data.search, "i");
      teamconstraints = {
        'name': {
          '$regex': data.search
        }
      };
    }
    teamconstraints['sport'] = data.sport;
    teamconstraints['agegroup'] = data.agegroup;
    teamconstraints['gender'] = data.gender;
    teamconstraints['year'] = data.year;
    Team.find(teamconstraints).limit(20).exec(function(err, response) {
      if (err) {
        callback(err, null)
      } else {
        callback(null, response)
      }
    })
  },
  getAll: function(data, callback) {
    Team.find({}, {}, {}, function(err, deleted) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, deleted);
      }
    });
  },
  findLimited: function(data, callback) {
    var newreturns = {};
    newreturns.data = [];
    data.pagenumber = parseInt(data.pagenumber);
    var checkObj = {};

    var check = new RegExp(data.name, "i");
    checkObj = {
      name: {
        '$regex': check
      }
    };

    async.parallel([
        function(callback) {
          Team.count(checkObj).exec(function(err, number) {
            if (err) {
              console.log(err);
              callback(err, null);
            } else if (number && number !== "") {
              newreturns.total = number;
              newreturns.totalpages = Math.ceil(number / 20);
              callback(null, newreturns);
            } else {
              callback(null, newreturns);
            }
          });
        },
        function(callback) {
          Team.find(checkObj).sort({
            sfaid: -1
          }).skip(20 * (data.pagenumber - 1)).limit(20).populate('players', "_id name ").populate("school", "name").populate('sport', "name").populate("agegroup", "name").populate("category", "name").exec(function(err, data2) {
            if (err) {
              console.log(err);
              callback(err, null);
            } else if (data2 && data2.length > 0) {
              newreturns.data = data2;
              callback(null, newreturns);
            } else {
              callback(null, newreturns);
            }
          });
        }
      ],
      function(err, data4) {
        if (err) {
          console.log(err);
          callback(err, null);
        } else if (data4) {
          callback(null, newreturns);
        } else {
          callback(null, newreturns);
        }
      });
  },
  deleteData: function(data, callback) {
    Team.findOneAndRemove({
      _id: data._id
    }, function(err, deleted) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, deleted);
      }
    });
  },
  getLastId: function(data, callback) {
    Team.findOne({}, {
      _id: 0,
      sfaid: 1
    }).sort({
      sfaid: -1
    }).limit(1).lean().exec(function(err, data2) {
      if (err) {
        console.log(err);
        callback(err, null);
      } else if (_.isEmpty(data2)) {
        callback(null, 1);
      } else {
        callback(null, data2.sfaid + 1);
      }
    });
  },
  getOne: function(data, callback) {
    Team.findOne({
      _id: data._id
    }, function(err, deleted) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, deleted);
      }
    }).populate('players', "_id name sfaid").populate('captain', "_id name sfaid").populate("school", "name sfaid").populate('sport', "name").populate("agegroup", "name").populate("category", "name");
  }
};
module.exports = _.assign(module.exports, models);
