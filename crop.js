var express = require('express');
var app = express();

// Loading modules
var http = require('http').Server(app);

var fs = require('fs');
var path = require('path');
var gm = require('gm').subClass({imageMagick: true});

//Configuring modules
app.set('view engine', 'jade');
app.set('views', __dirname + '/public/views');


app.use(express.static(path.join(__dirname, 'public')));


var newImageSize;
var cropValues={
    x:null,
    y:null
};
var expectedImageSize = {
    width: 200,
    height: 150,
    ratio: null
};
var currentImageSize = {
    width: null,
    height: null,
    ratio: null
};
var filteredImagePath;

app.get('/', function (req, res) {
    var fileName = "beach.jpg";
    var url = req.protocol + '://' + req.get('host') + "/uploads/";
    var imagePath='./public/uploads/beach.jpg';
    var cropImagePath='./public/uploads/beach-optimal.jpg';
    expectedImageSize.ratio = expectedImageSize.width / expectedImageSize.height;
    getImageSize(imagePath,function(){
        cropImage(imagePath,function(cropImageName){
            res.render('test', {original: url + fileName, optimal : url + cropImageName});
        });
    });

    //setMonochromeImage(cropImagePath,function(filteredPath){
    //    res.render('test', {original : url + "beach-optimal.jpg", optimal : url + filteredPath});
    //});

});


function getImageSize(imagePath,callback){
    gm(imagePath)
        .size(function (err, data) {
            console.log(data.width);
            currentImageSize.width = data.width;
            currentImageSize.height = data.height;
            currentImageSize.ratio = data.width / data.height;
            console.log(currentImageSize);
            getNewValues(currentImageSize,expectedImageSize);
            getCropValues(currentImageSize,newImageSize);
            callback(imagePath);
        });
}
function cropImage(imagePath,callback){
    gm(imagePath)
        .crop(newImageSize.width,newImageSize.height, cropValues.x,cropValues.y)
        .write('./public/uploads/beach-optimal.jpg', function (err) {
            if (!err) console.log('Fuck this has arrived');
            callback('beach-optimal.jpg');
        });
}
function getCropValues(currentImageInfo,newImageSize){
    cropValues.x= (currentImageInfo.width-newImageSize.width)/2;
    cropValues.y=(currentImageInfo.height-newImageSize.height)/2;
}
function getNewValues(currentProps,expectedProps){
    if(currentProps.width > currentProps.height){
        newImageSize =  {width : expectedProps.ratio * currentProps.height, height : currentProps.height}
    }else{
        newImageSize =  {width : currentProps.width, height : currentProps.width / expectedProps.ratio}

    }
}

function setMonochromeImage(imagePath,callback){
    gm(imagePath)
    .monochrome()
    .write('./public/uploads/beach-sepia.jpg', function(err){
        if (err) return console.dir(arguments)
            //res.render('test', {original: url + fileName, optimal : url + "beach-sepia.jpg"});
            callback("beach-sepia.jpg");
    });
}
function setCharcoalImage(imagePath,callback){
    gm(imagePath)
    .charcoal(1.5)
    .write('./public/uploads/beach-charcoal.jpg', function(err){
        if (err) return console.dir(arguments)
            //res.render('test', {original: url + fileName, optimal : url + "beach-charcoal.jpg"});
            callback()
    });
}
function setLowColorImage(imagePath,callback){
    gm(imagePath)
    .colors(8)
    .write('./public/uploads/beach-colors.jpg', function(err){
        if (err) return console.dir(arguments)
            //res.render('test', {original: url + fileName, optimal : url + "beach-colors.jpg"});
            callback()
    });
}
function setNegativeImage(imagePath,callback){
    gm(imagePath)
    .negative()
    .write('./public/uploads/beach-negative.jpg', function(err){
        if (err) return console.dir(arguments)
            //res.render('test', {original: url + fileName, optimal : url + "beach-negative.jpg"});
            callback()
    });
}
function SetSepiaImage(imagePath,callback){
    gm(imagePath)
    .sepia()
    .write('./public/uploads/beach-sepia.jpg', function(err){
        if (err) return console.dir(arguments)
            //res.render('test', {original: url + fileName, optimal : url + "beach-sepia.jpg"});
            callback()
    });
}

http.listen(9000, function () {
    console.log('listening on *:9000');
});
