﻿// Node 内置模块
// const fs = require('fs'); // 文件操作模块
// const url = require('url'); // 链接处理模块
// const path = require('path'); // 路径处理模块
// const http = require('http'); // 网页请求模块
// const crypto = require('crypto');// 加密模块
// const child_process = require('child_process');// 进程通信模块
// 第三方模块
// const ftp = require('ftp');// FTP模块
const moment = require('moment'); // 时间处理插件

'use strict';
exports.ready = (req, res, that) => {

    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query; // 当前请求传递过来的 GET 数据,
    const body = req.body; // 当前请求传递过来的 POST 数据

    // that 里面有什么可以调用的 你可以看 resources\app\lib\core.js 文件!
    // 例如 that.isEmpty(123) // 判断传入的值, 是否是空 具体看方法说明!!!

    // 链接数据库
    // 链接 / 操作数据库


    // if(req.session.user_rows = null){
    //     return res.errorEnd('当前请求不存在 Token 或 Token 不可用', 300);
    // }
    // if(req.session.user_token != body.token){
    //     return res.errorEnd('当前请求不存在 Token 或 Token 不可用', 300);
    // }
    // if(req.session.user_manager== {}){
    //     return res.errorEnd('当前用户 非 老板权限', 300);
    // }
    var user = req.session.user_rows;
    that.connect((err, db,conn) => {
    // var date = new Date();
    // var year = date.getFullYear();
    // var month = date.getMonth();
    // var day = date.getDate();
    // var date1 = new Date(year,month,day);
    // var today = date1.getTime();
    // var newDate = new Date(today + 1 * 24 * 3600 * 1000);
    // var yes_day = newDate.getTime();
    var newDay = moment().format('YYYY-MM-DD 00:00:00');
    var today = moment(newDay).format('X');
    var yes_day = moment().format('X');


    db.query("select IFNULL(count(1),0) today_order from `db_order` where mid = ? and status in (0,1) and pay_status in (1,2,3,4,5) and create_time > ? and create_time < ?",[body.manager_id,today,yes_day], function(err, row, fields) {
        if(row.length > 0 ){
            db.query("select IFNULL(count(1),0) today_refund from `db_order` where mid = ? and status in (0,1) and pay_status in (4,5) and create_time > ? and create_time < ?",[body.manager_id,today,yes_day], function(err1, row1, fields1) {
                if(row1.length > 0 ){
                    db.query("select IFNULL(count(id),0) people_num from `db_people` where manager_id = ? and is_prolocutor = '1' and prolocutor_time > ? and prolocutor_time < ?",[body.manager_id,today,yes_day], function(err2, row2, fields2) {

                        if(row2.length > 0 ){
                            var data = {'today_refund' : row1[0].today_refund ,'today_order' : row[0].today_order ,'people_num' : row2[0].people_num};
                            db.release(); // 释放资源
                            conn.end(); // 结束当前数据库链接
                            return res.successEnd(data);
                        }else{
                            var data = {'today_refund' : row1[0].today_refund,'today_order' : row[0].today_order ,'people_num' : 0};
                            db.release(); // 释放资源
                            conn.end(); // 结束当前数据库链接
                            return res.successEnd(data);
                        }
                    });
                }else{
                    db.query("select IFNULL(count(id),0) people_num from `db_people` where manager_id = ? and is_prolocutor = '1' and prolocutor_time > ? and prolocutor_time < ?",[body.manager_id,today,yes_day], function(err2, row2, fields2) {
                        if(row2.length > 0 ){
                            var data = {'today_refund' : 0,'today_order' : row[0].today_order ,'people_num' : row2[0].people_num};
                            db.release(); // 释放资源
                            conn.end(); // 结束当前数据库链接
                            return res.successEnd(data);
                        }else{
                            var data = {'today_refund' : 0,'today_order' : row[0].today_order ,'people_num' : 0};
                            db.release(); // 释放资源
                            conn.end(); // 结束当前数据库链接
                            return res.successEnd(data);
                        }
                    });
                }
            });
        }else{
            db.query("select IFNULL(count(1),0) today_refund from `db_order` where mid = ? and status in (0,1) and pay_status in (4,5) and create_time > ? and create_time < ?",[body.manager_id,today,yes_day], function(err1, row1, fields1) {
                if(row1.length > 0 ){
                    db.query("select IFNULL(count(id),0) people_num from `db_people` where manager_id = ? and is_prolocutor = '1' and prolocutor_time > ? and prolocutor_time < ?",[body.manager_id,today,yes_day], function(err2, row2, fields2) {
                        if(row2.length > 0 ){
                            var data = {'today_refund' : row1[0].today_refund ,'today_order' : 0 ,'people_num' : row2[0].people_num};
                            db.release(); // 释放资源
                            conn.end(); // 结束当前数据库链接
                            return res.successEnd(data);
                        }else{
                            var data = {'today_refund' : row1[0].today_refund ,'today_order' : 0 ,'people_num' : 0};
                            db.release(); // 释放资源
                            conn.end(); // 结束当前数据库链接
                            return res.successEnd(data);
                        }
                    });
                }else{
                    var data = {'today_refund' : 0 ,'today_order' : 0 ,'people_num' : 0};
                    db.release(); // 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.successEnd(data);
                }
            });
        }
    });



    });


}