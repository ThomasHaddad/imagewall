/** @module nameManager */

module.exports = {
    /**
     * string
     */
    rawExtension: '',
    /**
     * string
     */
    formatedExtension: '',
    /**
     * string
     */
    filteredExtension: '',
    /**
     * string
     */
    directory: '/uploads/',
    /** string
     *
     */
    baseUrl: "",

    /**
     * Defines url of the image (http://...) using req as parameter
     * @param request - json
     */
    setBaseUrl: function (request) {
        this.baseUrl = request.protocol + '://' + request.get('host');
    },
    /**
     *
     * @returns {string}
     */
    getBaseUrl: function () {
        return this.baseUrl;
    },
    /**
     *
     * @param dirName
     */
    setDirectory: function (dirName) {
        this.directory = dirName;
    },
    /**
     *
     * @returns {string}
     */
    getDirectory: function () {
        return this.directory;
    },
    /**
     *
     * @param arg
     */
    setRawExtension: function (arg) {
        this.rawExtension = arg;
    },
    /**
     *
     * @param arg
     */
    setFormatedExtension: function (arg) {
        this.formatedExtension = arg;
    },
    /**
     *
     * @param arg
     */
    setFilteredExtension: function (arg) {
        this.filteredExtension = arg;
    },
    /**
     *
     * @returns {string}
     */
    getRawExtension: function () {
        return this.rawExtension;
    },
    /**
     *
     * @returns {string}
     */
    getFormatedExtension: function () {
        return this.formatedExtension;
    },
    /**
     *
     * @returns {string}
     */
    getFilteredExtension: function () {
        return this.filteredExtension;
    },
    /**
     *
     * @param name - string
     * @returns {string}
     */
    getRawName: function (name) {
        return name.split('.')[0] + this.getRawExtension() + "." + name.split('.')[1];
    },
    /**
     *
     * @param name - string
     * @returns {string}
     */
    getFormatedName: function (name) {
        return name.split('.')[0] + this.getFormatedExtension() + "." + name.split('.')[1];
    },
    /**
     *
     * @param name - string
     * @returns {string}
     */
    getFilteredName: function (name) {
        return name.split('.')[0] + this.getFilteredExtension() + "." + name.split('.')[1];
    },
    /**
     *
     * @param request - json
     * @param name - string
     * @returns {string}
     */
    setRawUrl: function (request, name) {
        this.setBaseUrl(request);
        return this.getBaseUrl() + this.getDirectory() + name.split('.')[0] + this.getRawExtension() + "." + name.split('.')[1];
    },
    /**
     *
     * @param request - json
     * @param name - string
     * @returns {string}
     */
    setFormatedUrl: function (request, name) {
        this.setBaseUrl(request);
        return this.getBaseUrl() + this.getDirectory() + name.split('.')[0] + this.getFormatedExtension() + "." + name.split('.')[1];
    },
    /**
     *
     * @param request - json
     * @param name - string
     * @returns {string}
     */
    setFilteredUrl: function (request, name) {
        this.setBaseUrl(request);
        return this.getBaseUrl() + this.getDirectory() + name.split('.')[0] + this.getFilteredExtension() + "." + name.split('.')[1];
    }
};