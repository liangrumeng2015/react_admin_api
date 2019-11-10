const express = require('express');
var router = express.Router();
var WXBizDataCrypt = require('../utils/WXBizDataCrypt')
var db = require('../config/db')
var WxLoginSchema = require('../model/wxlogin')
const request = require('request');
const {APPID,SECRET} = require('../utils/constant');

/**
 * 登录接口
 */
router.get('/wxlogin.do',async(req,res)=>{
    var code = req.query.code;
    var url = 'https://api.weixin.qq.com/sns/jscode2session?appid='+APPID+'&secret='+SECRET+'&js_code='+code+'&grant_type=authorization_code'
    request(url,(err,body)=>{
        if(!err){
            res.json({
                module:JSON.parse(body.body),
                msg:'成功',
                success:true
            })
        }else{
            res.json({
                msg:'失败',
                success:false
            })
        }
    })
})

/**
 * 获取openGid的解密接口
 */
router.post('/wxgetopenGid.do',(req,res)=>{
    
    var iv = req.body.iv;
    var sessionKey = req.body.session;
    var encryptedData = req.body.encryptedData
    var pc = new WXBizDataCrypt(APPID, sessionKey)
    var data = pc.decryptData(encryptedData , iv)
    if(data){
        res.json({
            msg:'解密成功',
            module:data,
            success:true
        })
    }else{
        res.json({
            msg:'解密失败',
            success:true
        })
    }
})

module.exports = router;