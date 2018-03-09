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
    //      return res.errorEnd('当前请求不存在 Token 或 Token 不可用', 300);
    //  }
    // if(req.session.user_token != body.token){
    //      return res.errorEnd('当前请求不存在 Token 或 Token 不可用', 300);
    // }
    var user = req.session.user_rows;
    that.connect((err, db,conn) => {
        db.query("select * from `db_people` where token = ?", body.token , function(err, row, fields) {

            if( err ){
                db.release(); // 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd('没有找到可用数据!!', 200);
            }
            db.query("select * from `db_activity_log` where user_id = ? and boss_id = ?", [row[0].id,row[0].manager_id] , function(err1, row1, fields1) {
                if( err1 ){
                    db.release(); // 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd('没有找到可用数据!!', 200);
                }
                if(row1.length == 0){
                    db.release(); // 释放资源
                    conn.end(); // 结束当前数据库链接
                    var row1 = {};
                    return res.successEnd(row1);
                }
                db.query("select IFNULL(count(*),0) order_num,IFNULL(sum(need_pay),0) total_price from `db_order` where  cid =  ? and status in(0,1)", [row[0].id] , function(err2, row2, fields2) {
                    if( err2 ){
                        db.release(); // 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd('没有找到可用数据!!', 200);
                    }
                    db.query("select IFNULL(count(*),0) count from `db_people` where prolocutor_id = ? and is_prolocutor = '1'", row[0].id, function(err3, row3, fields3) {
                        if( err3 ){
                            db.release(); // 释放资源
                            conn.end(); // 结束当前数据库链接
                            return res.errorEnd('没有找到可用数据!!', 200);
                        }
                        db.query("select IFNULL(count(*),0) order_conduct from `db_order` where  pay_status in(1,2,4) and cid = ?",[row[0].id], function(err4, row4, fields4) {
                            if( err4 ){
                                db.release(); // 释放资源
                                conn.end(); // 结束当前数据库链接
                                return res.errorEnd('没有找到可用数据!!', 200);
                            }
                            db.query("select b.shop_name from `db_shopowner` a inner join `db_shop` b on a.shop_id = b.id where a.id = ?",[row[0].shopowner_id], function(err5, row5, fields5) {
                                db.query("select coupons_id from `db_coupons_record`  where user_id = ? and used_date IS NULL",[row[0].id], function(err6, row6, fields6) {
                                    if( err6 ){
                                        db.release(); // 释放资源
                                        conn.end(); // 结束当前数据库链接
                                        return res.errorEnd('没有找到可用数据!!', 200);
                                    }
                                    row1[0].worth = 0;

                                    if(row3){
                                       row1[0].count = row3[0].count;
                                    }else{
                                        row1[0].count = 0;
                                    }
                                    if(row2){
                                        row1[0].order_num = row2[0].order_num;
                                        row1[0].total_price = row2[0].total_price;
                                    }else{
                                        row1[0].order_num = 0;
                                        row1[0].total_price = 0;
                                    }
                                    if(row4){
                                        row1[0].order_conduct = row4[0].order_conduct;
                                    }else{
                                        row1[0].order_conduct = 0;
                                    }

                                    if(row1[0].share_price_all == 0){
                                        var share_price_proportion = 0;
                                    }else{
                                        var share_price_proportion = row1[0].share_price_all/row2[0].total_price;
                                    }
                                   if(row1[0].commission_price_all == 0){
                                        var commission_price_proportion = 0;
                                    }else{
                                        var commission_price_proportion = row1[0].commission_price_all/row2[0].total_price;
                                    }

                                    if(share_price_proportion == "Infinity"){
                                        share_price_proportion = 0;
                                    }
                                    if(commission_price_proportion == "Infinity"){
                                        commission_price_proportion = 0;
                                    }
                                    if(commission_price_proportion == "NaN"){
                                        commission_price_proportion = 0;
                                    }
                                    if(share_price_proportion == "NaN"){
                                        share_price_proportion = 0;
                                    }
                                    row1[0].share_price_proportion  = share_price_proportion.toFixed(2);
                                    row1[0].commission_price_proportion  = commission_price_proportion.toFixed(2);
                                    row1[0].shop_name = row5[0].shop_name;
                                    if( row6.length ){
                                        function forEach(index){
                                            if( index >= row6.length ){
                                                db.release(); // 释放资源
                                                conn.end(); // 结束当前数据库链接
                                                return res.successEnd(row1);
                                            }
                                            db.query("select worth from `db_coupons` where id = ? and types = 0", row6[index].coupons_id, function(err7, row7, fields7) {
                                                if( err7 ){
                                                    db.release(); // 释放资源
                                                    conn.end(); // 结束当前数据库链接
                                                    return res.errorEnd('没有找到可用数据!!', 200);
                                                }
                                                if( row7.length ){
                                                    row1[0].worth += row7[0].worth;
                                                    forEach(index + 1);
                                                } else {
                                                    forEach(index + 1);
                                                }
                                            })
                                        }
                                        forEach(0);
                                    } else {
                                        db.release(); // 释放资源
                                        conn.end(); // 结束当前数据库链接
                                        return res.successEnd(row1);
                                    }

                                });
                            });
                        });
                    });
                });
            });
        });
    });


}