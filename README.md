# ImageManager 

ImageManager is a stack created to help store images with `imageSaver` module.

imageSaver is written on top of `gm`(https://github.com/aheckmann/gm) for maximum efficiency.

## API

#### Installation

`$ npm install`

#### Usage

```js
var express = require('express')
var imageSaver = require('./imageSaver_module');

var app = express()

```

You have to define first the required parameters of the `imageSaver` dependencies to fully use it:

```js
//configuring imageSaver.imageFormat

// destination of images uploaded on server
imageSaver.imageFormat.setDirectoryPath('./your/path/to/dir');

// set desired width and height of formated image
imageSaver.imageFormat.setExpectedImageSize(desiredImageWidth,desiredImageHeight);



//configuring imageSaver.nameManager

// will create "nameOfYourImage-extension.jpg" for instance
imageSaver.nameManager.setRawExtension('-r');
imageSaver.nameManager.setFormatedExtension('-f');
imageSaver.nameManager.setFilteredExtension('-m');

// required to create absolute url to your image
imageSaver.nameManager.setDirectory('/uploads/');
```

It is highly recommended to use `multer`(https://github.com/expressjs/multer) or `body-parser`(https://github.com/expressjs/body-parser) to handle `multipart/form-data`.



## imageSaver 

imageSaver is a module built with to mandatory dependencies present in the stack : `imageFormat` and `nameManager` 


imageSaver will allow you to store an image. For example : 
```js
app.post('/upload', function (req, res) {
	imageSaver.saveNewRawImage(req,callback);
}
```
If you want to store both raw and formated image, it is recommended to use `async`(https://github.com/caolan/async) for better performances:

```js
async.parallel([
	function (callback) {
		imageSaver.saveNewRawImage(req,callback)
	},
    function (callback) {				                               
	    imageSaver.saveNewFormatedImage(req,callback)
    }
],function(data){
	// your callback
});
```
## imageSaver.imageFormat

This module allows you to apply some filters to an image. The following filters are available for now : 


* `setMonochromeImage(imagePath, filteredName, callback)`
* `setCharcoalImage(imagePath, filteredName, callback)`
* `setLowColorImage(imagePath, filteredName, callback)`
* `setNegativeImage(imagePath, filteredName, callback)`
* `setSepiaImage(imagePath, filteredName, callback)`
* `setColorizedImage(imagePath, filteredName, callback)`

For example : 
```js
var imageName = "yourImageName"
imageSaver.imageFormat.setSepiaImage(imageSaver.imageFormat.dirPath + imageSaver.nameManager.getFormatedName(imageName), imageSaver.nameManager.getFilteredName(imageName), function (err, data) {
	// your callback
});
```
