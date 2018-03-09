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
        db.query("select * from `db_shopowner` where id = ?", body.shopowner_id , function(err1, row1, fields1) {
            // 数据获取失败
            if (err1) {
                return res.errorEnd('没有找到可用数据1', 200);
            }
            db.query("select a.create_date,a.shop_name,a.image,a.phone,a.id,a.address,a.text_information,a.province,a.city,a.area,a.invite_image,a.shop_pic,b.company from `db_shop` a left join `db_manager` b on a.manager_id = b.id  where a.id = ?", row1[0].shop_id  , function(err, row, fields) {
                // 数据获取失败
                if (err) {
                    db.release();// 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd('没有找到可用数据', 200);
                }
                if(row.length == 0){
                    db.release();// 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd('没有找到可用数据', 200);
                }else{
                    row[0].policy_key = row1[0].policy_key;
                    db.release(); // 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.successEnd(row);
                }

            });
        });


    });


}