/**
 * LeagueController
 *
 * @description :: Server-side logic for managing Leagues
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
module.exports = {
    saveData: function(req, res) {
        if (req.body) {
            League.saveData(req.body, function(err, respo) {
                if (err) {
                    res.json({
                        value: false,
                        data: err
                    });
                } else {
                    res.json({
                        value: true,
                        data: respo
                    });
                }
            });
        } else {
            res.json({
                value: false,
                data: "Invalid call"
            });
        }
    },
    getAll: function(req, res) {
        if (req.body) {
            League.getAll(req.body, function(err, respo) {
                if (err) {
                    res.json({
                        value: false,
                        data: err
                    });
                } else {
                    res.json({
                        value: true,
                        data: respo
                    });
                }
            });
        } else {
            res.json({
                value: false,
                data: "Invalid call"
            });
        }
    },
    getLastLeague: function(req, res) {
        if (req.body) {
            League.getLastLeague(req.body, function(err, respo) {
                if (err) {
                    res.json({
                        value: false,
                        data: err
                    });
                } else {
                    res.json({
                        value: true,
                        data: respo
                    });
                }
            });
        } else {
            res.json({
                value: false,
                data: "Invalid call"
            });
        }
    },
    getLimited: function(req, res) {
      if (req.body) {
        if (req.body.pagenumber) {
          League.findLimited(req.body, res.callback);
        } else {
          res.json({
            value: false,
            data: "Invalid Params"
          });
        }
      } else {
        res.json({
          value: false,
          data: "Invalid Request"
        });
      }
    },
    deleteData: function(req, res) {
        if (req.body) {
            if (req.body._id && req.body._id !== "") {
                League.deleteData(req.body, function(err, respo) {
                    if (err) {
                        res.json({
                            value: false,
                            data: err
                        });
                    } else {
                        res.json({
                            value: true,
                            data: respo
                        });
                    }
                });
            } else {
                res.json({
                    value: false,
                    data: "Invalid Id"
                });
            }
        } else {
            res.json({
                value: false,
                data: "Invalid call"
            });
        }
    },
    getOne: function(req, res) {
        if (req.body) {
            if (req.body._id && req.body._id !== "") {
                League.getOne(req.body, function(err, respo) {
                    if (err) {
                        res.json({
                            value: false,
                            data: err
                        });
                    } else {
                        res.json({
                            value: true,
                            data: respo
                        });
                    }
                });
            } else {
                res.json({
                    value: false,
                    data: "Invalid Id"
                });
            }
        } else {
            res.json({
                value: false,
                data: "Invalid call"
            });
        }
    },
    findForDrop: function(req, res) {
        if (req.body) {
            if (req.body.firstcategory && Array.isArray(req.body.firstcategory)) {
                League.findForDrop(req.body, function(err, respo) {
                    if (err) {
                        res.json({
                            value: false,
                            data: err
                        });
                    } else {
                        res.json({
                            value: true,
                            data: respo
                        });
                    }
                });
            } else {
                res.json({
                    value: false,
                    data: "Please provide parameters"
                });
            }
        } else {
            res.json({
                value: false,
                data: "Please provide parameters"
            });
        }
    },
    getSportRoundLeague: function(req, res) {
      if (req.body) {
        if (req.body.sport) {
          League.getSportRoundLeague(req.body, function(err, respo) {
            if (err) {
              res.json({
                value: false,
                data: err
              });
            } else {
              res.json({
                value: true,
                data: respo
              });
            }
          });
        } else {
          res.json({
            value: false,
            data: "Input inadequate"
          });
        }
      } else {
        res.json({
          value: false,
          data: "Invalid call"
        });
      }
    },
};
