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

   
    var user = req.session.user_shopowner;
    // 链接数据库
    // 链接 / 操作数据库
    that.connect((err, db,conn) => {

     
     //记录查询日志
        if(!that.isEmpty(body.param_text)){

            db.query("INSERT INTO db_search_log ( shopowner_id, search_type, search_date, content) VALUES (?,1, unix_timestamp(now()),?);", [body.user_id,body.param_text], function(err, row, fields) {
                // 数据获取失败
 
            })
        }

        if(that.isEmpty(body.param_text)){
             body.param_text = "%%";
        }else{
            body.param_text = "%"+body.param_text+"%";
        } 

        //查询未付款订单
        if(body.status == 1){
            db.query("select a.*,b.name,c.nickname,c.mobile from `db_order` a inner join `db_product` b on a.gid = b.id inner join `db_people` c on a.cid = c.id where  a.status = 1 and  a.pay_status = 1 and ( a.sid = ?) AND ( a.title LIKE ? or a.pickup_information LIKE ? )   order by a.id desc", [body.user_id,body.param_text,body.param_text], function(err, row, fields) {
                // 数据获取失败
 
                if(row){
                    return res.successEnd(row);
                }else{
                    var row = {};
                    return res.successEnd(row);
                }

            })
        }else if(body.status == 2 ){
            db.query("select a.*,b.name,c.nickname,c.mobile from `db_order` a inner join `db_product` b on a.gid = b.id inner join `db_people` c on a.cid = c.id where  a.status = 1 and a.pay_status = 2 and ( a.sid = ?) AND ( a.title LIKE ? or a.pickup_information LIKE ? )   order by a.id desc", [body.user_id,body.param_text,body.param_text], function(err, row, fields) {
                // 数据获取失败
                
                if(row){
                    return res.successEnd(row);
                }else{
                    var row = {};
                    return res.successEnd(row);
                }

            })
        }else if(body.status == 4){
            db.query("select a.*,b.name,c.nickname,c.mobile from `db_order` a inner join `db_product` b on a.gid = b.id inner join `db_people` c on a.cid = c.id where  a.status = 1 and a.pay_status = 4 and ( a.sid = ?) AND ( a.title LIKE ? or a.pickup_information LIKE ? )   order by a.id desc", [body.user_id,body.param_text,body.param_text], function(err, row, fields) {
                // 数据获取失败

                if(row){
                    return res.successEnd(row);
                }else{
                    var row = {};
                    return res.successEnd(row);
                }

            })
        }else if(body.status == 3){
            db.query("select a.*,b.name,c.nickname,c.mobile from `db_order` a inner join `db_product` b on a.gid = b.id inner join `db_people` c on a.cid = c.id where  a.status = 1 and a.pay_status = 3 and ( a.sid = ?) AND ( a.title LIKE ? or a.pickup_information LIKE ? ) order by a.id desc", [body.user_id,body.param_text,body.param_text], function(err, row, fields) {
                // 数据获取失败

                
                if(row){
                    return res.successEnd(row);
                }else{
                    var row = {};
                    return res.successEnd(row);
                }

            })
        }
    });


}