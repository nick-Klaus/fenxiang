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
    //var  user_manager = req.session.user.manager;
    //查询完成订单和退款订单数量的
    that.connect((err, db,conn) => {
        var date = new Date();
        var day = date.getDate();
        var month = date.getMonth() +1;
        var year = date.getFullYear();
        var now_day = new Date(year+'-'+month+'-'+day);
        var now_time = now_day.getTime();
        var tomorrow_time = now_time+86400000;
        var now = now_time/1000;    //当天时间
        var tomorrow = tomorrow_time/1000; // 明天时间
        if(body.index == 1){
            // db.query("select count(a.id) count,sum(c.total_price) AS total_price,a.shop_name from (`db_shop` AS a left join `db_shopowner` AS b on a.id = b.shop_id) inner join `db_order` c on b.id = c.sid where a.manager_id = ? and a.status = 1 and c.status = 1 and c.mid = ? and c.create_time > ?  and c.create_time < ? and  c.pay_status = 3  group by a.id", [body.manager_id,body.manager_id,now,tomorrow], function(err, row, fields) {
            //     row['total_price'] = 0;
            //     row.forEach(function(value,key){
            //         row['total_price'] += parseFloat(row[key].total_price);
            //     })
            //     row.forEach(function(value,key){
            //         var a = row[key].total_price / row['total_price'];
            //         row[key]['order_price_proportion'] = a.toFixed(2);
            //     })
            //     if(row){
            //         db.release(); // 释放资源
            //         conn.end();
            //         return res.successEnd(row);
            //     }else{
            //         db.release(); // 释放资源
            //         conn.end();
            //         var row = {}
            //         return res.successEnd(row);
            //     }  
            // })
            db.query("select a.shop_name,b.id from `db_shop` a inner join `db_shopowner` b on a.id = b.shop_id where a.manager_id = ? and b.manager_id = ?", [body.manager_id,body.manager_id], function(err, row, fields) {
                if(row.length > 0){
                    row.forEach(function(value,key){
                        db.query("select IFNULL(sum(need_pay),0) total_price,IFNULL(count(id),0) order_num from `db_order` where mid = ? and sid = ? and status = 1 and pay_status = 3 and create_time > ?  and create_time < ?", [body.manager_id,value.id,now,tomorrow], function(err1, row1, fields1) {
                            row[key].total_price = row1[0].total_price;
                            row[key].order_num = row1[0].order_num;
                            if(row.length - 1 == key){
                                db.release(); // 释放资源
                                conn.end();
                                return res.successEnd(row);  
                            }
                        })
                    })
                }else{
                    var row = [];
                    db.release(); // 释放资源
                    conn.end();
                    return res.successEnd(row);  
                }
            })
        }
        
    });


}