// Node 内置模块
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




    if(req.session.user_rows = null){
        return res.errorEnd('当前请求不存在 Token 或 Token 不可用', 300);
    }
    if(req.session.user_token != body.token){
        return res.errorEnd('当前请求不存在 Token 或 Token 不可用', 300);
    }
    var is_manager_shopowner=0;
    if(!that.isEmpty(body.is_manager_shopowner) ){
        is_manager_shopowner =body.is_manager_shopowner;
    }

    var user = req.session.user_shopowner;
    that.connect((err, db,conn) => {
    // var date = new Date();
    // var year = date.getFullYear();
    // var month = date.getMonth();
    // var day = date.getDate();
    // var date1 = new Date(year,month,day);
    // var now_time = date1.getTime();
    // var newDate = new Date(now_time + 1 * 24 * 3600 * 1000);
    var newDay = moment().format('YYYY-MM-DD 00:00:00');
    var now = moment(newDay).format('X');    //当天时间
    var newDate = moment().format('X'); // 明天时间
    db.query("select count(1) today_order from `db_order` where sid = ? and create_time >= ? and create_time < ? and status in (0,1) and pay_status in (1,2,3,4,5) ",[ body.shopowner_id ,now,newDate], function(err, row, fields) {
    // 数据获取失败
        if (err) {
            db.release();// 释放资源
            conn.end(); // 结束当前数据库链接
            return res.errorEnd('没有找到可用数据', 200);
        }
        db.query("select count(1) delivery_good from `db_order` where sid = ? and pay_status = 2 and status in (0,1) ",[ body.shopowner_id], function(err1, row1, fields1) {
        // 数据获取失败
            if (err1) {
                db.release();// 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd('没有找到可用数据1', 200);
            }
            db.query("select count(1) refund from `db_order` where sid = ? and pay_status in (4,5) and status in (0,1) ",[ body.shopowner_id], function(err2, row2, fields2) {
            // 数据获取失败
                if (err2) {
                    return res.errorEnd('没有找到可用数据1', 200);
                }
                db.query("select count(1) complete from `db_order` where sid = ? and pay_status = 3 and status = 1 and create_time >= ? and create_time < ?",[ body.shopowner_id ,now,newDate], function(err3, row3, fields3) {
                // 数据获取失败
                    if (err3) {
                        db.release();// 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd('没有找到可用数据1', 200);
                    }
                    db.query("select IFNULL(sum(commission),0)  commission from `db_order` where sid = ? and pay_status in(3,4,5) and status = 1 and create_time >= ? and create_time < ?",[ body.shopowner_id ,now,newDate], function(err4, row4, fields4) {
                    // 数据获取失败
                        if (err4) {
                            db.release();// 释放资源
                            conn.end(); // 结束当前数据库链接
                            return res.errorEnd('没有找到可用数据2', 200);
                        }
                        db.query("select IFNULL(sum(need_pay),0) total_price from `db_order` where sid = ? and pay_status = 3 and status = 1 and mid = ? and create_time >= ? and create_time < ?",[body.shopowner_id ,body.manager_id,now,newDate], function(err5, row5, fields5) {
                        // 数据获取失败
                            if (err5) {
                                db.release();// 释放资源
                                conn.end(); // 结束当前数据库链接
                                return res.errorEnd('没有找到可用数据1', 200);
                            }

                            if(is_manager_shopowner==0){

                                db.query("select count(1) sell from `product_all_new` where status = 1 and to_shopowner_id = ? and mid = ?",[ body.shopowner_id ,body.manager_id], function(err6, row6, fields6) {
                                // 数据获取失败
                                    if (err6) {
                                        db.release();// 释放资源
                                        conn.end(); // 结束当前数据库链接
                                        return res.errorEnd('没有找到可用数据1', 200);
                                    }
                                    db.query("select count(1) shelf from `product_all_new` where status = 2 and to_shopowner_id = ? and mid = ?",[ body.shopowner_id ,body.manager_id], function(err7, row7, fields7) {
                                        if (err7) {
                                            db.release();// 释放资源
                                            conn.end(); // 结束当前数据库链接
                                            return res.errorEnd('没有找到可用数据1', 200);
                                        }
                                        db.query("select count(1) stock from `product_all_new` where status = 3 and to_shopowner_id = ? and mid = ?",[ body.shopowner_id ,body.manager_id], function(err8, row8, fields8) {
                                            if (err8) {
                                                db.release();// 释放资源
                                                conn.end(); // 结束当前数据库链接
                                                return res.errorEnd('没有找到可用数据1', 200);
                                            }
                                            db.release(); // 释放资源
                                            conn.end(); // 结束当前数据库链接
                                            var data = { 'today_order' : row[0].today_order,'delivery_good' : row1[0].delivery_good,'refund' : row2[0].refund,'today_complete' : row3[0].complete,'commission' : row4[0].commission,'total_price' : row5[0].total_price,'sell' : row6[0].sell,'shelf' : row7[0].shelf,'stock' : row8[0].stock}
                                            if(row){
                                                return res.successEnd(data);
                                            }else{
                                                return res.errorEnd('没有找到可用数据1', 200);
                                            }
                                        });
                                    });
                                });

                            }else{

                                db.query("select count(1) sell from `db_product` where status = 1  and mid = ?",[ body.manager_id], function(err6, row6, fields6) {
                                // 数据获取失败
                                    if (err6) {
                                        db.release();// 释放资源
                                        conn.end(); // 结束当前数据库链接
                                        return res.errorEnd('没有找到可用数据1', 200);
                                    }
                                    db.query("select count(1) shelf from `db_product` where status = 2  and mid = ?",[ body.manager_id], function(err7, row7, fields7) {
                                        if (err7) {
                                            db.release();// 释放资源
                                            conn.end(); // 结束当前数据库链接
                                            return res.errorEnd('没有找到可用数据1', 200);
                                        }
                                        db.query("select count(1) stock from `db_product` where status = 3  and mid = ?",[ body.manager_id], function(err8, row8, fields8) {
                                            if (err8) {
                                                db.release();// 释放资源
                                                conn.end(); // 结束当前数据库链接
                                                return res.errorEnd('没有找到可用数据1', 200);
                                            }
                                            db.release(); // 释放资源
                                            conn.end(); // 结束当前数据库链接
                                            var data = { 'today_order' : row[0].today_order,'delivery_good' : row1[0].delivery_good,'refund' : row2[0].refund,'today_complete' : row3[0].complete,'commission' : row4[0].commission,'total_price' : row5[0].total_price,'sell' : row6[0].sell,'shelf' : row7[0].shelf,'stock' : row8[0].stock}
                                            if(row){
                                                return res.successEnd(data);
                                            }else{
                                                return res.errorEnd('没有找到可用数据1', 200);
                                            }
                                        });
                                    });
                                });

                            }

                        });
                    });
                });
            });
        });
    });


    });


}