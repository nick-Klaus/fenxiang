// Node 内置模块
// const fs = require('fs'); // 文件操作模块
// const url = require('url'); // 链接处理模块
// const path = require('path'); // 路径处理模块
// const http = require('http'); // 网页请求模块
// const crypto = require('crypto');// 加密模块
// const child_process = require('child_process');// 进程通信模块
// 第三方模块
// const ftp = require('ftp');// FTP模块
// const moment = require('moment'); // 时间处理插件

'use strict';
exports.ready = (req, res, that) => {

    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query; // 当前请求传递过来的 GET 数据,
    const body = req.body; // 当前请求传递过来的 POST 数据

    // that 里面有什么可以调用的 你可以看 resources\app\lib\core.js 文件!
    // 例如 that.isEmpty(123) // 判断传入的值, 是否是空 具体看方法说明!!!
    if(req.session.user_rows = null){
         return res.errorEnd('当前请求不存在 Token 或 Token 不可用', 300);
     }
    if(req.session.user_token != body.token){
         return res.errorEnd('当前请求不存在 Token 或 Token 不可用', 300);
    }    
 	if(that.isEmpty(body.type)){
         return res.errorEnd('查询类型不能为空：1.活动 2.订单', 300);
    } 
    if(that.isEmpty(body.boss_id)){
         return res.errorEnd('老板不能为空!', 300);
    } 
 	if(that.isEmpty(body.pid)){
         return res.errorEnd('个人不能为空!', 300);
    } 
    if(that.isEmpty(body.param_text)){
         body.param_text = "%%";
    }else{
		body.param_text = "%"+body.param_text+"%";
    } 

    var user = req.session.user_rows;
    // 链接数据库
    // 链接 / 操作数据库
    that.connect((err, db,conn) => {
        //查询全部订单
        if(body.type == 1){
            //判断它是老板的话
 
            db.query("select * from `activity_all` where boss_id = ? AND activity_title LIKE ? order by original_price desc", [body.boss_id,body.param_text], function(err, row, fields) {

                // 数据获取失败
                if (err) {
                    return res.errorEnd('没有找到可用数据', 200);
                }
                // 如果后面还有数据库 增删改查的操作, 那么就不要调用 db.release() 来释放资源!!
                // 但整个程序走完后, 就必须要调用 db.release() 来释放当前占用的资源
                db.release(); // 释放资源
                conn.end();
                // 整个文件走完后, 必须调用 res.successEnd() 或 res.errorEnd() 来返回给接口调用方, 告诉对方, 当前请求的操作状态,
                // 如果你的这个方法里面有 回调, 那么这个调用必须放在最后的回调里面!!!
                // 操作正确 返回取出的数据
                if(row){
                    return res.successEnd(row);
                }
                // 操作失败 返回失败信息, 同时设置 http 状态码为 200
                return res.errorEnd( '没有找到数据' , 200 );
            })
            

        }else if(body.type == 2){
            //查询单条订单数据
                db.query("select * from `db_order` where (pid = ? or cid = ?) AND ( title LIKE ? or pickup_information LIKE ? ) order by create_time desc", [body.pid,body.pid,body.param_text,body.param_text], function(err, row, fields) {

                // 数据获取失败
                if (err) {
                    return res.errorEnd('没有找到可用数据', 200);
                }
                // 如果后面还有数据库 增删改查的操作, 那么就不要调用 db.release() 来释放资源!!
                // 但整个程序走完后, 就必须要调用 db.release() 来释放当前占用的资源
                db.release(); // 释放资源
                conn.end();
                // 整个文件走完后, 必须调用 res.successEnd() 或 res.errorEnd() 来返回给接口调用方, 告诉对方, 当前请求的操作状态,
                // 如果你的这个方法里面有 回调, 那么这个调用必须放在最后的回调里面!!!
                // 操作正确 返回取出的数据
                if(row){
                    return res.successEnd(row);
                }
                // 操作失败 返回失败信息, 同时设置 http 状态码为 200
                return res.errorEnd( '没有找到数据' , 200 );
            })
        }



    });


}