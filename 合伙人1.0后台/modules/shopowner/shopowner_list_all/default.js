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
    if(that.isEmpty(body.manager_id) ){
         return res.errorEnd('老板不能为空', 300);
    }
   

    var shopowner = req.session.user_shopowner;
    // 链接数据库
    // 链接 / 操作数据库
    that.connect((err, db,conn) => {



        // 查询数据历史，有有历史次数加1，没有的新增
        var search_text=body.param_text;
        if(!that.isEmpty(body.param_text)){

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
        }
        if(that.isEmpty(body.param_text)){
             body.param_text = "%%";
        }else{
            body.param_text = "%"+body.param_text+"%";
        } 

       db.query("SELECT count(1) as num  from db_shopowner a left join db_shop b on a.shop_id =b.id   where  a.manager_id = ? AND ( b.shop_name LIKE ? or b.description LIKE ? or b.address like ? or a.realname like ? )   order by a.id desc ",[body.manager_id,body.param_text,body.param_text,body.param_text,body.param_text], function(err, row1, fields) {
                // 数据获取失败
                if (err) {
                    db.release();// 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd("没有找到可用数据", 200);
                }
                var _totalrecord = row1[0].num; //总共有多少条数据
                var _totalpage  = Math.ceil(Number(row1[0].num)/Number(body.pagesize)); // 总共有多少页
                var _pagesize    = Number(body.pagesize); // 每页有多少数据
                var _currentpage = Number(body.currentpage); // 当前页
                var sql = "select  a.id  shopowner_id ,(select count(1) from db_people c where c.shopowner_id=a.id and is_clerk='1'  ) people_num,(select count(1) from db_people c where c.shopowner_id=a.id and is_clerk='0' and is_prolocutor='1'  ) prolocutor_num, a.*,b.* ,(select id from db_people d where d.shopowner_id=a.id and is_clerk='1' and is_prolocutor='1' and is_shopowner='1'  ) shopowner_people_id from db_shopowner a left join db_shop b on a.shop_id =b.id  where  a.manager_id = ? AND ( b.shop_name LIKE ? or b.description LIKE ? or b.address like ? or a.realname like ? )   order by a.id desc limit "+ _currentpage + "," + _pagesize;
                    db.query(sql,[body.manager_id,body.param_text,body.param_text,body.param_text,body.param_text], function(err, row, fields) {
                    // 数据获取失败
                    if (err) {
                        db.release();// 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd("没有找到可用数据", 200);
                    }
                    var people_num=0;
                    var prolocutor_num=0;
                    for(var i=0;i<row.length;i++){
                        people_num+=row[i].people_num;
                        prolocutor_num+=row[i].prolocutor_num;
                    }
                    var back = {"totalrecord":_totalrecord,"totalpage":_totalpage,"pagesize":_pagesize,"currentpage":_currentpage}
                    back.shop_num=_totalrecord;
                    back.people_num=people_num;
                    back.prolocutor_num=prolocutor_num;
                    back.list = row;

                    db.release(); // 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.successEnd(back);
                })
            })


    });


}