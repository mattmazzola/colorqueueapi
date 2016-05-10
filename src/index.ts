import * as fs from 'fs';
import * as path from 'path';
import * as restify from 'restify';
import Firebase = require('firebase');
import FirebaseTokenGenerator = require('firebase-token-generator');

let firebaseSecret;
let firebaseUid;

if(process.env.firebaseSecret && process.env.firebaseUid) {
  firebaseSecret = process.env.firebaseSecret;
  firebaseUid = process.env.firebaseUid;
  console.log('Using configuration fron process.env');
}
else {
  const config = require('../config.json');
  firebaseSecret = config.firebaseSecret;
  firebaseUid = config.firebaseUid;
  console.log('Using configuration from config.json');
}

const tokenGenerator = new FirebaseTokenGenerator(firebaseSecret);
const token = tokenGenerator.createToken({ uid: firebaseUid, version: '1.0' });

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
  const body = {
    r,
    g,
    b,
    a,
    order: timestamp,
    transition: 'linear',
    duration: 30000
  };
  
  firebaseRef.child('colors').push(body, (error) => {
    if(error) {
      res.send(500, error);
    }
    else {
      res.send(200);
    }
    
    return next();
  });
});

server.del('/colors/:id', function create(req, res, next) {
  const colorId = parseInt(req.params.id);
  
  if(typeof colorId !== 'number') {
    res.send(400, `id must be a number. You passed ${req.params.id}`);
    return next();
  }
  
  firebaseRef.child('colors').orderByChild('order').once('value', (dataSnapshot) => {
    const colorsHash = dataSnapshot.val();
    let color = undefined;
    
    Object.keys(colorsHash)
      .some(key => {
        const c = colorsHash[key];
        c.key = key;
        
        if(c.order === colorId) {
          color = c;
          return true;
        }
      });

    if(!color) {
      res.send(400, `No color found with id: ${colorId}.`);
      return next();
    }
    
    return firebaseRef.child('colors').child(color.key).remove()
      .then(() => {
        res.send(200);
        return next();
      })
      .catch(error => {
        res.send(500, error);
        return next();
      });
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

const port = process.env.port || 8080;
server.listen(port);
console.log(`Listening on port: ${port}`);
