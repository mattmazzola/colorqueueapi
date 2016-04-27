import * as fs from 'fs';
import * as path from 'path';
import * as restify from 'restify';
import Firebase = require('firebase');
import FirebaseTokenGenerator = require('firebase-token-generator');

const configJson = fs.readFileSync(path.join(__dirname, '..', 'config.json'), 'utf8');
const config = JSON.parse(configJson);
const tokenGenerator = new FirebaseTokenGenerator(config.firebaseSecret);
const token = tokenGenerator.createToken({ uid: config.firebaseUid, version: '1.0' });

const firebaseRef = new Firebase("https://colorqueue.firebaseio.com");
firebaseRef.authWithCustomToken(token, (error, authData) => {
  if (error) {
    throw error;
  }
  
  console.log("Login Succeeded!", authData);
});

const server = restify.createServer({
  name: 'ColorQueue'
});
server.use(restify.acceptParser(server.acceptable));
server.use(restify.CORS());
server.use(restify.queryParser());
server.use(restify.bodyParser());

server.post('/colors', function create(req, res, next) {
  const {r, g, b, a} = req.body;
  const timestamp = (new Date()).getTime();
  
  firebaseRef.child('colors').push({r, g, b, a, order: timestamp}, (error) => {
    if(error) {
      res.send(500, error);
    }
    else {
      res.send(200);
    }
    
    return next();
  });
});

server.post('/clear', function clear(req, res, next) {
  firebaseRef.child('colors').set([], (error) => {
    if(error) {
      res.send(500, error);
    }
    else {
      res.send(200);
    }
    
    return next();
  });
});

server.listen(8080);
