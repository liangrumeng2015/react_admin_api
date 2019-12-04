/**
 * element项目的的 用户 模型对象
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//创建Schema对象
var elementUserSchema = new Schema({
    username:{
        type:String,
        unique:true
    },
    email:{
        type:String
    },
    phone:{
        type:String
    },
    roles:{
        type:String
    },
    status:{
        type:Boolean
    }
})
var elementUserModel = mongoose.model('elementUser',elementUserSchema);
module.exports = elementUserModel;