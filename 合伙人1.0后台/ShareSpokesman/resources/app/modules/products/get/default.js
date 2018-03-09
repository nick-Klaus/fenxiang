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
        // 查询全部数据
        var search = [];
        if(body.index == 1){
            db.query("select * from `db_product` where mid = ? order by id desc", body.mid ,function(err, row, fields) {
                // 数据获取失败
                if (err) {
                    return res.errorEnd('没有找到可用数据', 200);
                }

                // 如果后面还有数据库 增删改查的操作, 那么就不要调用 db.release() 来释放资源!!
                // 但整个程序走完后, 就必须要调用 db.release() 来释放当前占用的资源
                db.release(); // 释放资源

                // 整个文件走完后, 必须调用 res.successEnd() 或 res.errorEnd() 来返回给接口调用方, 告诉对方, 当前请求的操作状态,
                // 如果你的这个方法里面有 回调, 那么这个调用必须放在最后的回调里面!!!
                // 操作正确 返回取出的数据
                if(row){
                    return res.successEnd(row);
                }
                // 操作失败 返回失败信息, 同时设置 http 状态码为 200
                return res.errorEnd( '没有找到数据' , 200 );
            })
        }else if(body.index == 2){
            db.query("select * from `db_product` where id = ?",body.id, function(err, row, fields) {
                // 数据获取失败
                if (err) {
                    return res.errorEnd('没有找到可用数据', 200);
                    }
                db.query("select * from `db_product_param` where gid = ?",body.id, function(err1, row1, fields1) {
                    if(row1){
                        row['0']['parameter'] = row1;
                    }else{
                        row['0']['parameter'] = [];
                    }
                    // 整个文件走完后, 必须调用 res.successEnd() 或 res.errorEnd() 来返回给接口调用方, 告诉对方, 当前请求的操作状态,
                    // 如果你的这个方法里面有 回调, 那么这个调用必须放在最后的回调里面!!!
                    db.release(); // 释放资源
                    conn.end(); // 结束当前数据库链接
                    // 操作正确 返回取出的数据
                    console.log(row);
                    if(row){

                        return res.successEnd(row);
                    }else{
                        return res.errorEnd( '没有找到数据' , 200 );
                    }
                    
                })
            })
        }
    });


}