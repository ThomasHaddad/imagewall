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
var gd = require('node-gd');
var dirPath = './public/uploads/';


//Configuring modules
app.set('view engine', 'jade');
app.set('views', __dirname + '/public/views');
app.use(multer({dest: './uploads/'}));
//app.use(bodyParser({uploadDir: '/tmp'}));


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
    name: String,
    rawUrl: String,
    formatedUrl: String,
    filteredUrl: String,
    contentType: String,
    position: {}, // to be determined
    owner: {type: Schema.ObjectId, ref: "User", index: true},
    score: Number // to be determined
});

var UserSchema = mongoose.Schema({
    image: {type: Schema.ObjectId, ref: "Image", index: true}
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
        } else {
            var docs = {};
        }
        res.render('index', {title: 'home', message: 'Image Wall', images: docs});
    });
});

app.get('/add', function (req, res) {
    var imageData = {},
        user,
        newUser;
    User.findById(req.cookies.user, function (err, user) {
        console.log("Current user: " + user);
        if (err) throw err;
        if (user) {
            console.log(user._id);
            Image.findOne({owner: user._id}, function (err, img) {
                console.log("User image : " + img);
                if (err) throw err;

                if (img) {
                    imageData = img.rawUrl;
                    res.render('addImage', {title: 'add', message: 'add an image', image: imageData});
                } else {
                    res.render('addImage', {title: 'add', message: 'add an image'});

                }

            });
        } else {
            newUser = new User;
            newUser.save(function (err, user) {
                if (err) throw err;
                console.log("new user: " + user);
                res.cookie('user', user._id, {httpOnly: false});
                res.render('addImage', {title: 'add', message: 'add an image'});
            });
        }
    });
});

app.post('/upload', function (req, res) {
    var baseUrl = req.protocol + '://' + req.get('host');
    var absolutePath = baseUrl + "/uploads/" + req.files.image.name;
    var tempPath = req.files.image.path;
    var targetPath = dirPath + req.files.image.name;

    console.log("req files :" + req.files.image.name);


    Image.findOne({owner: req.cookies.user}, function (err, img) {
        if (err) throw err;
        if (img) {
            fs.rename(tempPath, targetPath, function (err) {
                if (err) throw err;
                fs.unlink(dirPath + img.name, function (err) {
                    if (err) throw err;

                    img.rawUrl = absolutePath;
                    img.name = req.files.image.name;
                    img.contentType = req.files.image.mimetype;
                    console.log(targetPath);

                    img.save(function (err, image) {
                        if (err) throw err;
                        console.error('image saved to mongo');
                        io.emit('imageAdded', {image: image.rawUrl, client: req.cookies.user});
                        res.contentType(image.contentType);
                        res.redirect("/add");
                    });

                });
            });
        } else {
            fs.rename(tempPath, targetPath, function (err) {
                if (err) throw err;

                var image = new Image;
                console.log(targetPath);
                image.rawUrl = absolutePath;
                image.name = req.files.image.name;
                image.contentType = req.files.image.mimetype;
                image.owner = req.cookies.user;

                image.save(function (err, image) {
                    if (err) throw err;
                    console.error('image saved to mongo');
                    io.emit('imageAdded', {image: image.rawUrl, client: req.cookies.user});
                    res.contentType(image.contentType);
                    res.redirect("/add");
                });

            });
        }
    });
});

app.get('/clear', function (req, res) {
    // Delete all the uploaded files
    fs.readdir(dirPath, function (err, files) {
        if (err) throw err;
        files.forEach(function (file) {
            console.log(file);
            fs.unlink(dirPath + file, function () {
                if (err) throw err;
                console.log('file sucessfully deleted');
            });
        })
    });

    // clears database
    User.remove({}, function () {
        Image.remove({}, function () {
            res.clearCookie('user');
            res.redirect('/');
        });
    });
});
http.listen(9000, function () {
    console.log('listening on *:9000');
});
