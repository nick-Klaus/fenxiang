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

    if(req.session.user_rows = null){
         return res.errorEnd('当前请求不存在 Token 或 Token 不可用', 300);
     }
    if(req.session.user_token != body.token){
         return res.errorEnd('当前请求不存在 Token 或 Token 不可用', 300);
    }

    var user = req.session.user_rows;
    that.connect((err, db,conn) => {      
        db.query("select IFNULL(share_price_all,0) share_price_all,IFNULL(share_price_new,0) share_price_new,IFNULL(commission_price_new,0) commission_price_new,IFNULL(commission_price_all,0) commission_price_all,IFNULL(share_new,0) share_new, IFNULL(share_all,0) share_all,IFNULL(profit_all,0) profit_all, IFNULL(profit_new,0) profit_new,IFNULL(forward_new,0) forward_new,IFNULL(forward_all,0) forward_all from `db_activity_log` where openid = ? and boss_id = ? and user_id = ?",[ body.openid,body.manager_id,body.user_id] , function(err, row, fields) {
        // 数据获取失败
            if (err) {
                db.release(); // 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd('没有找到可用数据', 200);
            }
            if(row.length == 0 ){
                var data = {
                    share_new :0,
                    share_all : 0,
                    forward_new : 0,
                    forward_all : 0,
                    profit_new : 0,
                    profit_all : 0,
                    openid : body.openid,
                    boss_id : body.manager_id,
                    user_id : body.user_id,
                };  
                db.query( "INSERT INTO db_activity_log set ?" , data , function( err, result , fields ){
                    if (err) {
                        db.release(); // 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd('没有找到可用数据', 200);
                    }
                    db.release(); // 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.successEnd(data);
                });
            }else{
                var date = new Date();
                var day = date.getDate();
                var month = date.getMonth() +1;
                var year = date.getFullYear();
                var now_day = new Date(year+'-'+month+'-'+day);
                var now_time = now_day.getTime();
                var tomorrow_time = now_time+86400000;
                var now = now_time/1000;    //当天时间
                var tomorrow = tomorrow_time/1000; // 明天时间
                db.query("select IFNULL(count(id),0) invatation_today from `db_people` where prolocutor_id = ? and prolocutor_time> ? and prolocutor_time < ? and is_prolocutor = '1'",[body.user_id,now,tomorrow], function(err1, row1, fields1) 
                {
                    if (err) {
                        db.release(); // 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd('没有找到可用数据1', 200);
                    }
                    //var data = {'order_number' : row1.length};
                    db.query("select IFNULL(count(id),0) invatation_total from `db_people` where prolocutor_id = ? and is_prolocutor = '1'",body.user_id , function(err2, row2, fields2) {
                        if (err) {
                            db.release(); // 释放资源
                            conn.end(); // 结束当前数据库链接
                            return res.errorEnd('没有找到可用数据1', 200);
                        }

                        row[0].invitation_today = row1[0].invatation_today;
                        row[0].invitation_total = row2[0].invatation_total;
                        db.release(); // 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.successEnd(row);                   
                    });             
                });
            }

                
        }); 
    });


}