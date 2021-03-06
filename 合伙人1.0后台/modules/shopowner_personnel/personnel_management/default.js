﻿// Node 内置模块
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

    // 链接数据库
    // 链接 / 操作数据库

    
    if(req.session.user_rows == null){
         return res.errorEnd('当前请求不存在 Token 或 Token 不可用', 300);
     }
    if(req.session.user_token != body.token){
         return res.errorEnd('当前请求不存在 Token 或 Token 不可用', 300);
    }
    if(req.session.user_shopowner== {}){
        if(req.session.user_manager== {}){
            return res.errorEnd('当前用户 非 店长权限', 300);
        }
    }
    var user = req.session.user_rows;
    that.connect((err, db,conn) => {
                
    db.query("select token,id,headimgurl,realname,nickname,mobile from `db_people` where shopowner_id = ?  and is_clerk = '1'", body.id , function(err, row, fields) {
        if (err) {
            var data = {};
            return res.successEnd(data);
        }
        db.query("select a.image,a.shop_name,a.create_date from `db_shop` a inner join `db_shopowner` b on a.id = b.shop_id where b.id = ? ", body.id , function(err1, row1, fields1) {
            db.release(); // 释放资源
            conn.end(); // 结束当前数据库链接
            
            row1['0']['people_num'] = row.length;
            row.shop = row1['0'];
            var data = {'row' : row,'shop' : row1['0']};
            if(row){    
                return res.successEnd(data);   
            }else{
                var data = {};
                return res.successEnd(data);
            }
            
        });
    });
            
        
    });


}