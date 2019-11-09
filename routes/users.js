const express = require('express');
const formidable = require('formidable');
const path = require('path');
var router = express.Router();
require('../config/db')
var LoginModel = require('../model/login');
var CategoryModel = require('../model/category');
var ProductModel = require('../model/product');

const SECRET = 'abcdefg'
const jwt = require('jsonwebtoken')
const request = require('request');
var ObjectId = require('mongodb').ObjectId;   //mongodb自带对象


/**
 * 查询用户列表接口
 */
router.get('/api/users', async (req, res)=>{
  const users = await LoginModel.find({});
  res.send(users);
});


/**
 * 注册接口
 */
router.post('/api/register.do',async (req,res)=>{
  const user = await LoginModel.create({
    username:req.body.username,
    password:req.body.password
  },function(err){
    if(!err){
      res.json({
        msg:'注册成功',
        success:true
      })
    }else{
      res.json({
        msg:'注册失败,用户名已存在',
        success:true
      })
    }
  })
})

/**
 * 登录接口
 * status: 0 成功、 1 失败
 * 
 */
router.post('/api/login.do',async (req,res)=>{
  // 判断用户名
  const user = await LoginModel.findOne({
    username:req.body.username
  })
  if(!user){
    return res.status(422).send({
      status:1,
      message:'用户名不存在'
    })
  }
  // 判断密码
  const isPasswordValid = require('bcrypt').compareSync(
    req.body.password,
    user.password
  )
  if(!isPasswordValid){
    return res.status(422).send({
      status:1,
      message:'密码无效'
    })
  }
  const token = jwt.sign({
    id:String(user._id)
  },SECRET)
  // 返回结果
  res.send({
    status:0,
    data:user,
    token,
    message:'ok'
  }) 
  res.end();
})

/**
 * auth 中间件
 */
const auth = async (req,res,next)=>{
  const raw = String(req.headers.authorization).split(' ').pop();
  const {id} = jwt.verify(raw,SECRET);   // 解密token
  req.user = await LoginModel.findById(id);
  next();
}

/**
 * 获取用户信息接口
 */
router.get('/api/profile.do',auth,async (req,res)=>{
  res.send({
    user:req.user,
    message:'ok'
  });
  res.end();
})

/**
 * 获取天气预报接口
 * https://tianqiapi.com/user/ 
 * 用户名：lemon
 * 密码：lemon
 *   
 * /api/weather.do接口get请求
 * @params{
 *      version: v1或者v6免费接口
 *      city:城市名称
 * }
 *      
 */
const appid = '99623372'
const appsecret = 'Yg5VxuNZ'
router.get('/api/weather.do',async (req,res)=>{
  let version = req.query.version
  let city = encodeURI(req.query.city)
  const url = 'https://www.tianqiapi.com/api?appid='+appid+'&appsecret='+appsecret+'&version'+ version+'&city='+city;
  request(url,(error,reponse,body)=>{
    if(!error){
      res.json({
        body:JSON.parse(body),
        'success':true
      })
    }else{
      res.json({
        'success':false
      })
    }
  })
})


/**
 * 获取分类列表
 */
router.get('/api/category/getCategoryList.do',async (req,res)=>{
  const parentId = req.query.parentId;
  const categoryList = await CategoryModel.find({parentId})
  res.json({
    categoryList,
    msg:'成功',
    success:true
  })
})


 /**
  * 添加分类
  */
router.post('/api/category/addCategory.do',async (req,res)=>{
  CategoryModel.create({
    parentId:req.body.parentId,
    name:req.body.name
  },(err)=>{
    console.log(err);
    if(!err){
      res.json({
        msg:'分类名称添加成功',
        success:true
      })
    }else{
      res.json({
        msg:'该分类名称已存在',
        success:false
      })
    }
  })
})

/**
 * 更新分类名称
 */
router.post('/api/category/updateCategory.do',async (req,res)=>{
  CategoryModel.updateOne({_id:ObjectId(req.body.id)},{$set:{name:req.body.name}},(err)=>{
    if(!err){
      res.json({
        msg:'更新成功',
        success:true
      })
    }else{
      res.json({
        msg:'更新失败，该分类名称已存在',
        success:false
      })
    }
  })
})


/**
 * 获取product的列表，需要分页的奥
 */
router.post('/api/product/getProductsList.do',async (req,res)=>{
  const pageNum = Number(req.body.pageNum);   // 第几页的数据
  const pageSize = Number(req.body.pageSize);   // 一页显示几条数据
  const total = await ProductModel.find({}).countDocuments();
  const list = await ProductModel.find({}).skip((pageNum-1)*pageSize).limit(pageSize)
  const pages = Math.ceil(total / pageSize)
  if(list){
    res.json({
      data:{list,total,pageNum,pageSize,pages},
      success:true
    })
  }
})

/**
 * 添加product
 */
router.post('/api/product/addProduct.do',async (req,res)=>{
  ProductModel.create({
    name:req.body.name,   // 产品名称 string
    desc:req.body.desc,   // 产品描述 string
    price:req.body.price,   // 产品价格 number
    x: req.body.status    // 产品状态   0 下架   1在售
  },(err)=>{
    if(!err){
      res.json({
        msg:'产品添加成功',
        success:true
      })
    }else{
      res.json({
        msg:'产品添加失败',
        success:false
      })
    }
  })
})

/**
 * 搜索产品分页列表
 */
router.post('/api/product/searchProduct.do',async (req,res)=>{
  const searchType = req.body.searchType;  // 产品类型   1  按照名称搜索    2 按照描述搜索
  const productTxt = req.body.productTxt;   // 搜索的内容
  const pageNum = req.body.pageNum;
  const pageSize = req.body.pageSize;
  let list = '',total;
  if(searchType === '1'){   // 按照产品名称
    list = await ProductModel.find({name:{$regex:productTxt,$options:"$i"}});
    total = list.length;
  }else if(searchType === '2'){   // 按照产品描述
    list = await ProductModel.find({desc:{$regex:productTxt,$options:"$i"}});
    total = list.length;
  }
  if(list){
    res.json({
      data:{list,total},
      success:true
    })
  }else{
    res.json({
      msg:'暂无',
      success:false
    })
  }
})

/**
 * 文件上传接口  
 */
router.post('/api/upload.do', async (req,res)=>{
  let form = new formidable.IncomingForm();
  form.encoding = 'utf-8'; // 编码
  // 保留扩展名
  form.keepExtensions = true;
  //文件存储路径 最后要注意加 '/' 否则会被存在public下
  form.uploadDir = path.join(__dirname, '../public/images/')
  // 解析 formData 数据
  form.parse(req, (err, fields ,files) => {
    if(!err){
      console.log('第一个！error')
      // let imgPath = files.file.path;
      let imgPath = req.body.imgPath;

      console.log('imgPath===',imgPath);
      return;
      ProductModel.updateOne({_id:ObjectId('5dc51e4e9463960f1df4b901') }, (err, data) => {
        if(!err){
          res.json({
            data,
            success:true
          })
        }
      })
    }else{
      res.json({
        msg:'解析formdata出错',
        success:false
      })
    }
  })
})

module.exports = router;
