import * as restify from 'restify';
import Firebase = require('firebase');

const firebaseRef = new Firebase("https://colorqueue.firebaseio.com");

const server = restify.createServer({
  name: 'ColorQueue'
});
server.use(restify.acceptParser(server.acceptable));
server.use(restify.CORS());
server.use(restify.queryParser());
server.use(restify.bodyParser());

server.get('/colors', function read(req, res, next) {
  firebaseRef.child('colors').on('value', (dataSnapshot) => {
    const firebaseColors = dataSnapshot.val();
    const colors = Object.keys(firebaseColors)
      .reduce((a, b) => {
        a.push(firebaseColors[b]);
        return a;
      }, []);
      
    res.send(200, colors);
    return next();
  });
});

server.post('/colors', function create(req, res, next) {
  const {r, g, b, a} = req.body;
  const timestamp = (new Date()).getTime();
  
  firebaseRef.child('colors').push({r, g, b, a, order: timestamp});
  
  res.send(200);
  return next();
});

server.post('/clear', function clear(req, res, next) {
  firebaseRef.child('colors').set([]);
  
  res.send(200);
  return next();
});

server.listen(8080);
