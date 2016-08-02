/**
 * ConfigController
 *
 * @description :: Server-side logic for managing Configs
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    countStatic: function(req, res) {
        var respObj = {};
        async.parallel([
            function(callback) {
                School.count(function(err, respo) {
                    if (err) {
                        console.log(err);
                        callback(err, null);
                    } else {
                        respObj.school = respo;
                        callback(null, respObj);
                    }
                });
            },
            function(callback) {
                Student.count(function(err, respo) {
                    if (err) {
                        console.log(err);
                        callback(err, null);
                    } else {
                        respObj.student = respo;
                        callback(null, respObj);
                    }
                });
            },
        ], function(err, data2) {
            if (err) {
                console.log(err);
                res.json({
                    value: false,
                    data: err
                });
            } else {
                res.json({
                    value: true,
                    data: respObj
                });
            }
        });
    },
    countForDashboard: function(req, res) {
        var respObj = {};
        if (req.body && req.body.year) {
            async.parallel([
                function(callback) {
                    StudentSport.aggregate([{
                        $match: {
                            year: req.body.year,
                            school: {
                                $exists: true
                            }
                        }
                    }, {
                        $group: {
                            _id: "$sportslist._id",
                            schoolid: {
                                $addToSet: "$school._id"
                            },
                            name: {
                                $addToSet: "$sportslist.name"
                            }
                        }
                    }, {
                        $unwind: "$name"
                    }, {
                        $project: {
                            _id: 0,
                            count: { $size: "$schoolid" },
                            name: 1
                        }
                    }]).exec(function(err, respo) {
                        // console.log(respo);
                        if (err) {
                            console.log(err);
                            callback(err, null);
                        } else if (respo && respo.length > 0) {
                            respObj.schoolSport = respo;
                            callback(null, respObj);
                        } else {
                            respObj.schoolSport = [];
                            callback(null, respObj);
                        }
                    });
                },
                function(callback) {
                    StudentSport.aggregate([{
                        $match: {
                            year: req.body.year,
                            student: {
                                $exists: true
                            }
                        }
                    }, {
                        $group: {
                            _id: "$sportslist._id",
                            student: {
                                $addToSet: "$student"
                            },
                            name: {
                                $addToSet: "$sportslist.name"
                            }
                        }
                    }, {
                        $unwind: "$name"
                    }, {
                        $project: {
                            _id: 0,
                            count: { $size: "$student" },
                            name: 1
                        }
                    }]).exec(function(err, respo) {
                        // console.log(respo);
                        if (err) {
                            console.log(err);
                            callback(err, null);
                        } else if (respo && respo.length > 0) {
                            respObj.studentSport = respo;
                            callback(null, respObj);
                        } else {
                            respObj.studentSport = [];
                            callback(null, respObj);
                        }
                    });
                }
            ], function(err, data2) {
                if (err) {
                    console.log(err);
                    res.json({
                        value: false,
                        data: err
                    });
                } else {
                    res.json({
                        value: true,
                        data: respObj
                    });
                }
            });
        } else {
            res.json({
                value: false,
                data: "Please provide params"
            });
        }
    }
};