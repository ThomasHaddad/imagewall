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
var dir = "./public/uploads/originals/";

//Configuring modules

app.set('view engine', 'jade');
app.set('views', __dirname + '/public/views');
//app.use(bodyParser({uploadDir: '/tmp'}));
app.use(multer({uploadDir: '/tmp'}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(multer({
    dest: './public/uploads/originals',
    limits: {
        fieldSize: 999999999

    },
    onFileUploadStart : function(file){
        console.log('File recieved:');
        console.log(file);
    },
    onFileUploadData:function (file,data){
        console.log('Data recieved');
    },
    onParseEnd: function(req,next){
        next();
    },
    onFileSizeLimit: function (file) {
        console.log('Failed: ', file.originalname);
    }
}));
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
            _.each(docs, function (doc, key) {
                doc.data = new Buffer(doc.data).toString('base64');
                doc.owner = parseInt(doc.owner.toString())
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
                    imageData = img.data.toString('base64');
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
        //console.log("Cookies: ", req.cookies.user);
    });
});

app.post('/upload', [multer({dest: dir}), function (req, res) {
    var tempPath = req.files.image.path;
    var targetPath = dir + req.files.image.name;
    console.log("req files :"+req.files.image);
    Image.findOne({owner: req.cookies.user}, function (err, img) {
        if (err) throw err;
        if (img) {
            fs.rename(tempPath, targetPath, function(err) {
                if (err) throw err;
                // delete the temporary file
                fs.unlink(tempPath, function() {
                    if (err) {
                        throw err;
                    }else{
                        //response logic ...
                    };
                });
            });
            img.data = fs.readFileSync(tempPath);
            img.contentType = req.files.image.mimetype;
            img.save(function (err, image) {
                if (err) throw err;
                console.error('image saved to mongo');
                io.emit('imageAdded', {image: image.data.toString('base64'), client: req.cookies.user});
                res.contentType(image.contentType);
                //console.log("less new image: "+image);
                res.send(image.data);
            });
        } else {
            fs.rename(tempPath, targetPath, function(err) {
                if (err) throw err;
                fs.unlink(tempPath, function() {
                    if (err) {
                        throw err;
                    }else{
                        //response logic ...
                    };
                });
            });
            var image = new Image;
            image.data = fs.readFileSync(tempPath);
            image.contentType = req.files.image.mimetype;
            image.owner = req.cookies.user;
            image.save(function (err, image) {
                if (err) throw err;
                console.error('image saved to mongo');
                io.emit('imageAdded', {image: image.data.toString('base64'), client: req.cookies.user});
                res.contentType(image.contentType);
                //console.log("new image: "+image.data);
                res.send(image.data);
            });
        }
    });
}]);

app.get('/clear', function (req, res) {
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
