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
var dirPath = './public/uploads/';
var i = require('./image_module');
var imageManager = new i();
var gm = require('gm').subClass({imageMagick: true});

//configuring imageManager
imageManager.dirPath = './public/uploads/';
imageManager.expectedImageSize.ratio = imageManager.expectedImageSize.width / imageManager.expectedImageSize.height;


//Configuring modules
app.set('view engine', 'jade');
app.set('views', __dirname + '/public/views');
app.use(multer({dest: './uploads/'}));
app.use(bodyParser.urlencoded());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());


// database connection
mongoose.connect('mongodb://localhost/imagewall-dev', function (error) {
    if (error) {
        console.log(error);
    }
});
// CONFIG PROD
//app.set('host', '167.114.240.87');
//app.set('port', 9000);
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
    contentType: String,
    position: {}, // to be determined
    owner: {type: Schema.ObjectId, ref: "User", index: true},
    score: Number, // to be determined
    character: String,
    font: String
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
                    if (img.filteredUrl) {
                        imageData = img.filteredUrl;
                    } else {
                        imageData = img.formatedUrl;
                    }
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

//externaliser ça

function getRawName(name) {
    return name.split('.')[0] + '-r.' + name.split('.')[1];
}
function getFormatedName(name) {
    return name.split('.')[0] + '-f.' + name.split('.')[1];
}
function getFilteredName(name) {
    return name.split('.')[0] + '-m.' + name.split('.')[1];
}
function setRawUrl(baseUrl, name) {
    return baseUrl + "/uploads/" + name.split('.')[0] + '-r.' + name.split('.')[1];
}
function setFormatedUrl(baseUrl, name) {
    return baseUrl + "/uploads/" + name.split('.')[0] + '-f.' + name.split('.')[1];
}
function setFilteredUrl(baseUrl, name) {
    return baseUrl + "/uploads/" + name.split('.')[0] + '-m.' + name.split('.')[1];
}


app.post('/upload', function (req, res) {
    var baseUrl = req.protocol + '://' + req.get('host');
    var tempPath = req.files.image.path;
    if(req.files.image.mimetype.indexOf('image')==-1){
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
                            .write(dirPath + getRawName(req.files.image.name), function (err) {
                                fs.unlink(dirPath + getRawName(img.name), function (err) {
                                    if (err) throw err;
                                    callback(err, data);
                                });
                            });

                    },
                    // FORMATED IMAGE
                    function (callback) {
                        // manip d'image
                        imageManager.getImageSize(tempPath, function () {
                            imageManager.cropImage(tempPath, getFormatedName(req.files.image.name), function (newFilePath) {
                                imageManager.resizeImage(newFilePath, imageManager.expectedImageSize, function (newFilePath) {
                                    gm(newFilePath)
                                        .write(dirPath + getFormatedName(req.files.image.name), function (err) {
                                            fs.unlink(dirPath + getFormatedName(img.name), function (err) {
                                                callback(err, data);
                                            });

                                        })
                                });
                            });
                        });
                    }
                ], function (data) {
                    fs.unlink(tempPath, function (err) {
                        if (err) throw err;
                        img.name = req.files.image.name;
                        img.contentType = req.files.image.mimetype;
                        img.rawUrl = setRawUrl(baseUrl, img.name);
                        img.formatedUrl = setFormatedUrl(baseUrl, img.name);
                        img.filteredUrl = null;

                        img.save(function (err, image) {
                            if (err) throw err;
                            io.emit('imageAdded', {image: image.formatedUrl, client: req.cookies.user});
                            res.contentType(image.contentType);
                            res.redirect("/add");
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
                            .write(dirPath + getRawName(req.files.image.name), function (err) {
                                callback(err, data);
                            });

                    },
                    function (callback) {

                        imageManager.getImageSize(tempPath, function () {
                            imageManager.cropImage(tempPath, getFormatedName(req.files.image.name), function (newFilePath) {
                                imageManager.resizeImage(newFilePath, imageManager.expectedImageSize, function () {
                                    callback(err, data);
                                });
                            });
                        });

                    }
                ], function (data) {
                    fs.unlink(tempPath, function (err) {
                        if (err) throw err;
                        var image = new Image;
                        image.name = req.files.image.name;
                        image.rawUrl = setRawUrl(baseUrl, image.name);
                        image.formatedUrl = setFormatedUrl(baseUrl, image.name);
                        image.contentType = req.files.image.mimetype;
                        image.owner = req.cookies.user;


                        image.save(function (err, image) {
                            if (err) throw err;
                            io.emit('imageAdded', {image: image.formatedUrl, client: req.cookies.user});
                            res.contentType(image.contentType);
                            res.redirect("/add");
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
            if(req.body.eventType =="filter"){

                if(req.body.value!='default'){
                    imageManager['set' + req.body.value + 'Image'](dirPath + getFormatedName(img.name), getFilteredName(img.name), function (err, data) {
                        if (err) throw err;
                        //fs.unlink(dirPath + getFilteredName(img.name), function (err) {

                            img.filteredUrl = setFilteredUrl(baseUrl, img.name);
                            img.save(function (err, image) {
                                if (err) throw err;
                                io.emit('imageFiltered', {image: image.filteredUrl, client: req.cookies.user});
                                res.json(image.filteredUrl);
                            })
                        //})
                    });
                }else{
                    fs.unlink(dirPath + getFilteredName(img.name),function(err){
                        img.filteredUrl = null;
                        img.save(function (err, image) {
                            if (err) throw err;
                            io.emit('imageFiltered', {image: image.formatedUrl, client: req.cookies.user});
                            res.json(image.formatedUrl);
                        })
                    });
                }
            }
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
http.listen(80, function () {
    console.log('listening on *:80');
});
/**
 * Created by thomashaddad on 08/06/15.
 */
