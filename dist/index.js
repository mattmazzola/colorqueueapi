"use strict";
var fs = require('fs');
var path = require('path');
var restify = require('restify');
var Firebase = require('firebase');
var FirebaseTokenGenerator = require('firebase-token-generator');
var configJson = fs.readFileSync(path.join(__dirname, '..', 'config.json'), 'utf8');
var config = JSON.parse(configJson);
var tokenGenerator = new FirebaseTokenGenerator(config.firebaseSecret);
var token = tokenGenerator.createToken({ uid: config.firebaseUid, version: '1.0' });
var firebaseRef = new Firebase("https://colorqueue.firebaseio.com");
firebaseRef.authWithCustomToken(token, function (error, authData) {
    if (error) {
        throw error;
    }
    console.log("Login Succeeded!", authData);
});
var server = restify.createServer({
    name: 'ColorQueue'
});
server.use(restify.acceptParser(server.acceptable));
server.use(restify.CORS());
server.use(restify.queryParser());
server.use(restify.bodyParser());
server.post('/colors', function create(req, res, next) {
    var _a = req.body, r = _a.r, g = _a.g, b = _a.b, a = _a.a;
    var timestamp = (new Date()).getTime();
    var body = {
        r: r,
        g: g,
        b: b,
        a: a,
        order: timestamp,
        transition: 'linear',
        duration: 30000
    };
    firebaseRef.child('colors').push(body, function (error) {
        if (error) {
            res.send(500, error);
        }
        else {
            res.send(200);
        }
        return next();
    });
});
server.del('/colors/:id', function create(req, res, next) {
    var colorId = parseInt(req.params.id);
    if (typeof colorId !== 'number') {
        res.send(400, "id must be a number. You passed " + req.params.id);
        return next();
    }
    firebaseRef.child('colors').orderByChild('order').once('value', function (dataSnapshot) {
        var colorsHash = dataSnapshot.val();
        var color = undefined;
        Object.keys(colorsHash)
            .some(function (key) {
            var c = colorsHash[key];
            c.key = key;
            if (c.order === colorId) {
                color = c;
                return true;
            }
        });
        if (!color) {
            res.send(400, "No color found with id: " + colorId + ".");
            return next();
        }
        return firebaseRef.child('colors').child(color.key).remove()
            .then(function () {
            res.send(200);
            return next();
        })
            .catch(function (error) {
            res.send(500, error);
            return next();
        });
    });
});
server.post('/clear', function clear(req, res, next) {
    firebaseRef.child('colors').set([], function (error) {
        if (error) {
            res.send(500, error);
        }
        else {
            res.send(200);
        }
        return next();
    });
});
var port = process.env.port || 8080;
server.listen(port);
console.log("Listening on port: " + port);
//# sourceMappingURL=index.js.map