/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

    suite('POST /api/issues/{project} => object with issue data', function() {

      test('Every field filled in', function(done) {
       chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Every field filled in',
          assigned_to: 'Chai and Mocha',
          status_text: 'In QA'
        })
        .end(function(err, res){
           assert.equal(res.status, 200);
           assert.equal(res.body.issue_title, 'Title');
           assert.equal(res.body.issue_text, 'text');
           assert.equal(res.body.created_by, 'Functional Test - Every field filled in');
           assert.equal(res.body.assigned_to, 'Chai and Mocha');
           assert.equal(res.body.status_text, 'In QA');
           done();
          //fill me in too!
        });
      });

      test('Required fields filled in', function(done) {
        chai.request(server)
          .post('/api/issues/test')
          .send({
            issue_title: 'Title',
            issue_text: 'text',
            created_by: 'Functional Test - Required fields filled in'
          })
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.body.issue_title, 'Title');
            assert.equal(res.body.issue_text, 'text');
            assert.equal(res.body.created_by, 'Functional Test - Required fields filled in');
            assert.equal(res.body.assigned_to, '');
            assert.equal(res.body.status_text, '');
            assert.equal(res.body.open, true);
            assert.exists(res.body.created_on, 'created_on field exists');
            assert.exists(res.body.updated_on, 'updated_on field exists');
            assert.exists(res.body._id, 'id exists');
            done();

          })
      });

      test('Missing required fields', function(done) {
        chai.request(server)
          .post('/api/issues/test')
          .send({
            issue_status: 'In QA'
          })
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.text, 'Missing required fields');

            done();
          })
      });

    });

    suite('PUT /api/issues/{project} => text', function() {

      test('No body', function(done) {
        var testID;
        chai.request(server)
          .post('/api/issues/test')
          .send({
            issue_title: 'Title',
            issue_text: 'text',
            created_by: 'Functional test - one field to update'
          })
          .end(function(err, res){
            if (err) {
              console.log(err);
            } else {
              testID = res.body._id
              //console.log(testID);
              //console.log(res.body);
              chai.request(server)
                .put('/api/issues/test')
                .send({
                  _id: testID
                })
                .end(function(err, res){
                  assert.equal(res.status, 200);
                  assert.equal(res.text, 'No updated field sent');
                  done();
                })
            }
          })
      });

      test('One field to update', function(done) {
        var testID;
        var testCreatedOn;
        chai.request(server)
          .post('/api/issues/test')
          .send({
            issue_title: 'Title',
            issue_text: 'text',
            created_by: 'Functional test - one field to update'
          })
          .end(function(err, res){
            testID = res.body._id;
            testCreatedOn = res.body.created_on;
            chai.request(server)
              .put('/api/issues/test')
              .send({
                _id: testID,
                issue_text: 'issue text has changed'
              })
              .end(function(err, res){
                assert.equal(res.status, 200);
                assert.equal(res.body.issue_text, 'issue text has changed');
                assert.equal(res.body.created_on, testCreatedOn);
                assert.notEqual(res.body.updated_on, testCreatedOn);
                done();
              });
          });
      });

      test('Multiple fields to update', function(done) {
        var testID;
        var testCreatedOn;
        chai.request(server)
          .post('/api/issues/test')
          .send({
            issue_title: 'Title',
            issue_text: 'text',
            created_by: 'Functional test - multiple field to update'
          })
          .end(function(err, res){
            testID = res.body._id;
            testCreatedOn = res.body.created_on;
            chai.request(server)
              .put('/api/issues/test')
              .send({
                _id: testID,
                issue_text: 'issue text has changed',
                assigned_to: 'test'
              })
              .end(function(err, res){
                assert.equal(res.status, 200);
                assert.equal(res.body.issue_text, 'issue text has changed');
                assert.equal(res.body.assigned_to, 'test');
                assert.equal(res.body.created_on, testCreatedOn);
                assert.notEqual(res.body.updated_on, testCreatedOn);
                done();
              })
          })
        });

    });

    suite('GET /api/issues/{project} => Array of objects with issue data', function() {

      test('No filter', function(done) {
        chai.request(server)
        .get('/api/issues/test')
        .query({})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
          done();
        });
      });

      test('One filter', function(done) {
        chai.request(server)
          .get('/api/issues/test')
          .query({ issue_text: 'issue text has changed' })
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.property(res.body[0], 'issue_title');
            assert.property(res.body[0], 'issue_text');
            assert.property(res.body[0], 'created_on');
            assert.property(res.body[0], 'updated_on');
            assert.property(res.body[0], 'created_by');
            assert.property(res.body[0], 'assigned_to');
            assert.property(res.body[0], 'open');
            assert.property(res.body[0], 'status_text');
            assert.property(res.body[0], '_id');
            res.body.forEach(doc => assert.equal(doc.issue_text, 'issue text has changed'));
            done();
          })
      });

      test('Multiple filters (test for multiple fields you know will be in the db for a return)', function(done) {
        chai.request(server)
          .get('/api/issues/test')
          .query({ issue_text: 'issue text has changed', assigned_to: 'test' })
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.property(res.body[0], 'issue_title');
            assert.property(res.body[0], 'issue_text');
            assert.property(res.body[0], 'created_on');
            assert.property(res.body[0], 'updated_on');
            assert.property(res.body[0], 'created_by');
            assert.property(res.body[0], 'assigned_to');
            assert.property(res.body[0], 'open');
            assert.property(res.body[0], 'status_text');
            assert.property(res.body[0], '_id');
            res.body.forEach(doc => {
              assert.equal(doc.issue_text, 'issue text has changed');
              assert.equal(doc.assigned_to, 'test');
            });
            done();

          })
      });

    });

    suite('DELETE /api/issues/{project} => text', function() {
      var testID;
      chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Every field filled in',
          assigned_to: 'Chai and Mocha',
          status_text: 'In QA'
        })
        .end(function(err, res){
        testID = res.body._id;
        })


      test('No _id', function(done) {
        chai.request(server)
          .delete('/api/issues/test')
          .send({})
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.text, '_id error');
            done();
          });
      });

      test('Valid _id', function(done) {
        chai.request(server)
          .delete('/api/issues/test')
          .send({ _id: testID })
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.text, 'deleted ' + testID);
            done();
          });
      });

    });

});
