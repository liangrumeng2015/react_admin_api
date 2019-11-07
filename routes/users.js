var express = require('express');
var router = express.Router();
require('../config/db')
var LoginModel = require('../model/login');
const SECRET = 'abcdefg'
const jwt = require('jsonwebtoken')
const request = require('request');




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
      console.log('注册成功')
    }else{
      console.log('注册失败')
    }
  })
  console.log('user的值',user)
  res.end();
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





module.exports = router;
