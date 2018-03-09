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

    
    if(req.session.user_rows = null){
         return res.errorEnd('当前请求不存在 Token 或 Token 不可用', 300);
     }
    if(req.session.user_token != body.token){
         return res.errorEnd('当前请求不存在 Token 或 Token 不可用', 300);
    }
    if(  that.isEmpty(body.id) ){
            return res.errorEnd('个人不能为空', 200);
    }
    
   

    // 链接数据库
    // 链接 / 操作数据库
    that.connect((err, db,conn) => {
    

            db.query("SELECT count(id) as num FROM `all_in_out_money` WHERE   spokesman_id=? and in_out_type=1 and  type=6 and finish_time is null    order by create_date desc  ", [body.id], function(err, row, fields) {

                if (err) {
                    db.release(); // 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd("没有找到可用数据1", 200);
                }
                var _totalrecord = row[0].num; //总共有多少条数据
                var _totalpage  = Math.ceil(Number(row[0].num)/Number(body.pagesize)); // 总共有多少页
                var _pagesize    = Number(body.pagesize); // 每页有多少数据
                var _currentpage = Number(body.currentpage); // 当前页
                
                var sql = "select  * FROM `all_in_out_money` WHERE  spokesman_id=? and in_out_type=1 and  type=6 and finish_time is null   order by create_date desc limit  "+ _currentpage + "," + _pagesize;
                db.query(sql,[body.id], function(err, row, fields) {
                    // 数据获取失败
                    if (err) {
                        db.release(); // 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd("没有找到可用数据2", 200);
                    }

                    var back = {"totalrecord":_totalrecord,"totalpage":_totalpage,"pagesize":_pagesize,"currentpage":_currentpage}
                    back.list = row;
                    db.release(); // 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.successEnd(back);
                })
            })
            
        
    });


}