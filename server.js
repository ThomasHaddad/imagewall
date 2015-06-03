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
var async = require('async');
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
function getRawPath(dirPath,name){
    return dirPath+name.split('.')[0]+'-r.'+name.split('.')[1];
}
function getFormatedPath(dirPath,name){
    return dirPath+name.split('.')[0]+'-f.'+name.split('.')[1];
}

function setRawUrl(baseUrl,name){
    return baseUrl+ "/uploads/" +name.split('.')[0]+'-r.'+name.split('.')[1];
}
function setFormatedUrl(baseUrl,name){
    return baseUrl+ "/uploads/" +name.split('.')[0]+'-f.'+name.split('.')[1];
}

app.post('/upload', function (req, res) {
    var imageSize = {
        width: 200,
        height: 150
    };
    var baseUrl = req.protocol + '://' + req.get('host');
    var tempPath = req.files.image.path;


    Image.findOne({owner: req.cookies.user}, function (err, img) {
        if (err) throw err;
        if (img) {
            fs.readFile(tempPath , function(err, data) {
                if (err) throw err;
                async.parallel([
                    // RAW IMAGE
                    function (callback) {
                        fs.writeFile(getRawPath(dirPath,req.files.image.name), data, function (err) {
                            if (err) throw err;
                            fs.unlink(getRawPath(dirPath, img.name), function (err) {
                                if (err) throw err;
                                callback(err, data);
                            });
                        });
                    },
                    // FORMATED IMAGE
                    function (callback) {
                        fs.writeFile(getFormatedPath(dirPath,req.files.image.name), data, function (err) {
                            if (err) throw err;
                            fs.unlink(getFormatedPath(dirPath, img.name), function (err) {
                                if (err) throw err;
                                callback(err, data);
                            });
                        });
                    }
                ], function (data) {
                    img.name = req.files.image.name;
                    img.contentType = req.files.image.mimetype;
                    img.rawUrl = setRawUrl(baseUrl, img.name);
                    img.formatedUrl = setFormatedUrl(baseUrl, img.name);

                    img.save(function (err, image) {
                        if (err) throw err;
                        io.emit('imageAdded', {image: image.rawUrl, client: req.cookies.user});
                        res.contentType(image.contentType);
                        res.redirect("/add");
                    });
                })
            });
        } else {
            fs.readFile(tempPath , function(err, data) {
                if (err) throw err;
                async.parallel([
                    function (callback) {
                        fs.writeFile(getRawPath(dirPath,req.files.image.name), data, function (err) {
                            if (err) throw err;
                            console.log("raw image saved for first time")
                            callback(err, data);
                        });
                    },
                    function (callback) {
                        fs.writeFile(getFormatedPath(dirPath,req.files.image.name), data, function (err) {
                            if (err) throw err;
                            console.log("formated image saved for first time")
                            callback(err, data);
                        });
                    }
                ], function (data) {
                    console.log('callback async');
                    fs.unlink(tempPath,function(err){
                        if (err) throw err;
                        var image = new Image;
                        image.name = req.files.image.name;
                        image.rawUrl = setRawUrl(baseUrl, image.name);
                        image.formatedUrl = setFormatedUrl(baseUrl, image.name);
                        image.contentType = req.files.image.mimetype;
                        image.owner = req.cookies.user;


                        image.save(function (err, image) {
                            if (err) throw err;
                            io.emit('imageAdded', {image: image.rawUrl, client: req.cookies.user});
                            res.contentType(image.contentType);
                            res.redirect("/add");
                        });

                    });
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
