var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var wxloginSchema = new Schema({
    code:{
        type:String
    }
})
var WxLoginSchema = mongoose.model('wxlogin',wxloginSchema);
module.exports = WxLoginSchema;