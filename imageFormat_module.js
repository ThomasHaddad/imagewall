var gm = require('gm').subClass({imageMagick: true});


/** @module imageFormat */

module.exports ={


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
            this.dirPath=path;
        },
        /**
         * Defines the futur image size and its ratio
         * @integer width
         * @integer height
         */
        setExpectedImageSize:function(width,height){
            this.expectedImageSize.width=width;
            this.expectedImageSize.height=height;
            this.expectedImageSize.ratio=this.expectedImageSize.width/this.expectedImageSize.height;
        },
        /**
         * Retrieves the current image size and expects a callback
         * @string imagePath
         * @boolean thanksApple
         * @function callback
         */
        getImageSize: function (imagePath, thanksApple, callback) {
            var self = this;
                gm(imagePath)
                    .size(function (err, data) {

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
         * @string imagePath
         * @string newFileName
         * @boolean thanksApple
         * @function callback
         */
        cropImage: function (imagePath, newFileName,thanksApple, callback) {
            var self = this;
            var newFilePath = self.dirPath + newFileName;
            if(!thanksApple){
                gm(imagePath)
                    .crop(self.newImageSize.width, self.newImageSize.height, self.cropValues.x, self.cropValues.y)
                    .write(newFilePath, function (err) {
                        if (err) throw err;
                        callback(newFilePath);
                    });
            }else{
                gm(imagePath)
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
         * @string fileName
         * @string expectedImageSize
         * @function callback
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
         * @object currentImageSize - width and height
         * @object newImageSize  - width and height
         */
        getCropValues: function (currentImageSize, newImageSize) {
            var self = this;
            self.cropValues.x = (currentImageSize.width - newImageSize.width) / 2;
            self.cropValues.y = (currentImageSize.height - newImageSize.height) / 2;
        },
        /**
         * Defines newImageSize
         * @object currentProps
         * @object expectedProps
         */
        getNewValues: function (currentProps, expectedProps) {
            var self = this;
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
         * @string imagePath
         * @string filteredName
         * @function callback
         */
        setMonochromeImage: function (imagePath, filteredName, callback) {
            var self = this;
            gm(imagePath)
                .monochrome()
                .write(self.dirPath + filteredName, function (err) {
                    if (err) throw err;
                    callback()
                });
        },
        /**
         * Charcoal filter and overwrites image
         * @string imagePath
         * @string filteredName
         * @function callback
         */
        setCharcoalImage: function (imagePath, filteredName, callback) {
            var self = this;
            gm(imagePath)
                .charcoal(1)
                .write(self.dirPath + filteredName, function (err) {
                    if (err) throw err;
                    callback()
                });
        },
        /**
         * LowColor filter and overwrites image
         * @string imagePath
         * @string filteredName
         * @function callback
         */
        setLowColorImage: function (imagePath, filteredName, callback) {
            var self= this;
            gm(imagePath)
                .colors(8)
                .write(self.dirPath + filteredName, function (err) {
                    if (err) throw err;
                    callback()
                });
        },
        /**
         * Negative filter and overwrites image
         * @string imagePath
         * @string filteredName
         * @function callback
         */
        setNegativeImage: function (imagePath, filteredName, callback) {
            var self= this;
            gm(imagePath)
                .negative()
                .write(self.dirPath + filteredName, function (err) {
                    if (err) throw err;
                    callback()
                });
        },
        /**
         * Sepia filter and overwrites image
         * @string imagePath
         * @string filteredName
         * @function callback
         */
        setSepiaImage: function (imagePath, filteredName, callback) {
            var self= this;
            gm(imagePath)
                .sepia()
                .write(self.dirPath + filteredName, function (err) {
                    if (err) throw err;
                    callback()
                });
        },
        /**
         * Colorized filter and overwrites image
         * @string imagePath
         * @string filteredName
         * @function callback
         */
        setColorizedImage: function (imagePath, filteredName, callback) {
            var self= this;
            gm(imagePath)
                .colorize(200, 200, 256)
                .write(self.dirPath + filteredName, function (err) {
                    if (err) throw err;
                    callback()
                });
        }


};
