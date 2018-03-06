module.exports = class Util {

    makeid() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        
        for (var i = 0; i < 5; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        
        return text;
    }

    toHexBase16(s) {
        // utf8 to latin1
        var s = unescape(encodeURIComponent(s))
        var h = ''
        for (var i = 0; i < s.length; i++) {
            h += s.charCodeAt(i).toString(16)
        }
        return h
    }

}
