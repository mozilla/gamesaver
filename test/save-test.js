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

  suite.discuss('Testing the GameSaver Saving/Loading...')
          .use('localhost', 54321)
          .setHeader('Content-Type', 'application/json')
          .post('/api/login')
            .expect(200)
          .next()
	      .post('/api/set', {
            data: JSON.stringify(data),
            gameTitle: gameTitle
          })
            .expect(200)
          .next()
          .get('/api/get', { gameTitle: gameTitle })
            .expect(200) // Do some code to test loading here
          .export(module);
