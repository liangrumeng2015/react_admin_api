/**
 * 模型对象
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
 // 创建Schema对象
var loginSchema = new Schema({
    username:{
        type:String,
        unique:true
    },
    password:{
        type:String,
        set:(val)=>{
            return require('bcrypt').hashSync(val,5)
        }
    },
    creat_time:{
        type:Number,
        default:new Date().getTime()
    }
})
var LoginModel = mongoose.model('login',loginSchema);
module.exports = LoginModel;