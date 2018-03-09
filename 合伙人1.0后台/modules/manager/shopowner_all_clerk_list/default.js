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

    
    if(req.session.user_rows == null){
         return res.errorEnd('当前请求不存在 Token 或 Token 不可用', 300);
     }
    if(req.session.user_token != body.token){
         return res.errorEnd('当前请求不存在 Token 或 Token 不可用', 300);
    }
    if(req.session.user_manager == {}){
        return res.errorEnd('当前用户 非 老板权限', 300);
    }
    if(that.isEmpty(body.shopowner_id) ){
        return res.errorEnd('店长不能为空', 200);
    }
    


    var user = req.session.user_rows;

    if( !user.id ){
        return res.errorEnd('请求错误, Token 验证失败!!', 300);
    }

    that.connect((err, db,conn) => {    
        // 查询数据历史，有有历史次数加1，没有的新增
        var search_text=body.param_text;
        if(!that.isEmpty(body.param_text)){

            db.query("select * from db_search_log where search_type = 4 and manager_id =? and content =?", [user.manager_id,search_text], function(err, search_log, fields) {
                
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
                    db.query("INSERT INTO db_search_log ( manager_id, search_type, search_date, content) VALUES (?,4, unix_timestamp(now()),?);", [user.manager_id,search_text], function(err, row, fields) {
                        // 数据获取失败

                    })
                }

            })            
        }
       if(that.isEmpty(body.param_text)){
             body.param_text = "%%";
        }else{
            body.param_text = "%"+body.param_text+"%";
        } 
        db.query("select count(id) num from `db_people` a  where shopowner_id = ?  and is_prolocutor = '1' and is_clerk='1' AND ( a.nickname LIKE ? or a.realname LIKE ? or a.mobile like ? ) ", [body.shopowner_id,body.param_text,body.param_text,body.param_text] , function(err, row1, fields) {
                    if (err) {
                        db.release();// 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd("没有找到可用数据1", 200);
                    }

                    var _totalrecord = row1[0].num; //总共有多少条数据
                    var _totalpage  = Math.ceil(Number(row1[0].num)/Number(body.pagesize)); // 总共有多少页
                    var _pagesize    = Number(body.pagesize); // 每页有多少数据
                    var _currentpage = Number(body.currentpage); // 当前页
                    var sql = "select manager_id,is_clerk,is_prolocutor,is_shopowner,headimgurl,id,mobile,nickname,realname,token from `db_people` a  where shopowner_id = ?  and is_prolocutor = '1' and is_clerk='1' AND ( a.nickname LIKE ? or a.realname LIKE ? or a.mobile like ? ) order by is_shopowner desc limit  " + _currentpage + "," + _pagesize;
                    db.query(sql,[body.shopowner_id,body.param_text,body.param_text,body.param_text] ,  function(err1, row, fields1) {
                        if (err) {
                            db.release();// 释放资源
                            conn.end(); // 结束当前数据库链接
                            return res.errorEnd("没有找到可用数据", 200);
                        }
                        var back = {"totalrecord":_totalrecord,"totalpage":_totalpage,"pagesize":_pagesize,"currentpage":_currentpage}
                        back.list = row;
                        console.log(back);
                        db.release(); // 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.successEnd(back);  
                    });
        });
            
        
    });


}