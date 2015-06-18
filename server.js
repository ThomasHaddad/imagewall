'use strict';
var express = require('express');
var app = express();

// Loading modules
var http = require('http').Server(app);
var mongoose = require('mongoose');
var fs = require('fs');
var path = require('path');

//websocket handler
var io = require('socket.io')(http);

//form handlers
var bodyParser = require('body-parser');
var multer = require('multer');

//cookie handler
var cookieParser = require('cookie-parser');

//async for parallels functions
var async = require('async');


// image module : covering saving,naming,filtering,cropping,resizing... everything
var imageSaver = require('./imageSaver_module');

//configuring imageSaver.imageFormat
imageSaver.imageFormat.setDirectoryPath('./public/uploads/');
imageSaver.imageFormat.setExpectedImageSize(200,150);

//configuring imageSaver.nameManager
imageSaver.nameManager.setRawExtension('-r');
imageSaver.nameManager.setFormatedExtension('-f');
imageSaver.nameManager.setFilteredExtension('-m');
imageSaver.nameManager.setDirectory('/uploads/');

//Configuring modules
app.set('view engine', 'jade');
app.set('views', __dirname + '/public/views');
app.use(multer({dest: './uploads/'}));
app.use(bodyParser.urlencoded());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());


// CONFIG DEV
app.set('port','9000');
mongoose.connect('mongodb://localhost/imagewall-dev', function (error) {
    if (error) {
        console.log(error);
    }
});
// CONFIG PROD
//app.set('host', '167.114.240.87');
//app.set('port', 80);
//
//// database connection
//mongoose.connect('mongodb://127.0.0.1:27017/imagewall', function (error) {
//    if (error) {
//        console.log(error);
//    }
//});


// Schemas Definitions
var Schema = mongoose.Schema;
var ImageSchema = new Schema({
    name: String,
    rawUrl: String,
    formatedUrl: String,
    filteredUrl: String,
    filterType: String,
    contentType: String,
    owner: {type: Schema.ObjectId, ref: "User"},
    message: String
});

var UserSchema = mongoose.Schema({
    image: {type: Schema.ObjectId, ref: "Image"}
});

// Mongoose Model definition
var Image = mongoose.model('images', ImageSchema);
var User = mongoose.model('users', UserSchema);



// URLS management
app.get('/',function(req,res){
    res.render('index', {title: 'Home'});
});


app.get('/show-wall', function (req, res) {
    Image.find({}, function (err, docs) {
        if (!err) {
        } else {
            var docs = {};
        }
        if(req.cookies.user){
            res.render('wall', {title: 'Wall', message: 'Image Wall', images: docs, client:req.cookies.user});
        }else{
            res.render('wall', {title: 'Wall', message: 'Image Wall', images: docs, client:false});
        }
    });
});

app.get('/add', function (req, res) {
    var newUser;
    User.findById(req.cookies.user, function (err, user) {
        if (err) throw err;
        if (user) {
            Image.findOne({owner: user._id}, function (err, img) {
                if (err) throw err;

                if (img) {
                    res.render('addImage', {title: 'add', message: 'Change your image', image: img});
                } else {
                    res.render('addImage', {title: 'add', message: 'Add an image'});

                }

            });
        } else {
            newUser = new User;
            newUser.save(function (err, user) {
                if (err) throw err;
                res.cookie('user', user._id, {httpOnly: false});
                res.render('addImage', {title: 'add', message: 'Add an image'});
            });
        }
    });
});

app.post('/upload', function (req, res) {
    var tempPath = req.files.image.path;
    if (req.files.image.mimetype.indexOf('image') == -1) {
        res.json('Only images are accepted');
        res.end();
    }
    Image.findOne({owner: req.cookies.user}, function (err, img) {
        if (err) throw err;
        if (img) {
            fs.readFile(tempPath, function (err, data) {
                if (err) throw err;
                async.parallel([
                    // RAW IMAGE
                    function (callback) {
                        imageSaver.overwriteRawImage(req,img,callback);
                    },
                    // FORMATED IMAGE
                    function (callback) {
                        // manip d'image
                        imageSaver.overwriteFormatedImage(req,img,callback);
                    }
                ], function (data) {
                    fs.unlink(tempPath, function (err) {
                        if (err) throw err;
                        img.name = req.files.image.name;
                        img.contentType = req.files.image.mimetype;
                        img.rawUrl = imageSaver.nameManager.setRawUrl(req, img.name);
                        img.formatedUrl = imageSaver.nameManager.setFormatedUrl(req, img.name);
                        img.filteredUrl = null;
                        img.filterType = null;

                        img.save(function (err, image) {
                            if (err) throw err;
                            io.emit('imageAdded', {image: image.formatedUrl, client: req.cookies.user});
                            res.json(image.formatedUrl);
                        });
                    });

                })
            });
        } else {
            fs.readFile(tempPath, function (err, data) {

                if (err) throw err;
                async.parallel([
                    function (callback) {
                        imageSaver.saveNewRawImage(req,callback)
                    },
                    function (callback) {
                        imageSaver.saveNewFormatedImage(req,callback)
                    }
                ], function (data) {
                    fs.unlink(tempPath, function (err) {
                        if (err) throw err;
                        var image = new Image;
                        image.name = req.files.image.name;
                        image.rawUrl = imageSaver.nameManager.setRawUrl(req, image.name);
                        image.formatedUrl = imageSaver.nameManager.setFormatedUrl(req, image.name);
                        image.contentType = req.files.image.mimetype;
                        image.owner = req.cookies.user;
                        image.filterType = null;

                        image.save(function (err, image) {
                            if (err) throw err;
                            io.emit('imageAdded', {image: image.formatedUrl, client: req.cookies.user});
                            res.json(image.formatedUrl);
                        });
                    });
                });
            });
        }
    });
});

app.post('/filterImage', function (req, res) {
    Image.findOne({owner: req.cookies.user}, function (err, img) {
        if (err) throw err;
        if (img) {

            if (req.body.value != 'None') {
                imageSaver.imageFormat['set' + req.body.value + 'Image'](imageSaver.imageFormat.dirPath + imageSaver.nameManager.getFormatedName(img.name), imageSaver.nameManager.getFilteredName(img.name), function (err, data) {
                    if (err) throw err;

                    img.filteredUrl = imageSaver.nameManager.setFilteredUrl(req, img.name);
                    img.filterType = req.body.value;
                    img.save(function (err, image) {
                        if (err) throw err;
                        io.emit('imageFiltered', {image: image.filteredUrl, client: req.cookies.user});
                        res.json(image.filteredUrl);
                    });
                });
            } else {
                fs.unlink(imageSaver.imageFormat.dirPath + imageSaver.nameManager.getFilteredName(img.name), function (err) {
                    img.filteredUrl = null;
                    img.filterType = null;
                    img.save(function (err, image) {
                        if (err) throw err;
                        io.emit('imageFiltered', {image: image.formatedUrl, client: req.cookies.user});
                        res.json(image.formatedUrl);
                    })
                });
            }
        }
    });
});

app.post('/sendMessage', function (req, res) {
    Image.findOne({owner: req.cookies.user}, function (err, img) {
        if (err) throw err;
        if (img) {
            img.message = req.body.value;
            img.save(function (err, image) {
                if (err) throw err;
                io.emit('messageSent', {message: image.message, client: req.cookies.user});
                res.json(image.message);
            });
        }
    });
});

app.get('/clear', function (req, res) {
    // Delete all the uploaded files
    fs.readdir(imageSaver.imageFormat.dirPath, function (err, files) {
        if (err) throw err;
        files.forEach(function (file) {
            fs.unlink(imageSaver.imageFormat.dirPath + file, function () {
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

http.listen(app.get('port'), function () {
    console.log('listening on *:'+app.get('port'));
});

