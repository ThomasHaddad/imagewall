var fs = require('fs');
var gm = require('gm').subClass({imageMagick: true});
var nameManager = require('./name_module');
var i = require('./imageFormat_module');
var imageFormat = new i();

/** @module imageSaver */
module.exports = {
    /**
     * nameNamager dependency
     */
    nameManager: nameManager,
    /**
     * imageFormat dependency
     */
    imageFormat: imageFormat,
    /**
     * exif metadata parameter for Apple devices
     */
    thanksApple: false,
    /**
     *
     * @param request
     */
    setFilePath: function (request) {
        this.filePath = request.files.image.path;
    },
    /**
     * create a new raw image and delete the previous one
     * @param request - json
     * @param currentImage - string
     * @param callback - function
     */
    overwriteRawImage: function (request, currentImage, callback) {
        var self = this;
        self.setFilePath(request);
        gm(self.filePath)
            .identify(function (err, data) {
                if (data.Properties['exif:Make'] == "Apple") {
                    this
                        .autoOrient()
                        .write(self.imageFormat.dirPath + nameManager.getRawName(request.files.image.name), function (err) {
                            fs.unlink(self.imageFormat.dirPath + nameManager.getRawName(currentImage.name), function (err) {
                                if (err) throw err;
                                callback(err, data);
                            });
                        });
                } else {
                    this
                        .write(self.imageFormat.dirPath + nameManager.getRawName(request.files.image.name), function (err) {
                            fs.unlink(self.imageFormat.dirPath + nameManager.getRawName(currentImage.name), function (err) {
                                if (err) throw err;
                                callback(err, data);
                            });
                        });
                }
            });
    },
    /**
     * create a new formated image and delete the previous one
     * @param request - json
     * @param currentImage - string
     * @param callback - function
     */
    overwriteFormatedImage: function (request, currentImage, callback) {
        var self = this;
        self.setFilePath(request);
        gm(self.filePath)
            .identify(function (err, data) {
                if (data.Properties['exif:Make'] == "Apple") {
                    self.thanksApple = true;
                }
                self.imageFormat.getImageSize(self.filePath, self.thanksApple, function () {
                    self.imageFormat.cropImage(self.filePath, nameManager.getFormatedName(request.files.image.name), self.thanksApple, function (newFilePath) {
                        self.imageFormat.resizeImage(newFilePath, self.imageFormat.expectedImageSize, function (newFilePath) {
                            gm(newFilePath)
                                .write(self.imageFormat.dirPath + nameManager.getFormatedName(request.files.image.name), function (err) {
                                    fs.unlink(self.imageFormat.dirPath + nameManager.getFormatedName(currentImage.name), function (err) {
                                        if (err) throw err;
                                        callback(err, data);
                                    });

                                })
                        });
                    });
                });
            });
    },
    /**
     * create a new raw image
     * @param request - json
     * @param callback - function
     */
    saveNewRawImage: function (request, callback) {
        var self = this;
        self.setFilePath(request);
        gm(self.filePath)
            .identify(function (err, data) {
                if (data.Properties['exif:Make'] == "Apple") {
                    this
                        .autoOrient()
                        .write(self.imageFormat.dirPath + nameManager.getRawName(request.files.image.name), function (err) {
                            callback(err, data);
                        });
                } else {
                    this
                        .write(self.imageFormat.dirPath + nameManager.getRawName(request.files.image.name), function (err) {
                            callback(err, data);
                        });
                }

            });

    },
    /**
     * create a new formated image
     * @param request - json
     * @param callback - function
     */
    saveNewFormatedImage: function (request, callback) {
        var self = this;
        self.setFilePath(request);
        gm(self.filePath)
            .identify(function (err, data) {
                if (data.Properties['exif:Orientation'] == 6 && data.Properties['exif:Make'] == "Apple") {
                    self.thanksApple = true;
                }
                self.imageFormat.getImageSize(self.filePath, self.thanksApple, function () {
                    self.imageFormat.cropImage(self.filePath, nameManager.getFormatedName(request.files.image.name), self.thanksApple, function (newFilePath) {
                        self.imageFormat.resizeImage(newFilePath, self.imageFormat.expectedImageSize, function () {
                            callback(err, data);
                        });
                    });


                })

            });
    }
};