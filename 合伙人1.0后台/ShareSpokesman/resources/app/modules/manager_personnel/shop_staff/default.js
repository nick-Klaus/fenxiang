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
    var user = req.session.user_rows;
    that.connect((err, db,conn) => {    
                
    db.query("select a.image,b.id,a.shop_name,a.create_date,a.address,a.manager_id,(select count(1) from activity_all where shopowner_id=b.id and status=1 ) activity_num from `db_shop` a inner join `db_shopowner` b on a.id = b.shop_id  where a.id = ?  ", body.id , function(err, row, fields) {
        if (err) {
            db.release();// 释放资源
            conn.end(); // 结束当前数据库链接

            return res.errorEnd("没有找到可用数据1", 200);
        }
        if(row.length == 0 ){
            var data = {};
            db.release(); // 释放资源
            conn.end(); // 结束当前数据库链接
            return res.successEnd(data);
        }

        db.query("select count(id) num from `db_people`  where shopowner_id = ?  and (is_clerk = '1' or is_prolocutor = '1') and is_shopowner = '0' and manager_id = ? ", [row[0].id,row[0].manager_id] , function(err999, row999, fields999) {
                var _totalrecord = row[0].num; //总共有多少条数据
                    if(_totalrecord == 0){
                         var _totalpage = 0;
                    }else{
                        var _totalpage  = Math.ceil(Number(row999[0].num)/Number(body.pagesize)); // 总共有多少页
                    }
                    var _pagesize    = Number(body.pagesize); // 每页有多少数据
                    var _currentpage = Number(body.currentpage); // 当前页
                    var sql = "select manager_id,is_clerk,is_prolocutor,is_shopowner,headimgurl,id,mobile,nickname,realname,token from `db_people`  where shopowner_id = "+ row[0].id+ " and manager_id = "+row[0].manager_id +" and (is_clerk = '1' or is_prolocutor = '1') order by is_shopowner desc limit  " + _currentpage + "," + _pagesize;
            db.query(sql,  function(err1, row1, fields1) {
                if (err) {
                    db.release();// 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd("没有找到可用数据", 200);
                }
                if(row1.length>0){
                    db.query("select IFNULL(count(id),0) clerk_num from `db_people`  where shopowner_id = ?  and is_clerk = '1' and is_shopowner = '0' and manager_id = ?",[row[0].id,row[0].manager_id] , function(err3, row3, fields3) {
                        db.query("select IFNULL(count(id),0) prolocutor_num from `db_people`  where shopowner_id = ?  and is_clerk = '0' and is_prolocutor = '1' and is_shopowner = '0' and manager_id = ?",[row[0].id,row[0].manager_id], function(err4, row4, fields4) {
                                var data = { "data" : row ,'staff' : row1,'prolocutor_num' : row4[0].prolocutor_num ,'clerk_num' : row3[0].clerk_num ,"totalrecord":_totalrecord,"totalpage":_totalpage,"pagesize":_pagesize,"currentpage":_currentpage};
                                db.release(); // 释放资源
                                conn.end(); // 结束当前数据库链接
                                return res.successEnd(data);  
                        });  
                    });  
                }else{
                    db.query("select IFNULL(count(id),0) clerk_num from `db_people`  where shopowner_id = ?  and is_clerk = '1' and is_shopowner = '0'", row[0].id , function(err3, row3, fields3) {
                        db.query("select IFNULL(count(id),0) prolocutor_num from `db_people`  where shopowner_id = ?  and is_clerk = '0' and is_prolocutor = '1' and is_shopowner = '0' and manager_id = ?", [row[0].id,row[0].manager_id], function(err4, row4, fields4) {
                            if (err) {
                                db.release();// 释放资源
                                conn.end(); // 结束当前数据库链接
                                return res.errorEnd("没有找到可用数据3", 200);
                            }
                                var data = { "data" : row ,'staff' : [] ,'prolocutor_num' : row4[0].prolocutor_num ,'clerk_num' : row3[0].clerk_num,"totalrecord":_totalrecord,"totalpage":_totalpage,"pagesize":_pagesize,"currentpage":_currentpage};
                                db.release(); // 释放资源
                                conn.end(); // 结束当前数据库链接
                                return res.successEnd(data); 
                        });  
                    }); 
                }
            });
        });
            
    });
            
        
    });


}