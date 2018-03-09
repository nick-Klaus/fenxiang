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
    if(req.session.user_manager == {}){
        return res.errorEnd('当前用户 非 老板权限', 300);
    }
    var user = req.session.user_rows;
    that.connect((err, db,conn) => {    
                
    db.query("select * from `db_shop` where id = ?", [body.id] , function(err, row, fields) {
        if(row.length > 0){
            db.query("select * from `db_shopowner` where shop_id = ? and manager_id = ?", [row[0].id,row[0].manager_id] , function(err1, row1, fields1) {
                if(row1.length > 0){
                    db.query("select IFNULL(count(id),0) order_num from `db_order` where sid = ? and mid = ? and status = 1 and pay_status = 3", [row1[0].id,row[0].manager_id] , function(err2, row2, fields2) {
                        db.query("select IFNULL(count(id),0) activity_num from `activity_all` where  status = 1 and boss_id = ? and shopowner_id = ?", [row1[0].id,row[0].manager_id,row[0].manager_id,row[0].id] , function(err3, row3, fields3) {

                            var data = {'order_num' : row2[0].order_num,'activity_num' : row3[0].activity_num,'shop' :row ,'shopowner' : row1};
                            db.release(); // 释放资源
                            conn.end(); // 结束当前数据库链接           
                            return res.successEnd(data);
                        });
                    });
                }else{
                    var data = {'order_num' : 0,'activity_num' : 0,'shop' :row ,'shopowner' : row1};
                    db.release(); // 释放资源
                    conn.end(); // 结束当前数据库链接           
                    return res.successEnd(data);
                }
            });
        }else{
            var data = {'order_num' : 0,'activity_num' : 0,shop : row};
            db.release(); // 释放资源
            conn.end(); // 结束当前数据库链接           
            return res.successEnd(data);
        }

    });
            
        
    });


}