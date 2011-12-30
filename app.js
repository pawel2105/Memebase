var fs  =require('fs');
var http = require('http');
var mongo = require('mongodb');

var db = new mongo.Db('memebasedb', new mongo.Server("mongodb://brand.magnate@gmail.com:p3rception@ds029317.mongolab.com", 29317));
db.open();

server = http.createServer( function(req, res) {
    fs.readFile('index.html', function(err, page) {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(page);
        res.end();
    });
});
server.listen(13309);

// now.js code
var everyone = require("now").initialize(server, {socketio: {'transports': ['xhr-polling']}});

// publish meme
everyone.now.publish = function(meme) {
    if(meme.name && meme.text.line1 && meme.text.line2) {
        db.collection('memes', function(err, collection) {
            // add a date field and save
            meme.date = Date.now();
            collection.insert(meme, function(err) {
                if(!err)
                    everyone.now.receiveMeme(meme);
            });
        });
    }
};

// retrieve the latest few memes of a name. If there is no name, retrieve a mixture
everyone.now.getRecent = function(memeName) {
    var client = this;
    console.log("retrieving");
    db.collection('memes', function(err, collection) {
        if(memeName == undefined) {
            collection.find( {}, { sort: [[ "date", "desc" ]], limit: 25 }).toArray( function(err, docs) {
                client.now.getContent(docs);
            });
        }
        else {
            collection.find( {"name": memeName}, { sort: [[ "date", "desc" ]], limit: 25 }).toArray( function(err, docs) {
                client.now.getContent(docs);
            });
        }
    });
};
