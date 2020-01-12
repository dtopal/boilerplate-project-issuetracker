/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectID;

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {

  MongoClient.connect(CONNECTION_STRING, (err, db) => {
    if (err) {
      console.log(err);
    } else {
      console.log('db connection successful');

      app.route('/api/issues/:project')

      .get(function (req, res){
        var project = req.params.project;
        db.collection(project).find({}).filter(req.query).toArray(function(err, data){
          if (err) {
            console.log(err);
          } else {
            //console.log(data);
            res.send(data);
          }
        });

      })

      .post(function (req, res){
        var project = req.params.project;
        //console.log(req.query); //query always present just empty
        //check for required fields
        if (!req.body.issue_title || !req.body.issue_text || !req.body.created_by) {
          res.send('Missing required fields');
          return;
        }
        var time = new Date();
        db.collection(project).insertOne({
          issue_title: req.body.issue_title,
          issue_text: req.body.issue_text,
          created_by: req.body.created_by,
          assigned_to: req.body.assigned_to || '',
          status_text: req.body.status_text || '',
          open: true,
          created_on: time,
          updated_on: time
        }, (err, data) => {
          if (err) {
            res.send('ERROR -- please try again');
          } else {
            res.json(data.ops[0]);
          }
        });
      })

      .put(function (req, res){
        var project = req.params.project;
        //console.log(req.body);
        //No id sent
        if (!req.body._id) {
          res.send('No ID sent');
          return;
        }
        if (req.body._id && Object.keys(req.body).length == 1) {
          res.send('No updated field sent');
          return;
        }
        var updateObj = {};
        updateObj.updated_on = new Date();
        Object.keys(req.body).map(x => {
          if (x !== '_id') {
            updateObj[x] = req.body[x];
          }
        })
        //console.log(updateObj);
        db.collection(project).findOneAndUpdate(
          { _id: ObjectId(req.body._id) },
          { $set: updateObj },
          { returnOriginal: false },
          function(err, data){
            if (err) {
              console.log(err);
            } else {
              //console.log(data.value);
              res.json(data.value);
            }
          }
        )
      })

      .delete(function (req, res){
        var project = req.params.project;
        if (!req.body._id) {
          res.send('_id error');
          return;
        }
        db.collection(project).findOneAndDelete({ _id: ObjectId(req.body._id) }, function(err, data){
          if (err) {
            //console.log(err);
            res.send('could not delete ' + req.body._id);
          } else {
            //console.log(data);
            res.send('deleted ' + data.value._id);
          }
        });

      });

      //404 Not Found Middleware
      app.use(function(req, res, next) {
        res.status(404)
          .type('text')
          .send('Not Found');
      });
    }
  })
};
