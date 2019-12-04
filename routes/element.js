var express = require('express');
var router = express.Router();
require('../config/db')
var elementUserModel = require('../model/elementUser');
var ObjectId = require('mongodb').ObjectId; //mongodb自带对象


router.get('/', (req, res) => {
    res.send({
        msg: 'element 接口可以正常访问'
    })
})
/**
 * 添加用户[注册用户]
 */
router.post('/addUser.do', async (req, res) => {
    const user = await elementUserModel.create({
        username: req.body.username,
        email: req.body.email,
        phone: req.body.phone,
        roles: req.body.roles,
        status: req.body.status
    }, (err, data) => {
        if (!err) {
            console.log(data);
            res.json({
                msg:'注册成功',
                module:data,
                success:true
            })
        } else {
            if(err.code == '11000'){
                res.json({
                    msg:'该用户名已经注册过了，请换个用户名',
                    success:false
                })
            }else{
                res.json({
                    msg:'注册失败，查看下后台日志',
                    success:false
                })
            }
        }
    })
})


/**
 * 获取用户列表信息 [需要分页的]
 */
router.post('/getUsersList.do', async(req, res) => {
    const pageNum = Number(req.body.pageNum);   // 第几页的数据
    const pageSize = Number(req.body.pageSize);    // 一页显示几条数据

    const total = await elementUserModel.find({}).countDocuments();
    const list = await elementUserModel.find({}).skip((pageNum-1)*pageSize).limit(pageSize);
    const pages = Math.ceil(total/pageSize);   // 一共显示多少页
    if(list){
        res.json({
            module:{list,total,pageNum,pageSize,pages},
            success:true
        })
    }else{
        res.json({
            module:[],
            msg:'暂无',
        })
    }
})

/**
 * 修改用户信息
 */
router.post('/editUser.do', async(req, res) => {
    // let username = req.body.name,
    //     email = req.body.email,
    //     phone = req.body.phone,
    //     roles = req.body.roles,
    //     status = req.body.status;
    // // if(username != ''){
    // //     username = username
    // // }else if()

    let username = req.body.username;
    let email = req.body.email;
    console.log('用户名',username == '');
    console.log('邮件',email);
    return;

    await elementUserModel.updateOne({
        _id:ObjectId(req.body.id)
    },{
        $set:{
            username:req.body.username,
            email:req.body.email,
            phone:req.body.phone,
            roles:req.body.roles,
            status:req.body.status
        }
    },(err)=>{
        console.log(err);
        if(!err){
            res.json({
                msg:'修改用户信息成功',
                success:true
            })
        }else{
            res.json({
                msg:'修改用户信息失败',
                success:false
            })
        }
    })
})

/**
 * 删除用户
 */
router.post('/deletUser', (req, res) => {

})

module.exports = router;