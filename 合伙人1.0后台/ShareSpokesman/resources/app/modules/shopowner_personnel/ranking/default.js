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

    
    // if(req.session.user_rows == null){
    //      return res.errorEnd('当前请求不存在 Token 或 Token 不可用', 300);
    //  }
    // if(req.session.user_token != body.token){
    //      return res.errorEnd('当前请求不存在 Token 或 Token 不可用', 300);
    // }
    // if(req.session.user_shopowner== {}){
    //     if(req.session.user_manager== {}){
    //         return res.errorEnd('当前用户 非 店长权限', 300);
    //     }
    // }
    that.connect((err, db,conn) => {
    if(body.status == 0){
        db.query("select count(1) num from `db_people` a left join `db_activity_log` b on a.id = b.user_id  where a.shopowner_id = ? and is_prolocutor = '1'  order by b.profit_month desc", body.shopowner_id , function(err, row, fields) {
            var _totalrecord = row[0].num; //总共有多少条数据
            if(_totalrecord == 0){
                 var _totalpage = 0;
            }else{
                var _totalpage  = Math.ceil(Number(row[0].num)/Number(body.pagesize)); // 总共有多少页
            }
            var _pagesize    = Number(body.pagesize); // 每页有多少数据
            var _currentpage = Number(body.currentpage); // 当前页
            var sql = "select a.token,a.id,a.realname,a.nickname,a.headimgurl,a.user_level,b.profit_month profit from `db_people` a left join `db_activity_log` b on a.id = b.user_id  where a.shopowner_id = ?  and is_prolocutor = '1'  order by b.profit_month desc limit  " + _currentpage + "," + _pagesize;
            db.query(sql, body.shopowner_id , function(err1, row1, fields1) {
                if(row1.length == 0){
                    var back = {"totalrecord":_totalrecord,"totalpage":_totalpage,"pagesize":_pagesize,"currentpage":_currentpage}
                    back.list = [];
                    return res.successEnd(back);
                }
                var date = new Date();
                var day = date.getDate();
                var month = date.getMonth() +1;
                var last_month = date.getMonth() +2;
                var year = date.getFullYear();
                var now_month = new Date(year+'-'+month+'-'+1);
                var last_month = new Date(year+'-'+last_month+'-'+1);
                var now_month_time = now_month.getTime();
                var last_month_time = last_month.getTime();
                var now = now_month_time/1000;    //当月时间
                var last = last_month_time/1000; // 下个月时间
                row1.forEach(function(value,key){
                    db.query("select count(1) order_num from `db_order`  where cid = ?  and create_time > ? and create_time < ?", [value.id,now,last] , function(err2, row2, fields2) {
                    // 数据获取失败
                        row1[key]['order_num'] = row2['0']['order_num'];
                        if(key == row1.length -1){
                            if(row1){
                                var back = {"totalrecord":_totalrecord,"totalpage":_totalpage,"pagesize":_pagesize,"currentpage":_currentpage}
                                back.list = row1;
                                db.release(); // 释放资源
                                conn.end(); // 结束当前数据库链接
                                return res.successEnd(back);
                            }
                        }
                    });
                })  
            });
        });

    }else if(body.status == 1){
        db.query("select count(1) num from `db_people` a left join `db_activity_log` b on a.id = b.user_id  where a.shopowner_id = ? and is_prolocutor = '1'  order by b.profit_all desc", body.shopowner_id , function(err, row, fields) {
        // 数据获取失败
            var _totalrecord = row[0].num; //总共有多少条数据
            if(_totalrecord == 0){
                 var _totalpage = 0;
            }else{
                var _totalpage  = Math.ceil(Number(row[0].num)/Number(body.pagesize)); // 总共有多少页
            }
            var _pagesize    = Number(body.pagesize); // 每页有多少数据
            var _currentpage = Number(body.currentpage); // 当前页
            var sql = "select a.token,a.id,a.realname,a.nickname,a.headimgurl,a.user_level,b.profit_all profit from `db_people` a left join `db_activity_log` b on a.id = b.user_id  where a.shopowner_id = ? and is_prolocutor = '1'  order by b.profit_all desc limit  " + _currentpage + "," + _pagesize;
            db.query(sql, body.shopowner_id , function(err1, row1, fields1) {
            // 数据获取失败
                if(row1.length == 0){
                    var back = {"totalrecord":_totalrecord,"totalpage":_totalpage,"pagesize":_pagesize,"currentpage":_currentpage}
                    back.list = [];
                    return res.successEnd(back);
                }
                row1.forEach(function(value,key){
                    db.query("select count(1) order_num from `db_order`  where cid = ? ", [value.id] , function(err2, row2, fields2) {
                    // 数据获取失败
                        row1[key]['order_num'] = row2['0']['order_num'];
                        if(key == row1.length -1){
                            if(row1){
                                var back = {"totalrecord":_totalrecord,"totalpage":_totalpage,"pagesize":_pagesize,"currentpage":_currentpage}
                                back.list = row1;
                                db.release(); // 释放资源
                                conn.end(); // 结束当前数据库链接
                                return res.successEnd(back);
                            }
                        }
                    });
                })
            });
        });

    }     

            
        
    });


}