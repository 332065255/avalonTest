define([
    'require',
    'avalon2'
], function(require, avalon2) {
    'use strict';
    let vm = avalon2.define({
        $id: "tab1",
        name: "富强、民主、文明、和谐、自由、平等、公正、法治、爱国、敬业、诚信、友善1",
    });

    function getHtml() {
        return "<div ms-controller='tab1'>" +
            "<div>{{@name}}</div>" +
            "</div>";
    }
    return getHtml();
});