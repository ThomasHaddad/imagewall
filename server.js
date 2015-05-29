var express = require('express');
var app = express();

// Loading modules
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongoose = require('mongoose');
var fs = require('fs');
var path = require('path');
//var bodyParser = require('body-parser');
var multer = require('multer');
var _ = require('lodash');
var cookieParser = require('cookie-parser');

//Configuring modules

app.set('view engine', 'jade');
app.set('views', __dirname + '/public/views');
//app.use(bodyParser({uploadDir: '/tmp'}));
app.use(multer({uploadDir: '/tmp'}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

// database connection
mongoose.connect('mongodb://localhost/imagewall-dev', function (error) {
    if (error) {
        console.log(error);
    }
});
var Schema = mongoose.Schema;
var ImageSchema = new Schema({
    data: Buffer,
    contentType: String,
    position: {}, // to be determined
    owner: {type: Schema.ObjectId, ref: "Image", index: true},
    score: Number // to be determined
});

var UserSchema = mongoose.Schema({
    image: {type: Schema.ObjectId, ref: "User", index: true}
});

// Mongoose Model definition
var Image = mongoose.model('images', ImageSchema);
var User = mongoose.model('users', UserSchema);


// Socket connection
io.on('connection', function (socket) {
    console.log('a user connected');
    socket.on('disconnect', function () {
        console.log('user disconnected');
    });
});


// URLS management

app.get('/', function (req, res) {
    Image.find({}, function (err, docs) {
        if (!err) {
            _.each(docs, function (doc, key) {
                doc.data = new Buffer(doc.data).toString('base64');
            });
            console.log(docs);
        } else {
            var docs = {};
            throw err;
        }
        res.render('index', {title: 'home', message: 'Image Wall', images: docs});
    });
});

app.get('/add', function (req, res) {
    var image,user;
    User.findById(req.cookies.user, function (err, user) {
        console.log(user);
        console.log(err);
        if (!err) {
            Image.findById(user.image, function (err, img) {
                image = img;
            });
        } else {
            user = new User;
            user.save(function (err, user) {
                res.cookie('user', user._id, {httpOnly: true});
            });
            image = {};
        }
    });
    console.log("Cookies: ", req.cookies.user);
    res.render('addImage', {title: 'add', message: 'add an image'});
});

app.post('/upload', function (req, res) {
    var image = new Image;
    var tempPath = req.files.image.path;
    image.data = fs.readFileSync(tempPath);
    console.log(image.data);
    image.contentType = req.files.image.mimetype;

    image.save(function (err, image) {
        if (err) throw err;
        console.error('image saved to mongo');
        Image.findById(image, function (err, doc) {
            if (err) return next(err);
            io.emit('imageAdded', doc.data.toString('base64'));
            res.contentType(doc.contentType);
            res.send(doc.data);
        });
    });

    return false;
});

http.listen(9000, function () {
    console.log('listening on *:9000');
});
