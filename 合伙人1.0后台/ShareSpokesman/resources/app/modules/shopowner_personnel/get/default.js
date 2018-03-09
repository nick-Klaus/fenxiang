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
                
                db.query("select * from `db_people` where token = ?", body.token , function(err, row, fields) {
                // 数据获取失败
                    if (err) {
                        return res.errorEnd('没有找到可用数据1', 200);
                    }
                    db.query("select * from `db_order` where pid = ?",row['0'].id , function(err1, row1, fields1) {
                        // 数据获取失败
                        if (err) {
                            return res.errorEnd('没有找到可用数据2', 200);
                        }

                        db.query("select * from `db_people` where prolocutor_id = ?",row['0'].id  , function(err2, row2, fields2) {
                        // 数据获取失败
                            if (err2) {
                                return res.errorEnd('没有找到可用数据3', 200);
                            }
                            db.query("select * from `db_order` where pid = ? and pay_status = 2 and status = 1",row['0'].id  , function(err3, row3, fields3) {
                            // 数据获取失败
                                if (err3) {
                                    return res.errorEnd('没有找到可用数据4', 200);
                                }
                                var myDate = new Date(); 
                                var now_time = myDate.getTime(); 
                                var day = myDate.getDate();
                                var month = myDate.getMonth()+1;
                                var year = myDate.getFullYear();
                                var time = year + '-' + month + '-' + day;
                                db.query("select case when share_time like ? then share_price_new else 0 end share_price_new,case when commission_price_time like ? then commission_price_new else 0 end commission_price_new,IFNULL(forward_all,0) forward_all,IFNULL(share_all,0) share_all from `db_activity_log` where openid = ? ",[time,time,row['0'].openid]  , function(err4, row4, fields4) {
                                // 数据获取失败
                                    if (err4) {
                                        return res.errorEnd('没有找到可用数据', 200);
                                    }
                                   
                                    db.query("select IFNULL(count(id),0) goods_num from `db_order` where pid = ? and pay_status = 2 and status = 1",row['0'].id , function(err5, row5, fields5) {
                                    // 数据获取失败
                                        if (err5) {
                                            return res.errorEnd('没有找到可用数据5', 200);
                                        }
                                        var data = {'order_number' : row1.length,'people_number' : row2.length,'complete_order' : row3.length,'statistics': row4['0'],'user' : row['0'] ,'goods_num' : row5['0'].goods_num};
                                        db.release(); // 释放资源
                                        conn.end(); // 结束当前数据库链接
                                        console.log(data);
                                        return res.successEnd(data);
                                    })
                                })


                            })


                        })
                        
                    });
                    

                     
                    
                    
                    
                   
                });
            
        
    });


}