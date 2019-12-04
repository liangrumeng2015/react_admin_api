/**
 * category模型对象
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
 // 创建Schema对象
var categorySchema = new Schema({
    parentId:{
        type:String,
    },
    name:{
        type:String,
        unique:true
    }
})
var CategoryModel = mongoose.model('category',categorySchema);
module.exports = CategoryModel;