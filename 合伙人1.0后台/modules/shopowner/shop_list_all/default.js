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

    that.connect((err, db,conn) => {




        var search_text=body.param_text;
        db.query("select * from db_search_log where search_type = 3 and manager_id =? and content =?", [body.manager_id,search_text], function(err, search_log, fields) {
            
            // 数据获取失败
            if (err) {
                db.release(); // 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd(没有找到可用数据2, 200);
            }

            if(search_log.length>0){
                db.query(" update db_search_log set search_times=search_times+1 ,search_date = unix_timestamp(now()) where id =? ", [search_log[0].id], function(err, row, fields) {
                    // 数据获取失败

                })
            }else{
                db.query("INSERT INTO db_search_log ( manager_id, search_type, search_date, content) VALUES (?,3, unix_timestamp(now()),?);", [body.manager_id,search_text], function(err, row, fields) {
                    // 数据获取失败

                })
            }

        })            
        
        if(that.isEmpty(body.param_text)){
             body.param_text = "%%";
        }else{
            body.param_text = "%"+body.param_text+"%";
        }

        

        let field = "";
        let sql  = "SELECT  a.*, b.id AS shopowner_id, b.realname AS shopowner_realname, b.mobile AS shopowner_mobile, b.tel AS shopowner_tel, b.address AS shopowner_address, b.amount AS shopowner_amount, b.cash AS shopowner_cash, b.status AS shopowner_status, b.openid AS shopowner_openid, b.policy_key AS shopowner_policy_key    ";
            

            
        sql += "   ,(select id from db_people d where d.shopowner_id=b.id and d.is_clerk='1' and d.is_prolocutor='1' and d.is_shopowner='1'  ) shopowner_people_id   ";
            sql += "   FROM   `db_shop` AS a, `db_shopowner` AS b ";
            sql += "WHERE b.shop_id = a.id AND a.manager_id = b.manager_id AND b.manager_id = ?  AND ( a.shop_name LIKE ? or a.description LIKE ? or a.address like ? or b.realname like ? )  LIMIT 0, 999";
        db.query( sql , [body.manager_id,body.param_text,body.param_text,body.param_text,body.param_text]  , function(err, row, fields) {
            // 数据获取失败
            if (err) {
                db.release();// 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd('没有找到可用数据1', 200);
            }
            db.release(); // 释放资源
            conn.end(); // 结束当前数据库链接
            if( row.length ){
                return res.successEnd(row);
            }else{
                return res.errorEnd('没有找到可用数据', 200);
            }
        });


    });


}