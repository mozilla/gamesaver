  var APIeasy = require('api-easy'),
        assert = require('assert');

  var suite = APIeasy.describe('api');

  var gameTitle = 'TestGame';
  var data = {
    X: 100,
    Y: -50,
    Score: 15000,
    Name: "wat"
  };
  var email = 'testEmail';

  suite.discuss('Testing the GameSaver Saving/Loading...')
          .use('localhost', 54321)
          .setHeader('Content-Type', 'application/json')
          .post('/api/login')
            .expect(200)
            .expect('Login should return the email upon verification', function(err, res, body) {
              assert.strictEqual(JSON.parse(body), email);
            })
          .next()
            .post('/api/set', {
              data: JSON.stringify(data),
              gameTitle: gameTitle
            })
            .expect(200)
          .next()
          .get('/api/get', { gameTitle: gameTitle })
            .expect('Should receive the data we just sent for ' + gameTitle, function(err, res, body) {
              var testData = JSON.parse(body);
              assert.strictEqual(testData.email, email);
              assert.strictEqual(testData.title, gameTitle);
              assert.deepEqual(testData.data, data);
            })
          .export(module);