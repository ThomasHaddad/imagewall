var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/imagewall-dev', function (error) {
    if (error) {
        console.log(error);
    }
});

io.on('connection', function(socket){
    console.log('a user connected');
    socket.on('disconnect', function(){
        console.log('user disconnected');
    });
});

var Schema = mongoose.Schema;
var ImageSchema = new Schema({
    url: String,
    position: String,
    owner: String
});

// Mongoose Model definition
var Image = mongoose.model('images', ImageSchema);

// Bootstrap express
app.set('view engine', 'jade');

// URLS management

app.get('/', function (req, res) {
    res.render('index', { title: 'home', message: 'Hello there!'});
});

app.get('/add', function (req, res) {
    res.render('addImage', { title: 'add', message: 'add an image'});
});

http.listen(9000, function(){
    console.log('listening on *:9000');
});
