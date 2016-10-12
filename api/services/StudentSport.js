/**
 * Booking.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
var Schema = sails.mongoose.Schema;
var objectid = require("mongodb").ObjectId;
var schema = new Schema({
  year: String,
  sportslist: {
    type: {
      _id: {
        type: Schema.Types.ObjectId,
        ref: 'SportsList'
      },
      name: String,
      sporttype: String
    }
  },
  agegroup: {
    type: {
      _id: {
        type: Schema.Types.ObjectId,
        ref: 'Agegroup'
      },
      name: String
    }
  },
  firstcategory: {
    type: {
      _id: {
        type: Schema.Types.ObjectId,
        ref: 'FirstCategory'
      },
      name: String
    }
  },
  secondcategory: {
    type: {
      _id: {
        type: Schema.Types.ObjectId,
        ref: 'SecondCategory'
      },
      name: String
    }
  },
  thirdcategory: {
    type: {
      _id: {
        type: Schema.Types.ObjectId,
        ref: 'ThirdCategory'
      },
      name: String
    }
  },
  medals: Schema.Types.Mixed,
  school: {
    type: {
      _id: {
        type: Schema.Types.ObjectId,
        ref: 'School'
      },
      name: String
    }
  },
  student: {
    type: Schema.Types.ObjectId,
    ref: 'Student'
  }
  // ,
  // sportconfig:{
  //   type:Schema.Types.ObjectId,
  //   ref:'Sport'
  // },
  // knockout : {
  //   type:Schema.Types.ObjectId,
  //   ref:'Knockout'
  // }
  // ,
  // league: {
  //   type:Schema.Types.ObjectId,
  //   ref: 'League'
  // }
});
module.exports = sails.mongoose.model('StudentSport', schema);
var models = {
  saveData: function(data, callback) {
    var studentsport = this(data);
    if (data._id) {
      console.log(data);
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
      studentsport.save(function(err, data2) {
        if (err) {
          callback(err, null);
        } else {
          callback(null, data2);
        }
      });
    }
  },
  saveDataMass: function(data, callback) {
    var studentsport = this(data);
    if (data._id) {
      // data.student = "'"+data.student.toString()+"'";
      console.log(data);
      this.findOneAndUpdate({
        _id: data._id
      }, {
        $set:{
          "student":data.student
        }
      }, function(err, data2) {
        if (err) {
          callback(err, null);
        } else {
          callback(null, data2);
        }
      });
    } else {
      studentsport.save(function(err, data2) {
        if (err) {
          callback(err, null);
        } else {
          callback(null, data2);
        }
      });
    }
  },
  getSchoolSportByGender: function(data, callback) {
    StudentSport.aggregate([{
        $match: {
          "school._id": data._id,
          "year": data.year
        }
      }, {
        $lookup: {
          from: 'students',
          localField: 'student',
          foreignField: '_id',
          as: 'student'
        }
      }, {
        $unwind: "$student"
      }, {
        $group: {
          _id: {
            sport: "$sportslist._id",
            gender: "$student.gender"
          },
          "count": {
            $sum: 1
          }
        }
      }, {
        $group: {
          "_id": "$_id.sport",
          "gender": {
            $addToSet: {
              name: "$_id.gender",
              "count": "$count"
            }
          }
        }
      }
      // ,{
      //   $unwind:"$sport"
      // }
    ]).exec(function(err, response) {
      if (err) {
        callback(err, null);
      } else {
        SportsList.populate(response, {
          path: "_id"
        }, function(err, data) {
          if (err) {
            callback(err, null);
          } else {
            callback(null, data);
          }
        });
        // callback(null, data);
      }
    });
  },
  getAll: function(data, callback) {
    StudentSport.find({}, {}, {}, function(err, deleted) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, deleted);
      }
    });
  },
  deleteData: function(data, callback) {
    StudentSport.findOneAndRemove({
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
    StudentSport.findOne({
      _id: data._id
    }, function(err, deleted) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, deleted);
      }
    });
  },
  getFirstCategoryFromSport: function(data, callback) {
    Sport.aggregate([{
      $match: {
        'sportslist._id': data.sport
      }
    }, {
      $group: {
        _id: null,
        category: {
          $addToSet: "$firstcategory"
        }
      }
    }, {
      $project: {
        category: 1
      }
    }]).exec(function(err, response) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, response);
      }
    });
  },
  getStudentsbySport: function(data, callback) {
    //For Knockout
    // StudentSport.find({
    //     'sportslist._id': data.sport
    // },{
    //   _id:0,
    //   student:1
    // }, function(err, deleted) {
    //     if (err) {
    //         callback(err, null);
    //     } else {
    //         callback(null, deleted);
    //     }
    // }).populate("student");
    var studentconstraints = {};
    if (data.sfaid) {
      studentconstraints = {
        $match: {
          'student.sfaid': data.sfaid
        }
      };
    } else {
      data.search = new RegExp(data.search, "i");
      studentconstraints = {
        $match: {
          'student.name': {
            '$regex': data.search
          }
        }
      };
    }
    if (data.gender) {
      studentconstraints.$match['student.gender'] = data.gender;
    }
    console.log(studentconstraints);
    StudentSport.aggregate([{
      $match: {
      'sportslist._id': objectid(data.sport),
        'year': data.year
      }
    }, {
      $lookup: {
        from: 'students',
        localField: 'student',
        foreignField: '_id',
        as: 'student'
      }
    }, {
      $unwind: '$student'
    }, studentconstraints, {
      $project: {
        _id: 0,
        student: 1
      }
    }, {
      $limit: 10
    }]).exec(function(err, data2) {
      // console.log(data2);
      if (err) {
        console.log(err);
        callback(err, null);
      } else if (data2 && data2.length > 0) {
        // StudentSport.populate(data2,{
        //   path:"student"
        // },function (err,data) {
        //   if(err){
        //     callback(err, null);
        //   }else{
        //     data = _.map(data,function (key) {
        //       return key.student;
        //     });
        //     callback(null, data);
        //
        //   }
        // });
        data2 = _.map(data2, function(key) {
          return key.student;
        });
        callback(null, data2);
      } else {
        callback({}, null);
      }
    });
  },
  getStudentsbySportwithExclude: function(data, callback) {
    //For Knockout
    // StudentSport.find({
    //     'sportslist._id': data.sport
    // },{
    //   _id:0,
    //   student:1
    // }, function(err, deleted) {
    //     if (err) {
    //         callback(err, null);
    //     } else {
    //         callback(null, deleted);
    //     }
    // }).populate("student");
    var studentconstraints = {};
    if (data.sfaid) {
      studentconstraints = {
        $match: {
          'student.sfaid': data.sfaid
        }
      };
    } else {
      data.search = new RegExp(data.search, "i");
      studentconstraints = {
        $match: {
          'student.name': {
            '$regex': data.search
          }
        }
      };
    }
    if (data.gender) {
      studentconstraints.$match['student.gender'] = data.gender;
    }
    console.log(studentconstraints);
    StudentSport.aggregate([{
      $match: {
        'sportslist._id': data.sport,
        'year': data.year
      }
    }, {
      $lookup: {
        from: 'students',
        localField: 'student',
        foreignField: '_id',
        as: 'student'
      }
    }, {
      $unwind: '$student'
    }, studentconstraints, {
      $project: {
        _id: 0,
        student: 1
      }
    }, {
      $limit: 10
    }]).exec(function(err, data2) {
      // console.log(data2);
      if (err) {
        console.log(err);
        callback(err, null);
      } else if (data2 && data2.length > 0) {
        // StudentSport.populate(data2,{
        //   path:"student"
        // },function (err,data) {
        //   if(err){
        //     callback(err, null);
        //   }else{
        //     data = _.map(data,function (key) {
        //       return key.student;
        //     });
        //     callback(null, data);
        //
        //   }
        // });
        data2 = _.map(data2, function(key) {
          return key.student;
        });
        callback(null, data2);
      } else {
        callback({}, null);
      }
    });
  },
  getSports: function(data, callback) {
    StudentSport.find({
      student: data.student
    }, function(err, deleted) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, deleted);
      }
    });
  },

  getSportsPopulated: function(data, callback) {
    StudentSport.find({
      student: data.student,
      year: data.year
    }, function(err, found) {
      if (err) {
        callback(err, null);
      } else {
        SportsList.populate(found, {
          path: 'sportslist._id'
        }, function(err, response) {
          if (err) {
            callback(err, null);
          } else {
            callback(null, response);

          }
        });
      }
    });
  },
  // updateAllStudentRef: function(data, callback) {
  //   var studentsports = [];
  //   function saveMeeeeee(iterator) {
  //     console.log();
  //     StudentSport.saveData(studentsports[iterator],function (err,response) {
  //       runThroughSaves(++iterator);
  //     });
  //   }
  //   function runThroughSaves(iterator) {
  //     if(studentsports.length <= iterator){
  //       callback(null,"done");
  //     }else
  //     {
  //       saveMeeeeee(iterator);
  //     }
  //   }
  //   StudentSport.find({}, {}, {}, function(err, data) {
  //     if (err) {
  //       callback(err, null);
  //     } else {
  //       console.log(data.length);
  //       studentsports = data;
  //       runThroughSaves(0);
  //
  //     }
  //
  //   });
  // }
  updateAllStudentRef: function(data, callback) {
    StudentSport.find({}, {}, {}, function(err, data) {
      if (err) {
        callback(err, null);
      } else {
        console.log(data.length);
        async.each(data, function(j, callback1) {

          //   Mustdocity.saveData2(j, function(err, updated) {
          //     if (err) {
          //       console.log(err);
          //       callback1(err, null);
          //     } else {
          //       if (updated._id) {
          //         mustDoId.push(updated._id);
          //       }
          //       callback1(null, updated);
          //     }
          //   });
          //
          if(j.student && j.sportslist){
            StudentSport.findOneAndUpdate({
              _id:j._id
            },{

            },{
              $set:{
                student:objectid(j.student),
                "sportslist._id":objectid(j.sportslist._id)
              }
            },function (err,resp) {
              if(err){
                callback1(err,null);
              }else{
                callback1(null,resp);

              }
            });
              // StudentSport.saveDataMass(j, function(err, updated) {
              //   if (err) {
              //     console.log(err);
              //     callback1(err, null);
              //   } else {
              //     callback1(null, updated);
              //   }
              // });
          }else{
            callback1(null,"done");
          }
        }, function(err) {
          if (err) {
            console.log(err);
            callback(err, null);
          } else {
            callback(null, "Done");
          }
        });

      }

    });
  }
};
module.exports = _.assign(module.exports, models);
