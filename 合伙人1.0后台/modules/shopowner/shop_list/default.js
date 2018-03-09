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

    // 链接数据库
    // 链接 / 操作数据库

    that.connect((err, db,conn) => {
        let field = "";
        let sql  = "SELECT  a.*, b.id AS shopowner_id, b.realname AS shopowner_realname, b.mobile AS shopowner_mobile, b.tel AS shopowner_tel, b.address AS shopowner_address, b.amount AS shopowner_amount, b.cash AS shopowner_cash, b.status AS shopowner_status, b.openid AS shopowner_openid, b.policy_key AS shopowner_policy_key  FROM ";
            sql += "`db_shop` AS a, `db_shopowner` AS b ";
            sql += "WHERE b.shop_id = a.id AND a.manager_id = b.manager_id AND b.manager_id = ? LIMIT 0, 999";
        db.query( sql , [body.manager_id]  , function(err, row, fields) {
            // 数据获取失败
            if (err) {
                db.release();// 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd('没有找到可用数据1', 200);
            }
            db.release(); // 释放资源
            conn.end(); // 结束当前数据库链接
            if( row.length ){
                return res.successEnd(row);
            }else{
                return res.errorEnd('没有找到可用数据', 200);
            }
        });


    });


}