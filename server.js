var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongoose = require('mongoose');
var fs = require('fs');
var path = require('path');
var bodyParser = require('body-parser');

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
app.use(bodyParser({uploadDir:'/tmp'}));

// URLS management

app.get('/', function (req, res) {
    res.render('index', { title: 'home', message: 'Hello there!'});
});

app.get('/add', function (req, res) {
    res.render('addImage', { title: 'add', message: 'add an image'});
});

app.post('/upload', function (req, res) {
    console.log(req.files);
    //var tempPath = req.files.file.path;
    //socket.emit('form image', tempPath);
    //console.log(tempPath);
    return false;
    //    targetPath = path.resolve('./uploads/image.png');
    //if (path.extname(req.files.file.name).toLowerCase() === '.png') {
    //    fs.rename(tempPath, targetPath, function(err) {
    //        if (err) throw err;
    //        console.log("Upload completed!");
    //    });
    //} else {
    //    fs.unlink(tempPath, function () {
    //        if (err) throw err;
    //        console.error("Only .png files are allowed!");
    //    });
    //}
    //// ...
});

http.listen(9000, function(){
    console.log('listening on *:9000');
});
