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
        if(body.index == 1){
            //查询排名
            db.query("select * from `db_people` where manager_id = ?", body.manager_id, function(err, row, fields) {
                row.forEach(function(value,key){  
                    db.query("select count(*) from `db_order` where pid = ?", row[key].id, function(err1, row1, fields1) {
                        row[key].order = row1[0]["count(*)"];
                    }) 
                    db.query("select sum(total_price) from `db_order` where pid = ?", row[key].id, function(err2, row2, fields2) {
                        row[key].total = row2[0]["sum(total_price)"];
                    }) 
                });  

                db.release(); // 释放资源
                conn.end(); // 结束当前数据库链接

                if(row){
                    return res.successEnd(row);
                }else{
                    var row1 = [];
                    return res.successEnd(row1);
                }
            })
        }else if(body.index == 2){
            //查询自己和自己下面的代言人的排名
            db.query("select * from `db_people` where token = ?", body.token, function(err9, row9, fields9) {
                db.query("select count(a.id) num from `db_people` a left join `db_activity_log` b on a.id = b.user_id where (a.prolocutor_id = ? or a.id = ?) and a.is_prolocutor = '1'",[row9['0'].id,row9['0'].id], function(err, row, fields) {
                    var _totalrecord = row[0].num; //总共有多少条数据
                    if(_totalrecord == 0){
                         var _totalpage = 0;
                    }else{
                        var _totalpage  = Math.ceil(Number(row[0].num)/Number(body.pagesize)); // 总共有多少页
                    }
                    var _pagesize    = Number(body.pagesize); // 每页有多少数据
                    var _currentpage = Number(body.currentpage); // 当前页
                    var sql = "select a.token,a.realname,a.openid,a.headimgurl,a.user_level,a.nickname,IFNULL(b.profit_all,0) profit_all,(select count(*) from db_order c where cid =a.id) order_number from `db_people` a left join `db_activity_log` b on a.id = b.user_id where (a.prolocutor_id = ? or a.id = ?) and a.is_prolocutor = '1' group by a.id order by b.profit_all desc,order_number desc,a.id asc limit  " + _currentpage + "," + _pagesize;
                    db.query(sql, [row9['0'].id,row9['0'].id], function(err1, row1, fields1) {

                        db.release(); // 释放资源
                        conn.end(); // 结束当前数据库链接
                        if(row1.length > 0){
                            var back = {"totalrecord":_totalrecord,"totalpage":_totalpage,"pagesize":_pagesize,"currentpage":_currentpage}
                            back.list = row1;
                            return res.successEnd(back);
                        }else{
                            var back = {"totalrecord":_totalrecord,"totalpage":_totalpage,"pagesize":_pagesize,"currentpage":_currentpage}
                            //var row1 = [];
                            back.list = 1;
                            return res.successEnd(back);
                        }
                    })
                })
            })
            //查询自己下面的代言人的排名
        }else if(body.index == 3){
            db.query("select * from `db_people` where token = ?", body.token, function(err9, row9, fields9) {
                db.query("select count(a.id) num from `db_people` a left join `db_activity_log` b on  a.id = b.user_id where a.prolocutor_id = ? and a.user_level < 5 and a.is_prolocutor = '1'", row9['0'].id, function(err, row, fields) {
                    var _totalrecord = row[0].num; //总共有多少条数据
                    if(_totalrecord == 0){
                         var _totalpage = 0;
                    }else{
                        var _totalpage  = Math.ceil(Number(row[0].num)/Number(body.pagesize)); // 总共有多少页
                    }
                    var _pagesize    = Number(body.pagesize); // 每页有多少数据
                    var _currentpage = Number(body.currentpage); // 当前页
                    var sql = "select a.token,a.realname,a.openid,a.headimgurl,a.user_level,a.nickname,IFNULL(b.profit_all,0) profit_all,(select count(*) from db_order where cid =a.id) order_number from `db_people` a left join `db_activity_log` b on a.id = b.user_id where a.prolocutor_id = ? and a.user_level < 5 and a.is_prolocutor = '1' order by b.profit_all desc,order_number desc,a.id asc limit " + _currentpage + "," + _pagesize;
                    db.query(sql, row9['0'].id, function(err1, row1, fields1) {
                        db.release(); // 释放资源
                        conn.end(); // 结束当前数据库链接
                        if(row1.length>0){
                            var back = {"totalrecord":_totalrecord,"totalpage":_totalpage,"pagesize":_pagesize,"currentpage":_currentpage}
                            back.list = row1;
                            return res.successEnd(back);
                        }else{
                            var back = {"totalrecord":_totalrecord,"totalpage":_totalpage,"pagesize":_pagesize,"currentpage":_currentpage}
                            //var row1 = [];
                            back.list = [];
                            return res.successEnd(back);
                        }
                    })
                })
            })    
        }else if(body.index == 4){
            db.query("select * from `db_people` where token = ?", body.token, function(err9, row9, fields9) {
                 db.query("select count(a.id) num from `db_people` a left join `db_activity_log` b on a.id = b.user_id where a.prolocutor_id = ? and a.user_level > 5 and a.user_level <10 and a.is_prolocutor = '1'", row9['0'].id, function(err, row, fields) {
                    var _totalrecord = row[0].num; //总共有多少条数据
                    if(_totalrecord == 0){
                         var _totalpage = 0;
                    }else{
                        var _totalpage  = Math.ceil(Number(row[0].num)/Number(body.pagesize)); // 总共有多少页
                    }
                    var _pagesize    = Number(body.pagesize); // 每页有多少数据
                    var _currentpage = Number(body.currentpage); // 当前页
                    var sql = "select a.token,a.realname,a.openid,a.headimgurl,a.user_level,a.nickname,IFNULL(b.profit_all,0) profit_all,(select count(*) from db_order where  cid =a.id) order_number from `db_people` a left join `db_activity_log` b on a.id = b.user_id where a.prolocutor_id = ? and a.user_level > 5 and a.user_level <10 and a.is_prolocutor = '1' order by b.profit_all desc,order_number desc,a.id asc limit " + _currentpage + "," + _pagesize;
                    db.query(sql, row9['0'].id, function(err1, row1, fields1) {
                        console.log(this.sql);
                        db.release(); // 释放资源
                        conn.end(); // 结束当前数据库链接
                        if(row1.length > 0){
                            var back = {"totalrecord":_totalrecord,"totalpage":_totalpage,"pagesize":_pagesize,"currentpage":_currentpage}
                            back.list = row1;
                            return res.successEnd(back);
                        }else{
                            var back = {"totalrecord":_totalrecord,"totalpage":_totalpage,"pagesize":_pagesize,"currentpage":_currentpage}
                            back.list = [];
                            return res.successEnd(back);
                        }
                    })
                })
            })
        }else if(body.index == 5){
            db.query("select * from `db_people` where token = ?", body.token, function(err9, row9, fields9) {
                db.query("select count(a.id) num from `db_people` a left join `db_activity_log` b on a.id = b.user_id where a.prolocutor_id = ?  and a.user_level = 10 and a.is_prolocutor = '1'", row9['0'].id, function(err, row, fields) {
                    var _totalrecord = row[0].num; //总共有多少条数据
                    if(_totalrecord == 0){
                         var _totalpage = 0;
                    }else{
                        var _totalpage  = Math.ceil(Number(row[0].num)/Number(body.pagesize)); // 总共有多少页
                    }
                    var _pagesize    = Number(body.pagesize); // 每页有多少数据
                    var _currentpage = Number(body.currentpage); // 当前页
                    var sql = "select a.token,a.realname,a.openid,a.headimgurl,a.user_level,a.nickname,IFNULL(b.profit_all,0) profit_all,(select count(*) from db_order where cid = a.id) order_number from `db_people` a left join `db_activity_log` b on a.id = b.user_id where a.prolocutor_id = ?  and a.user_level = 10  and a.is_prolocutor = '1' order by b.profit_all desc,order_number desc,a.id asc limit "+ _currentpage + "," + _pagesize;
                    db.query(sql, row9['0'].id, function(err1, row1, fields1) {
                        db.release(); // 释放资源
                        conn.end(); // 结束当前数据库链接
                        if(row1.length >0){
                            var back = {"totalrecord":_totalrecord,"totalpage":_totalpage,"pagesize":_pagesize,"currentpage":_currentpage}
                            back.list = row1;
                            return res.successEnd(back);
                        }else{
                            var back = {"totalrecord":_totalrecord,"totalpage":_totalpage,"pagesize":_pagesize,"currentpage":_currentpage}
                            var row1 = [];
                            back.list = [];
                            return res.successEnd(back);
                        }
                    })
                })
            })
        }
    });


}