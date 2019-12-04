/**
 * 定义一个模块，用来连接mongodb数据库
 * 
 */
var mongoose = require('mongoose');

mongoose.set('useCreateIndex', true)
mongoose.connect('mongodb://localhost/test',{useNewUrlParser: true ,useUnifiedTopology: true})
mongoose.connection.once('open',function(){
    console.log('数据库连接成功')
})

