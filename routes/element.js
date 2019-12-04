var express = require('express');
var router = express.Router();
require('../config/db')
var elementUserModel = require('../model/elementUser');
var ObjectId = require('mongodb').ObjectId; //mongodb自带对象

/**
 * 查看element里的接口是否可以正常访问
 */
router.get('/', (req, res) => {
    res.send({
        msg: 'element 接口可以正常访问'
    })
})
/**
 * 添加用户[注册用户]
 * @params username   用户名   [必传]
 * @params email     邮件    [必传]
 * @params phone   电话   [必传]
 * @params roles   角色   [必传]
 * @params status  状态   [必传]
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
                msg: '注册成功',
                module: data,
                success: true
            })
        } else {
            if (err.code == '11000') {
                res.json({
                    msg: '该用户名已经注册过了，请换个用户名',
                    success: false
                })
            } else {
                res.json({
                    msg: '注册失败，查看下后台日志',
                    success: false
                })
            }
        }
    })
})


/**
 * 获取用户列表信息 [需要分页的]
 * @params pageNum   第几页的数据       [必传]
 * @params pageSize  一页显示几条数据    [必传]
 */
router.post('/getUsersList.do', async (req, res) => {
    const pageNum = Number(req.body.pageNum); // 第几页的数据
    const pageSize = Number(req.body.pageSize); // 一页显示几条数据

    const total = await elementUserModel.find({}).countDocuments();
    const list = await elementUserModel.find({}).skip((pageNum - 1) * pageSize).limit(pageSize);
    const pages = Math.ceil(total / pageSize); // 一共显示多少页
    if (list) {
        res.json({
            module: {
                list,
                total,
                pageNum,
                pageSize,
                pages
            },
            success: true
        })
    } else {
        res.json({
            module: [],
            msg: '暂无',
        })
    }
})

/**
 * 修改用户信息
 * @params username   用户名   [非必传]
 * @params email     邮件    [非必传]
 * @params phone   电话   [非必传]
 * @params roles   角色   [非必传]
 * @params status  状态   [非必传]
 */
router.post('/editUser.do', async (req, res) => {
    let username = req.body.username,
        email = req.body.email,
        phone = req.body.phone,
        roles = req.body.roles,
        status = req.body.status;
    var obj = {};
    if (username) {
        obj['username'] = username;
    }
    if (email) {
        obj['email'] = email;
    }
    if (phone) {
        obj['phone'] = phone;
    }
    if (roles) {
        obj['roles'] = roles;
    }
    if (status) {
        obj['status'] = status;
    }
    console.log('得到的对象obj', obj);

    await elementUserModel.updateOne({
        _id: ObjectId(req.body.id)
    }, {
        $set: obj
    }, (err) => {
        console.log(err);
        if (!err) {
            res.json({
                msg: '修改用户信息成功',
                success: true
            })
        } else {
            if (err.code == '11000') {
                res.json({
                    msg: '该用户名已被占用',
                    success: false
                })
            } else {
                res.json({
                    msg: '修改用户信息失败',
                    success: false
                })
            }
        }
    })
})

/**
 * 删除用户
 * @params  id   列表的_id值
 */
router.post('/deletUser.do', async (req, res) => {
    await elementUserModel.deleteOne({
        '_id': ObjectId(req.body.id)
    }, (err) => {
        if (!err) {
            res.json({
                msg: '删除成功',
                success: true
            })
        } else {
            console.log('报错信息', err);
        }
    })
})

/**
 * 查找用户  根据用户名中的关键字进行搜索
 * @params usernameTxt   用户名中的关键字
 */
router.post('/searchUsername.do', async (req, res) => {
    let usernameTxt = req.body.usernameTxt;
    await elementUserModel.find({
        username: {
            $regex: usernameTxt,
            $options:"$i"
        }
    },(err,data)=>{
        if(!err){
            res.json({
                msg:'查询成功',
                module:data,
                success:true
            })
        }else{
            res.json({
                msg:'查询失败',
                success:false
            })
        }
    })
})

module.exports = router;