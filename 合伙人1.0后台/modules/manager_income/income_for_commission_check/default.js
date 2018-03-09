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

    


   
    var user = req.session.user_rows;
    // 链接数据库
    // 链接 / 操作数据库
    that.connect((err, db,conn) => {

        db.beginTransaction(function(err){
         
                    db.query("call income_for_commission_check()",[], function(err, row, fields) {
                                    // 数据获取失败
                        if (err) {
                            db.rollback();
                            db.release();// 释放资源
                            conn.end(); // 结束当前数据库链接
                            return res.errorEnd('佣金（预收益）转（可用余额）失败', 200);
                        }
                        db.commit();
                        db.release();// 释放资源
                        conn.end(); // 结束当前数据库链接                                                   
                        return res.successEnd("佣金（预收益）转（可用余额）成功!" ,0 );
        
                    });
        });


        
    });


}