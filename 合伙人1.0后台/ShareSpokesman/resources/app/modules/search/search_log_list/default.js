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
 	


    var user = req.session.user_rows;
    // 链接数据库
    // 链接 / 操作数据库
    that.connect((err, db,conn) => {
        //查询全部订单
            var sql ="";
            var sql_id=null;
            if(!that.isEmpty(body.pid)){
                sql ="select * from `db_search_log` where pid = ? AND  search_type = ? order by search_times desc";
                sql_id = body.pid;
            }
            if(!that.isEmpty(body.shopowner_id)){
                sql ="select * from `db_search_log` where shopowner_id = ? AND  search_type = ? order by search_times desc";
                sql_id = body.shopowner_id;
            }
            if(!that.isEmpty(body.manager_id)){
                sql ="select * from `db_search_log` where manager_id = ? AND  search_type = ? order by search_times desc";
                sql_id = body.manager_id;
            }
 
            db.query(sql, [sql_id,body.type], function(err, row, fields) {

                // 数据获取失败
                if (err) {
                    db.release();// 释放资源
                    conn.end(); // 结束当前数据库链接
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
            

        



    });


}