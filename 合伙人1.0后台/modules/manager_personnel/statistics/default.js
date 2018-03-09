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

    
    // if(req.session.user_rows = null){
    //     return res.errorEnd('当前请求不存在 Token 或 Token 不可用', 300);
    // }
    // if(req.session.user_token != body.token){
    //     return res.errorEnd('当前请求不存在 Token 或 Token 不可用', 300);
    // }
    var user = req.session.user_rows;
    that.connect((err, db,conn) => {
        var date = new Date();
        var year = date.getFullYear();
        var month = date.getMonth();
        var day = date.getDate();
        var date1 = new Date(year,month,day);
        var today = date1.getTime();
        var newDate = new Date(today - 7 * 24 * 3600 * 1000);
        var newDate1 = new Date(today - 30 * 24 * 3600 * 1000);
        var last_sevenday = newDate.getTime();
        var last_month = newDate1.getTime();
        today = parseInt(today / 1000);
        last_sevenday = parseInt(last_sevenday / 1000);
        last_month = parseInt(last_month / 1000);

    
    
        if(body.status == 1){
            // db.query("select IFNULL(sum(total_price),0) total_price from `db_order` where mid = ? and status = 1 and pay_status = 3 and create_time > ? and create_time < ?",[body.manager_id,last_sevenday,today], function(err, row, fields) {
            //     db.query("select IFNULL(sum(total_price),0) refund from `db_order` where mid = ? and status = 1 and pay_status = 4 and create_time > ? and create_time < ?",[body.manager_id,last_sevenday,today], function(err1, row1, fields1) {
                    // if(row.length > 0 ){
            var total_bar = [];
            var refund_bar = [];
            function foreach(i){
                if( i >= 7){
                    var data = {'total_bar' : total_bar,'refund_bar' :refund_bar};
                    db.release(); // 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.successEnd(data);
                }

                var today = date.getTime();
                var newDate2 = new Date(today - i * 24 * 3600 * 1000);
                var b = i+1;
                var newDate3 = new Date(today - b * 24 * 3600 * 1000);
                var day = newDate2.getTime();
                var day1 = newDate3.getTime();
                day = parseInt(day / 1000);
                day1 = parseInt(day1 / 1000);
                db.query("select IFNULL(sum(need_pay),0) total_price from `db_order` where mid = ? and status in (0,1) and pay_status in (2,3) and create_time > ? and create_time < ?",[body.manager_id,day1,day], function(err2, row2, fields2) {
                        db.query("select IFNULL(sum(need_pay),0) refund from `db_order` where mid = ? and status in (0,1) and pay_status in (4,5) and create_time > ? and create_time < ?",[body.manager_id,day1,day], function(err3, row3, fields3) {
                        // total_bar[a] = row2[0].total_price;
                        total_bar.push(row2[0].total_price);
                        refund_bar.push(row3[0].refund);
                        foreach(i + 1) 
                    });
                });
            }
            foreach(0)
            // for (var i = 7; i > 0; i--) {
            //     var today = date.getTime();
            //     var newDate2 = new Date(today - i * 24 * 3600 * 1000);
            //     var b = i-1;
            //     var newDate3 = new Date(today - b * 24 * 3600 * 1000);
            //     console.log(newDate2);
            //     console.log(newDate3);
            //     var day = newDate2.getTime();
            //     var day1 = newDate3.getTime();
            //     console.log(day);
            //     console.log(day1);
            //     day = parseInt(day / 1000);
            //     day1 = parseInt(day1 / 1000);
            //     var a = 7;
                
            //     db.query("select IFNULL(sum(total_price),0) total_price from `db_order` where mid = ? and status = 1 and pay_status = 3 and create_time > ? and create_time < ?",[body.manager_id,day,day1], function(err2, row2, fields2) {
            //             db.query("select IFNULL(sum(total_price),0) refund from `db_order` where mid = ? and status = 1 and pay_status = 4 and create_time > ? and create_time < ?",[body.manager_id,day,day1], function(err3, row3, fields3) {
            //             // total_bar[a] = row2[0].total_price;
            //             total_bar.push(row2[0].total_price);
            //             refund_bar.push(row3[0].refund);
            //             // refund_bar[a] = row3[0].refund;
            //             a = a-1;
            //             if(a == 0){
            //                 var data = {'total_bar' : total_bar,'refund_bar' :refund_bar};
            //                 db.release(); // 释放资源
            //                 conn.end(); // 结束当前数据库链接
            //                 return res.successEnd(data);
            //             }  
            //         });
            //     });
            // }
                    // }else{
                    //     var total_bar = [];
                    //     var refund_bar = [];
                    //     for (var i = 7; i > 0; i--) {
                    //         var today = date.getTime();
                    //         var newDate2 = new Date(today - i * 24 * 3600 * 1000);
                    //         var day = newDate2.getTime();
                    //         day = parseInt(day / 1000);
                    //         today = parseInt(today / 1000);
                    //         var a = 7;
                    //         db.query("select IFNULL(sum(total_price),0) total_price from `db_order` where mid = ? and status = 1 and pay_status = 3 and create_time > ? and create_time < ?",[body.manager_id,day,today], function(err2, row2, fields2) {
                    //             var refund = row2[0].refund;
                    //                 db.query("select IFNULL(sum(total_price),0) refund from `db_order` where mid = ? and status = 1 and pay_status = 4 and create_time > ? and create_time < ?",[body.manager_id,day,today], function(err3, row3, fields3) {
                    //                 total_bar.push(row2[0].total_price);
                    //                 refund_bar.push(row3[0].refund);
                    //                 a = a-1;
                    //                 if(a == 0){
                    //                     var data = {'total_bar' : total_bar,'refund_bar' :refund_bar};
                    //                     db.release(); // 释放资源
                    //                     conn.end(); // 结束当前数据库链接
                    //                     return res.successEnd(data);
                    //                 }  
                    //             });
                    //         });
                    //     }
                    // }
            //     });
            // });
        }else if(body.status == 2){
            // db.query("select IFNULL(sum(total_price),0) total_price from `db_order` where mid = ? and status = 1 and pay_status = 3 and create_time > ? and create_time < ?",[body.manager_id,last_month,today], function(err, row, fields) {
            //     db.query("select IFNULL(sum(total_price),0) refund from `db_order` where mid = ? and status = 1 and pay_status = 4 and create_time > ? and create_time < ?",[body.manager_id,last_month,today], function(err1, row1, fields1) {
                    // if(row.length > 0 ){
            var total_bar = [];
            var refund_bar = [];
            function foreach(i){
                if( i >= 30){
                    var data = {'total_bar' : total_bar,'refund_bar' :refund_bar};
                    db.release(); // 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.successEnd(data);
                }
                var today = date.getTime();
                var newDate2 = new Date(today - i * 24 * 3600 * 1000);
                var b = i+1;
                var newDate3 = new Date(today - b * 24 * 3600 * 1000);
                var day = newDate2.getTime();
                var day1 = newDate3.getTime();
                day = parseInt(day / 1000);
                day1 = parseInt(day1 / 1000);
                db.query("select IFNULL(sum(need_pay),0) total_price from `db_order` where mid = ? and status in (0,1) and pay_status in (2,3) and create_time > ? and create_time < ?",[body.manager_id,day1,day], function(err2, row2, fields2) {
                        db.query("select IFNULL(sum(need_pay),0) refund from `db_order` where mid = ? and status in (0,1) and pay_status in (4,5) and create_time > ? and create_time < ?",[body.manager_id,day1,day], function(err3, row3, fields3) {
                        // total_bar[a] = row2[0].total_price;
                        console.log(this.sql);
                        console.log(day1);
                        total_bar.push(row2[0].total_price);
                        refund_bar.push(row3[0].refund);
                        foreach(i + 1) 
                    });
                });
            }
            foreach(0)
                    // }else{
                    //     var total_bar = [];
                    //     var refund_bar = [];
                    //     for (var i = 30; i > 0; i--) {
                    //         var today = date.getTime();
                    //         var newDate2 = new Date(today - i * 24 * 3600 * 1000);
                    //         var day = newDate2.getTime();
                    //         day = parseInt(day / 1000);
                    //         today = parseInt(today / 1000);
                    //         var a = 30;
                    //         db.query("select IFNULL(sum(total_price),0) total_price from `db_order` where mid = ? and status = 1 and pay_status = 3 and create_time > ? and create_time < ?",[body.manager_id,day,today], function(err2, row2, fields2) {
                    //             var refund = row2[0].refund;
                    //                 db.query("select IFNULL(sum(total_price),0) refund from `db_order` where mid = ? and status = 1 and pay_status = 4 and create_time > ? and create_time < ?",[body.manager_id,day,today], function(err3, row3, fields3) {
                    //                 total_bar[a] = row2[0].total_price;
                    //                 refund_bar[a] = row3[0].refund;
                    //                 a = a-1;
                    //                 if(a == 0){
                    //                     var data = {'total_price' : 0 , 'refund' : row1[0].refund,'total_bar' : total_bar,'refund_bar' :refund_bar};
                    //                     db.release(); // 释放资源
                    //                     conn.end(); // 结束当前数据库链接
                    //                     return res.successEnd(data);
                    //                 }  
                    //             });
                    //         });
                    //     }
                    // }
            //     });
            // });
        }else if(body.status == 3){
            db.query("select IFNULL(sum(need_pay),0) total_price from `db_order` where mid = ? and status in (0,1) and pay_status in (2,3) ",[body.manager_id], function(err, row, fields) {
                db.query("select IFNULL(sum(need_pay),0) refund from `db_order` where mid = ? and status in (0,1) and pay_status in (4,5) ",[body.manager_id], function(err1, row1, fields1) {
                    if(row.length > 0 ){
                        var data = {'total_price' : row[0].total_price , 'refund' : row1[0].refund};
                        db.release(); // 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.successEnd(data);
                    }else{
                        var data = {'total_price' : 0 , 'refund' : row1[0]};
                        db.release(); // 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.successEnd(data);
                    }
                });
            });
        }

            
        
    });


}