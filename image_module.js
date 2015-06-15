var gm = require('gm').subClass({imageMagick: true});


module.exports = function () {

    var i = {
        self: self,
        dirPath: './public/uploads/',
        newImageSize: null,
        cropValues: {
            x: null,
            y: null
        },
        expectedImageSize: {
            width: 200,
            height: 150,
            ratio: 0
        },
        currentImageSize: {
            width: null,
            height: null,
            ratio: null
        },
        getImageSize: function (imagePath, thanksApple, callback) {

                gm(imagePath)
                    .size(function (err, data) {

                        console.log(data);
                        if(!thanksApple){
                            self.currentImageSize.width = data.width;
                            self.currentImageSize.height = data.height;
                            self.currentImageSize.ratio = data.width / data.height;

                        }else{
                            self.currentImageSize.width = data.height;
                            self.currentImageSize.height = data.width;
                            self.currentImageSize.ratio = data.height / data.width;
                        }
                        self.getNewValues(self.currentImageSize, self.expectedImageSize);
                        self.getCropValues(self.currentImageSize, self.newImageSize);
                        callback();
                    });

        },
        cropImage: function (imagePath, newFileName,thanksApple, callback) {
            var newFilePath = self.dirPath + newFileName;
            //console.log('future formated filename : ' + newFileName);
            if(!thanksApple){
                gm(imagePath)
                    .crop(self.newImageSize.width, self.newImageSize.height, self.cropValues.x, self.cropValues.y)
                    .write(newFilePath, function (err) {
                        if (err) throw err;
                        callback(newFilePath);
                    });
            }else{
                gm(imagePath)
                    //.rotate("white",90)
                    .crop(self.newImageSize.height, self.newImageSize.width, self.cropValues.y, self.cropValues.x)
                    .autoOrient()
                    .write(newFilePath, function (err) {
                        if (err) throw err;
                        callback(newFilePath);
                    });
            }
        },
        resizeImage: function (fileName, expectedImagesize, callback) {
            gm(fileName)
                .resize(self.expectedImageSize.width, self.expectedImageSize.height)
                .write(fileName, function (err) {
                    console.log(self.expectedImageSize);
                    if (err) throw err;
                    callback(fileName);
                });
        },
        getCropValues: function (currentImageSize, newImageSize) {
            self.cropValues.x = (currentImageSize.width - newImageSize.width) / 2;
            self.cropValues.y = (currentImageSize.height - newImageSize.height) / 2;
        },
        getNewValues: function (currentProps, expectedProps) {
            if (currentProps.width > currentProps.height) {
                self.newImageSize = {
                    width: expectedProps.ratio * currentProps.height,
                    height: currentProps.height
                }
            } else {
                self.newImageSize = {
                    width: currentProps.width,
                    height: currentProps.width / expectedProps.ratio
                }

            }
        },
        setMonochromeImage: function (imagePath, filteredName, callback) {
            gm(imagePath)
                .monochrome()
                .write(self.dirPath + filteredName, function (err) {
                    if (err) throw err;
                    callback()
                });
        },
        setCharcoalImage: function (imagePath, filteredName, callback) {
            gm(imagePath)
                .charcoal(1)
                .write(self.dirPath + filteredName, function (err) {
                    if (err) throw err;
                    callback()
                });
        },
        setLowColorImage: function (imagePath, filteredName, callback) {
            gm(imagePath)
                .colors(8)
                .write(self.dirPath + filteredName, function (err) {
                    if (err) throw err;
                    callback()
                });
        },
        setNegativeImage: function (imagePath, filteredName, callback) {
            gm(imagePath)
                .negative()
                .write(self.dirPath + filteredName, function (err) {
                    if (err) throw err;
                    callback()
                });
        },
        setSepiaImage: function (imagePath, filteredName, callback) {
            gm(imagePath)
                .sepia()
                .write(self.dirPath + filteredName, function (err) {
                    if (err) throw err;
                    callback()
                });
        },
        setColorizedImage: function (imagePath, filteredName, callback) {
            gm(imagePath)
                .colorize(200, 200, 256)
                .write(self.dirPath + filteredName, function (err) {
                    if (err) throw err;
                    callback()
                });
        }
    };
    var self = i;
    return i;
};
