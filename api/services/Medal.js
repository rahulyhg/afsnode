/**
 * Booking.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
var Schema = sails.mongoose.Schema;
var schema = new Schema({
    year:String,
    school :{
      type:Schema.Types.ObjectId,
      ref:'School'
    },
    player :{
      type:Schema.Types.ObjectId,
      ref:'Student'
    },
    team :{
      type:Schema.Types.ObjectId,
      ref:'Team'
    },
    participantType: {
      type: String
    },
    sport:{
      type:Schema.Types.ObjectId,
      ref:'Sport'
    },
    medal : Number
});
module.exports = sails.mongoose.model('Medal', schema);
var models = {
    saveData: function(data, callback) {
      function updateSingleStudent(tuple) {
        Student.update({
          _id:tuple.student
        },{
          $inc:{
            totalPoints : data.points
          }
        },{

        }, function(err,data) {
          if(err){
            callback(err,null);
          }else{
            callback(err,data);
          }
        });
      }
        var medal = this(data);
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
          Medal.populate(data,[{
            path:'student'
          },{
            path:'team'
          }],function (err,expanded) {
            if(err){
              callback(err,null);
            }else{
              if(data.participantType){
                if(data.participantType == "player"){
                  data.school = expanded.student.school;
                }else{
                  data.school = expanded.team.school;
                }
              }
              medal.save(function(err, data3) {
                  if (err) {
                      callback(err, null);
                  } else {
                     if (data.medalrank){
                       if(data.medalrank == 1){
                         expanded.points = 5;
                       }else if(data.medalrank == 2){
                         expanded.points = 3;
                       }else if(data.medalrank == 3){
                         expanded.points = 2;
                       }
                     }
                     if(data.participantType){
                       if(data.participantType == "player"){
                         updateSingleStudent(expanded);
                       }else{

                       }
                     }
                  }
              });
            }
          });


        }
    },
    getAll: function(data, callback) {
        Medal.find({}, {}, {}, function(err, deleted) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, deleted);
            }
        });
    },
    deleteData: function(data, callback) {
        Medal.findOneAndRemove({
            _id: data._id
        }, function(err, deleted) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, deleted);
            }
        });
    },
    getOne: function(data, callback) {
        Medal.findOne({
            _id: data._id
        }, function(err, deleted) {
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
        folder: {
          '$regex': check
        }
      };

      async.parallel([
          function(callback) {
            Medal.count(checkObj).exec(function(err, number) {
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
            Medal.find(checkObj).sort({}).skip(20 * (data.pagenumber - 1)).limit(20).exec(function(err, data2) {
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
    findForDrop: function(data, callback) {
        var returns = [];
        var exit = 0;
        var exitup = 1;
        var check = new RegExp(data.search, "i");

        function callback2(exit, exitup, data) {
            if (exit == exitup) {
                callback(null, data);
            }
        }
        Medal.find({
            name: {
                '$regex': check
            }
        }).limit(10).exec(function(err, found) {
            if (err) {
                console.log(err);
                callback(err, null);
            }
            if (found && found.length > 0) {
                exit++;
                if (data.medal.length !== 0) {
                    var nedata;
                    nedata = _.remove(found, function(n) {
                        var flag = false;
                        _.each(data.medal, function(n1) {
                            if (n1.name == n.name) {
                                flag = true;
                            }
                        });
                        return flag;
                    });
                }
                returns = returns.concat(found);
                callback2(exit, exitup, returns);
            } else {
                callback([], null);
            }
        });
    }
};
module.exports = _.assign(module.exports, models);