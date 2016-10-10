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
      var teamstudents = {};
      function updateSingleStudent(tuple) {
        console.log("tuple",tuple);
        Student.update({
          _id:tuple.player
        },{
          $inc:{
            totalPoints : tuple.points
          }
        },{

        }, function(err,data) {
          if(err){
            callback(err,null);
          }else{
            console.log("data",data);
            School.update({
              _id:tuple.school
            },{
              $inc:{
                totalPoints: tuple.points
              }
            },{

            },function (err,data) {
              if(err){
                callback(err,null);
              }else{
                console.log(data);
                callback(null,data);
              }
            });
          }
        });
      }
      function addStudent(singl) {
        var constraints = {};
        constraints.year = teamstudents.year;
        constraints.participantType = 'player';
        constraints.school = teamstudents.school;
        constraints.sport = teamstudents.sport;
        constraints.medal = teamstudents.medal;
        constraints.points = teamstudents.points;
        constraints.player = teamstudents.team.players[singl];
        constraints.team = teamstudents.team._id;
        console.log("constraints",constraints);
        medal = new Medal(constraints);
        medal.save(function (err,added) {
          if(err){
            callback(err,null);
          }else{
            /// update code
            Student.update({
              _id : constraints.player
            },{
              $inc:{
                totalPoints:constraints.points
              }
            },{

            }, function (err,resp) {
              if(err){
                callback(err,null);
              }else{
                runThroughStudents(++singl);
              }
            });
          }
        });
      }
      function runThroughStudents(iterator) {
        console.log(teamstudents);
        if (teamstudents.team.players.length <= iterator) {
          // runThroughHeats(++iterator);
          callback(null,"done");
        } else {
          addStudent(iterator);
        }
      }
      function updateTeamsAndAddStudents(tuple) {
        Medal.populate(tuple,{
          path:'team'
        },function (err,expanded) {
          School.update({
            _id:tuple.school
          },{
            $inc:{
              totalPoints: tuple.points
            }
          },{

          },function (err,data) {
            if(err){
              callback(err,null);
            }else{
              teamstudents = expanded;
              console.log("teamstudents",teamstudents);

              runThroughStudents(0);
              // callback(null,data);
            }
          });
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
          console.log(data);
          Medal.populate(data,[{
            path:'player'
          },{
            path:'team'
          }],function (err,expanded) {
            if(err){
              callback(err,null);
            }else{
              // console.log(expanded);
              console.log(data);
              if(data.participantType){
                if(data.participantType == "player"){
                  data.school = expanded.player.school;
                }else{
                  data.school = expanded.team.school;
                }
              }
              data[data.participantType] = data[data.participantType]._id;
              console.log(data);
              medal = new Medal(data);
              medal.save(function(err, data3) {
                  if (err) {
                      callback(err, null);
                  } else {
                     if (data.medal){
                       if(data.medal == 1){
                         expanded.points = 5;
                       }else if(data.medal == 2){
                         expanded.points = 3;
                       }else if(data.medal == 3){
                         expanded.points = 2;
                       }
                     }
                     if(data.participantType){
                       if(data.participantType == "player"){
                         updateSingleStudent(expanded);
                       }else{
                         updateTeamsAndAddStudents(expanded);
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
    getAllBySport: function(data, callback) {
        Medal.find({
          sport:data.sport
        }, {}, {}, function(err, deleted) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, deleted);
            }
        }).populate('player').populate('team').populate('sport').populate('school');
    },
    deleteData: function(data, callback) {
      function updateStudent(tuple) {
        Student.update({
          _id:tuple.player
        },{
          $inc:{
            totalPoints : (-1)*tuple.points
          }
        },{

        }, function(err,data) {
          if(err){
            callback(err,null);
          }else{
            console.log("data",data);
            School.update({
              _id:tuple.school
            },{
              $inc:{
                totalPoints: (-1)*tuple.points
              }
            },{

            },function (err,data) {
              if(err){
                callback(err,null);
              }else{
                // console.log(data);
                // callback(null,data);
                console.log(data);
                Medal.findOneAndRemove({
                    _id: tuple._id
                }, function(err, deleted) {
                    if (err) {
                        callback(err, null);
                    } else {
                        callback(null, deleted);
                    }
                });
              }
            });
          }
        });
      }
      Medal.findOne({
          _id: data._id
      }, function(err, found) {
          if (err) {
              callback(err, null);
          } else {
              if (found.medal){
                if(found.medal == 1){
                  found.points = 5;
                }else if(found.medal == 2){
                  found.points = 3;
                }else if(found.medal == 3){
                  found.points = 2;
                }
              }
              if(found.participantType == 'player'){
                updateStudent(found);
              }else{
                // updateTeamsAndAddStudent();
              }
          }
      });
        // Medal.findOneAndRemove({
        //     _id: data._id
        // }, function(err, deleted) {
        //     if (err) {
        //         callback(err, null);
        //     } else {
        //         callback(null, deleted);
        //     }
        // });
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
