module.exports = {

    rawExtension: '',
    formatedExtension: '',
    filteredExtension: '',
    directory:'/uploads/',

    setDirectory:function(arg){
        this.directory=arg;
    },
    getDirectory:function(){
        return this.directory;
    },
    setRawExtension: function (arg) {
        this.rawExtension = arg;
    },
    setFormatedExtension: function (arg) {
        this.formatedExtension = arg;
    },
    setFilteredExtension: function (arg) {
        this.filteredExtension = arg;
    },
    getRawExtension: function () {
        return this.rawExtension;
    },
    getFormatedExtension: function () {
        return this.formatedExtension;
    },
    getFilteredExtension: function () {
        return this.filteredExtension;
    },
    getRawName: function (name) {
        return name.split('.')[0] + this.getRawExtension() + "." + name.split('.')[1];
    },
    getFormatedName: function (name) {
        return name.split('.')[0] + this.getFormatedExtension() + "." + name.split('.')[1];
    },
    getFilteredName: function (name) {
        return name.split('.')[0] + this.getFilteredExtension() + "." + name.split('.')[1];
    },
    setRawUrl: function (baseUrl, name) {
        return baseUrl + this.getDirectory() + name.split('.')[0] + this.getRawExtension() + "." + name.split('.')[1];
    },
    setFormatedUrl: function (baseUrl, name) {
        return baseUrl + this.getDirectory() + name.split('.')[0] + this.getFormatedExtension() + "." + name.split('.')[1];
    },
    setFilteredUrl: function (baseUrl, name) {
        return baseUrl + this.getDirectory() + name.split('.')[0] + this.getFilteredExtension() + "." + name.split('.')[1];
    }
};