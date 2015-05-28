var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongoose = require('mongoose');
var fs = require('fs');
var path = require('path');
var bodyParser = require('body-parser');
var multer  = require('multer');

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
    data: Buffer,
    contentType:String,
    position: {},
    owner: String,
    score: Number
});
// Mongoose Model definition
var Image = mongoose.model('images', ImageSchema);

// Bootstrap express
app.set('view engine', 'jade');
app.use(bodyParser({uploadDir:'/tmp'}));
app.use(multer({uploadDir:'/tmp'}));

// URLS management

app.get('/', function (req, res) {
    res.render('index', { title: 'home', message: 'Hello there!'});
});

app.get('/add', function (req, res) {
    res.render('addImage', { title: 'add', message: 'add an image'});
});

app.post('/upload', function (req, res) {
    var image=new Image;
    var tempPath = req.files.image.path;
    image.data=fs.readFileSync(tempPath);
    image.contentType=req.files.image.mimetype;
    image.save(function(err,image){
        if (err) throw err;
        console.error('image saved to mongo');
        Image.findById(image, function (err, doc) {
            if (err) return next(err);
            res.contentType(doc.contentType);
            res.send(doc.data);
        });
    });
    //socket.emit('form image', tempPath);
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
