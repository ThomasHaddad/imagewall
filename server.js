'use strict';
var express = require('express');
var app = express();

// Loading modules
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongoose = require('mongoose');
var fs = require('fs');
var path = require('path');
var bodyParser = require('body-parser');
var multer = require('multer');
var cookieParser = require('cookie-parser');
var async = require('async');
var i = require('./image_module');
var imageManager = new i();

var gm = require('gm').subClass({imageMagick: true});
//configuring imageManager
imageManager.dirPath = './public/uploads/';
imageManager.expectedImageSize.ratio = imageManager.expectedImageSize.width / imageManager.expectedImageSize.height;

var nameManager = require('./name_module');
//configuring nameManager
nameManager.setRawExtension('-r');
nameManager.setFormatedExtension('-f');
nameManager.setFilteredExtension('-m');
nameManager.setDirectory('/uploads/');

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
            res.render('wall', {title: 'Wall', message: 'Image Wall', images: docs});
        }
    });
});

app.get('/add', function (req, res) {
    var newUser;
    User.findById(req.cookies.user, function (err, user) {
        if (err) throw err;
        if (user) {
            Image.findOne({owner: user._id}, function (err, img) {
                //console.log("User image : " + img);
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
    var baseUrl = req.protocol + '://' + req.get('host');
    var tempPath = req.files.image.path;
    var thanksApple = false;
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
                        gm(tempPath)
                            .identify(function (err, data) {
                                console.log(data.Properties);
                                if (data.Properties['exif:Make'] == "Apple") {
                                    this
                                        .autoOrient()
                                        .write(imageManager.dirPath + nameManager.getRawName(req.files.image.name), function (err) {
                                            fs.unlink(imageManager.dirPath + nameManager.getRawName(img.name), function (err) {
                                                if (err) throw err;
                                                callback(err, data);
                                            });
                                        });
                                }else{
                                    this
                                        .write(imageManager.dirPath + nameManager.getRawName(req.files.image.name), function (err) {
                                            fs.unlink(imageManager.dirPath + nameManager.getRawName(img.name), function (err) {
                                                if (err) throw err;
                                                callback(err, data);
                                            });
                                        });
                                }
                            });
                    },
                    // FORMATED IMAGE
                    function (callback) {
                        // manip d'image
                        gm(tempPath)
                            .identify(function (err, data) {
                                if (data.Properties['exif:Make'] == "Apple") {
                                    thanksApple = true;
                                }
                                imageManager.getImageSize(tempPath, thanksApple, function () {
                                    imageManager.cropImage(tempPath, nameManager.getFormatedName(req.files.image.name), thanksApple, function (newFilePath) {
                                        imageManager.resizeImage(newFilePath, imageManager.expectedImageSize, function (newFilePath) {
                                            gm(newFilePath)
                                                .write(imageManager.dirPath + nameManager.getFormatedName(req.files.image.name), function (err) {
                                                    fs.unlink(imageManager.dirPath + nameManager.getFormatedName(img.name), function (err) {
                                                        if (err) throw err;
                                                        callback(err, data);
                                                    });

                                                })
                                        });
                                    });
                                });
                            });
                    }
                ], function (data) {
                    fs.unlink(tempPath, function (err) {
                        if (err) throw err;
                        img.name = req.files.image.name;
                        img.contentType = req.files.image.mimetype;
                        img.rawUrl = nameManager.setRawUrl(baseUrl, img.name);
                        img.formatedUrl = nameManager.setFormatedUrl(baseUrl, img.name);
                        img.filteredUrl = null;
                        img.filterType = null;

                        img.save(function (err, image) {
                            if (err) throw err;
                            io.emit('imageAdded', {image: image.formatedUrl, client: req.cookies.user});
                            //res.contentType(image.contentType);
                            //res.redirect("/add");
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
                        gm(tempPath)
                            .identify(function (err, data) {
                                if (data.Properties['exif:Make'] == "Apple") {
                                    this
                                        .autoOrient()
                                        .write(imageManager.dirPath + nameManager.getRawName(req.files.image.name), function (err) {
                                            callback(err, data);
                                        });
                                }else{
                                    this
                                        .write(imageManager.dirPath + nameManager.getRawName(req.files.image.name), function (err) {
                                            callback(err, data);
                                        });
                                }

                            });

                    },
                    function (callback) {
                        gm(tempPath)
                            .identify(function (err, data) {
                                if (data.Properties['exif:Orientation'] == 6 && data.Properties['exif:Make'] == "Apple") {
                                    thanksApple = true;
                                }
                                imageManager.getImageSize(tempPath, thanksApple, function () {
                                    imageManager.cropImage(tempPath, nameManager.getFormatedName(req.files.image.name), thanksApple, function (newFilePath) {
                                        imageManager.resizeImage(newFilePath, imageManager.expectedImageSize, function () {
                                            callback(err, data);
                                        });
                                    });


                                })

                            });
                    }
                ], function (data) {
                    fs.unlink(tempPath, function (err) {
                        if (err) throw err;
                        var image = new Image;
                        image.name = req.files.image.name;
                        image.rawUrl = nameManager.setRawUrl(baseUrl, image.name);
                        image.formatedUrl = nameManager.setFormatedUrl(baseUrl, image.name);
                        image.contentType = req.files.image.mimetype;
                        image.owner = req.cookies.user;
                        image.filterType = null;

                        image.save(function (err, image) {
                            if (err) throw err;
                            io.emit('imageAdded', {image: image.formatedUrl, client: req.cookies.user});
                            //res.contentType(image.contentType);
                            //res.redirect("/add");
                            res.json(image.formatedUrl);
                        });
                    });
                });
            });
        }
    });
});

app.post('/filterImage', function (req, res) {
    var baseUrl = req.protocol + '://' + req.get('host');
    Image.findOne({owner: req.cookies.user}, function (err, img) {
        if (err) throw err;
        if (img) {

            if (req.body.value != 'Default') {
                imageManager['set' + req.body.value + 'Image'](imageManager.dirPath + nameManager.getFormatedName(img.name), nameManager.getFilteredName(img.name), function (err, data) {
                    if (err) throw err;

                    img.filteredUrl = nameManager.setFilteredUrl(baseUrl, img.name);
                    img.filterType = req.body.value;
                    img.save(function (err, image) {
                        if (err) throw err;
                        io.emit('imageFiltered', {image: image.filteredUrl, client: req.cookies.user});
                        res.json(image.filteredUrl);
                    });
                });
            } else {
                fs.unlink(imageManager.dirPath + nameManager.getFilteredName(img.name), function (err) {
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
    fs.readdir(imageManager.dirPath, function (err, files) {
        if (err) throw err;
        files.forEach(function (file) {
            fs.unlink(imageManager.dirPath + file, function () {
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

