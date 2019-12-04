/**
 * product模型对象
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
 // 创建Schema对象
var productSchema = new Schema({
    name:{    // 产品名称 string
        type:String,
        unique:true
    },   
    desc:{   // 产品描述 string
        type:String
    },   
    price:  {    // 产品价格 number
        type:Number
    },   
    status: {   // 产品状态   0 下架   1在售
        type:Number
    }    
})
var ProductModel = mongoose.model('product',productSchema);
module.exports = ProductModel;