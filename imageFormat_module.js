var gm = require('gm').subClass({imageMagick: true});


/** @module imageFormat */

module.exports = {


    /**
     * String (already defined but can be changed)
     */
    dirPath: './public/uploads/',

    /**
     * Object
     */
    newImageSize: null,

    /**
     * Object
     */
    cropValues: {
        x: null,
        y: null
    },

    /**
     * Object
     */
    expectedImageSize: {
        width: 200,
        height: 150,
        ratio: 0
    },

    /**
     * Object
     */
    currentImageSize: {
        width: null,
        height: null,
        ratio: null
    },

    /**
     * Sets the directory path
     * @param {string} path
     */
    setDirectoryPath: function (path) {
        this.dirPath = path;
    },

    /**
     * Defines the futur image size and its ratio
     * @param {integer} width
     * @param {integer} height
     */
    setExpectedImageSize: function (width, height) {
        this.expectedImageSize.width = width;
        this.expectedImageSize.height = height;
        this.expectedImageSize.ratio = this.expectedImageSize.width / this.expectedImageSize.height;
    },

    /**
     * Retrieves the current image size and expects a callback
     * @param {string} imagePath
     * @param {boolean} thanksApple
     * @param {function} callback
     */
    getImageSize: function (imagePath, thanksApple, callback) {
        var self = this;
        gm(imagePath)
            .size(function (err, data) {
                if (!thanksApple) {
                    self.currentImageSize.width = data.width;
                    self.currentImageSize.height = data.height;
                    self.currentImageSize.ratio = data.width / data.height;

                } else {
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
     * @param {string} imagePath
     * @param {string} newFileName
     * @param {boolean} thanksApple
     * @param {function} callback
     */
    cropImage: function (imagePath, newFileName, thanksApple, callback) {
        var self = this;
        var newFilePath = self.dirPath + newFileName;
        //console.log('future formated filename : ' + newFileName);
        if (!thanksApple) {
            gm(imagePath)
                .crop(self.newImageSize.width, self.newImageSize.height, self.cropValues.x, self.cropValues.y)
                .write(newFilePath, function (err) {
                    if (err) throw err;
                    callback(newFilePath);
                });
        } else {
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
     * @param {string} fileName
     * @param {string} expectedImageSize
     * @param {function} callback
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
     * @param {json} currentImageSize
     * @param {json} newImageSize
     */
    getCropValues: function (currentImageSize, newImageSize) {
        var self = this;
        self.cropValues.x = (currentImageSize.width - newImageSize.width) / 2;
        self.cropValues.y = (currentImageSize.height - newImageSize.height) / 2;
    },

    /**
     * Defines newImageSize
     * @param {json} currentProps
     * @param {json} expectedProps
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
     * @param {string} imagePath
     * @param {string} filteredName
     * @param {function} callback
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
     * @param {string} imagePath
     * @param {string} filteredName
     * @param {function} callback
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
     * @param {string} imagePath
     * @param {string} filteredName
     * @param {function} callback
     */
    setLowColorImage: function (imagePath, filteredName, callback) {
        var self = this;
        gm(imagePath)
            .colors(8)
            .write(self.dirPath + filteredName, function (err) {
                if (err) throw err;
                callback()
            });
    },

    /**
     * Negative filter and overwrites image
     * @param {string} imagePath
     * @param {string} filteredName
     * @param {function} callback
     */
    setNegativeImage: function (imagePath, filteredName, callback) {
        var self = this;
        gm(imagePath)
            .negative()
            .write(self.dirPath + filteredName, function (err) {
                if (err) throw err;
                callback()
            });
    },

    /**
     * Sepia filter and overwrites image
     * @param {string} imagePath
     * @param {string} filteredName
     * @param {function} callback
     */
    setSepiaImage: function (imagePath, filteredName, callback) {
        var self = this;
        gm(imagePath)
            .sepia()
            .write(self.dirPath + filteredName, function (err) {
                if (err) throw err;
                callback()
            });
    },

    /**
     * Colorized filter and overwrites image
     * @param {string} imagePath
     * @param {string} filteredName
     * @param {function} callback
     */
    setColorizedImage: function (imagePath, filteredName, callback) {
        var self = this;
        gm(imagePath)
            .colorize(200, 200, 256)
            .write(self.dirPath + filteredName, function (err) {
                if (err) throw err;
                callback()
            });
    }
};
