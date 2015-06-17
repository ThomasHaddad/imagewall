var gm = require('gm').subClass({imageMagick: true});


/** @module imageFormat */

module.exports = function () {

    var i = {
        /**
         * string
         */
        dirPath: './public/uploads/',
        /**
         * json
         */
        newImageSize: null,
        /**
         * json
         */
        cropValues: {
            x: null,
            y: null
        },
        /**
         * json
         */
        expectedImageSize: {
            width: 200,
            height: 150,
            ratio: 0
        },
        /**
         * json
         */
        currentImageSize: {
            width: null,
            height: null,
            ratio: null
        },
        /**
         * Sets the directory path
         * @string path
         */
        setDirectoryPath:function(path){
            self.dirPath=path;
        },
        /**
         * Defines the futur image size and its ratio
         * @param width - integer
         * @param height - integer
         */
        setExpectedImageSize:function(width,height){
            self.expectedImageSize.width=width;
            self.expectedImageSize.height=height;
            self.expectedImageSize.ratio=self.expectedImageSize.width/self.expectedImageSize.height;
        },
        /**
         * Retrieves the current image size and expects a callback
         * @param imagePath - string
         * @param thanksApple - boolean
         * @param callback - function
         */
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
        /**
         * Crops the image, saves a new image and expects a callback
         * @param imagePath - string
         * @param newFileName - string
         * @param thanksApple - boolean
         * @param callback - function
         */
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
        /**
         * Resizes the image,overwrites it, and expects a callback
         * @param fileName - string
         * @param expectedImageSize - string
         * @param callback - function
         */
        resizeImage: function (fileName, expectedImageSize, callback) {
            gm(fileName)
                .resize(expectedImageSize.width, expectedImageSize.height)
                .write(fileName, function (err) {
                    if (err) throw err;
                    callback(fileName);
                });
        },
        /**
         * Retrieves the crop values to keep a correct ratio
         * @param currentImageSize - json
         * @param newImageSize  - json
         */
        getCropValues: function (currentImageSize, newImageSize) {
            self.cropValues.x = (currentImageSize.width - newImageSize.width) / 2;
            self.cropValues.y = (currentImageSize.height - newImageSize.height) / 2;
        },
        /**
         * Defines newImageSize
         * @param currentProps - json
         * @param expectedProps - json
         */
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

        /**
         * Monochrome filter and overwrites image
         * @param imagePath - string
         * @param filteredName - string
         * @param callback - function
         */
        setMonochromeImage: function (imagePath, filteredName, callback) {
            gm(imagePath)
                .monochrome()
                .write(self.dirPath + filteredName, function (err) {
                    if (err) throw err;
                    callback()
                });
        },
        /**
         * Charcoal filter and overwrites image
         * @param imagePath - string
         * @param filteredName - string
         * @param callback - function
         */
        setCharcoalImage: function (imagePath, filteredName, callback) {
            gm(imagePath)
                .charcoal(1)
                .write(self.dirPath + filteredName, function (err) {
                    if (err) throw err;
                    callback()
                });
        },
        /**
         * LowColor filter and overwrites image
         * @param imagePath - string
         * @param filteredName - string
         * @param callback - function
         */
        setLowColorImage: function (imagePath, filteredName, callback) {
            gm(imagePath)
                .colors(8)
                .write(self.dirPath + filteredName, function (err) {
                    if (err) throw err;
                    callback()
                });
        },
        /**
         * Negative filter and overwrites image
         * @param imagePath - string
         * @param filteredName - string
         * @param callback - function
         */
        setNegativeImage: function (imagePath, filteredName, callback) {
            gm(imagePath)
                .negative()
                .write(self.dirPath + filteredName, function (err) {
                    if (err) throw err;
                    callback()
                });
        },
        /**
         * Sepia filter and overwrites image
         * @param imagePath - string
         * @param filteredName - string
         * @param callback - function
         */
        setSepiaImage: function (imagePath, filteredName, callback) {
            gm(imagePath)
                .sepia()
                .write(self.dirPath + filteredName, function (err) {
                    if (err) throw err;
                    callback()
                });
        },
        /**
         * Colorized filter and overwrites image
         * @param imagePath - string
         * @param filteredName - string
         * @param callback - function
         */
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
