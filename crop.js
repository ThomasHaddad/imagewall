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


var dirPath = './public/uploadss/';
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

app.get('/', function (req, res) {
    var url = req.protocol + '://' + req.get('host') + "/uploadss/";
    var fileName = "tesbeau.jpg";
    var imagePath=dirPath+fileName;
    var optimalImageName='tesbeau-optimal.jpg';
    var filteredName = 'tesbeau-filtered.jpg';
    expectedImageSize.ratio = expectedImageSize.width / expectedImageSize.height;
    getImageSize(imagePath,function(){
        cropImage(imagePath,optimalImageName,function(newFilePath){
            resizeImage(newFilePath,expectedImageSize,function(resizedFilePath){
                setMonochromeImage(resizedFilePath,filteredName,function(){
                    res.render('test', {original: url + fileName, optimal : url + optimalImageName,filtered:url+filteredName});

                });
            });
        });
    });

    //setMonochromeImage(cropImagePath,function(filteredPath){
    //    res.render('test', {original : url + "beach-optimal.jpg", optimal : url + filteredPath});
    //});

});


function getImageSize(imagePath,callback){
    gm(imagePath)
        .size(function (err, data) {
            currentImageSize.width = data.width;
            currentImageSize.height = data.height;
            currentImageSize.ratio = data.width / data.height;
            getNewValues(currentImageSize,expectedImageSize);
            getCropValues(currentImageSize,newImageSize);
            callback();
        });
}
function cropImage(imagePath,newFileName,callback){
    var newFilePath=dirPath+newFileName;
    gm(imagePath)
        .crop(newImageSize.width,newImageSize.height, cropValues.x,cropValues.y)
        .write(newFilePath, function (err) {
            if(err) throw err;
            callback(newFilePath);
        });
}

function resizeImage(fileName, expectedImagesize,callback){
    gm(fileName)
        .resize(expectedImagesize.width,expectedImagesize.height)
        .write(fileName, function (err) {
            if(err) throw err;
            callback(fileName);
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

function setMonochromeImage(imagePath,filteredName,callback){
    gm(imagePath)
    .monochrome()
    .write(dirPath+filteredName, function(err){
        if (err) throw err;
        callback()
    });
}
function setCharcoalImage(imagePath,filteredName,callback){
    gm(imagePath)
    .charcoal(5)
    .write(dirPath+filteredName, function(err){
        if (err) throw err;
            callback()
    });
}
function setLowColorImage(imagePath,filteredName,callback){
    gm(imagePath)
    .colors(8)
    .write(dirPath+filteredName, function(err){
        if (err) throw err;
        callback()
    });
}
function setNegativeImage(imagePath,filteredName,callback){
    gm(imagePath)
    .negative()
    .write(dirPath+filteredName, function(err){
        if (err) throw err;
        callback()
    });
}
function setSepiaImage(imagePath,filteredName,callback){
    gm(imagePath)
    .sepia()
    .write(dirPath+filteredName, function(err){
        if (err) throw err;
        callback()
    });
}

http.listen(9000, function () {
    console.log('listening on *:9000');
});
