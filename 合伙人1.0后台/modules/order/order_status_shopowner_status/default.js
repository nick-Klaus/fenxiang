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
    if(that.isEmpty(body.shopowner_id) ){
         return res.errorEnd('店长不能为空', 300);
    }
   

    var shopowner = req.session.user_shopowner;
    // 链接数据库
    // 链接 / 操作数据库
    that.connect((err, db,conn) => {

        // 查询数据历史，有有历史次数加1，没有的新增
        var search_text=body.param_text;
        if(!that.isEmpty(body.param_text)){

            db.query("select * from db_search_log where search_type = 1 and shopowner_id =? and content =?", [body.shopowner_id,search_text], function(err, search_log, fields) {
                
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
                    db.query("INSERT INTO db_search_log ( shopowner_id, search_type, search_date, content) VALUES (?,1, unix_timestamp(now()),?);", [body.shopowner_id,search_text], function(err, row, fields) {
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


        if(body.status == 0){
       
            db.query("SELECT count(1) as num  from `db_order` a inner join `db_product` b on a.gid = b.id inner join `db_people` c on a.cid = c.id where  a.status = 0 and a.pay_status=3  and ( a.sid = ?) AND ( a.title LIKE ? or a.pickup_information LIKE ?  or a.order_no LIKE ? ) and a.special_type=0   order by a.id desc ",[body.shopowner_id,body.param_text,body.param_text,body.param_text], function(err, row1, fields) {
                // 数据获取失败
                if (err) {
                    db.release(); // 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd("没有找到可用数据", 200);
                }
                var _totalrecord = row1[0].num; //总共有多少条数据
                var _totalpage  = Math.ceil(Number(row1[0].num)/Number(body.pagesize)); // 总共有多少页
                var _pagesize    = Number(body.pagesize); // 每页有多少数据
                var _currentpage = Number(body.currentpage); // 当前页
                var sql = "select a.*,b.name,c.nickname,c.mobile ,c.realname ,( select address from db_shop  where id = "+shopowner.shop_id+") shop_address ,( select shop_name from db_shop  where id = "+shopowner.shop_id+") shop_name,( select phone from db_shop  where id = "+shopowner.shop_id+") shop_phone  from `db_order` a inner join `db_product` b on a.gid = b.id inner join `db_people` c on a.cid = c.id where  a.status = 0  and a.pay_status=3 and ( a.sid = ?) AND ( a.title LIKE ? or a.pickup_information LIKE ?  or a.order_no LIKE ? )  and a.special_type=0  order by a.id desc limit "+ _currentpage + "," + _pagesize;
                    db.query(sql,[body.shopowner_id,body.param_text,body.param_text,body.param_text], function(err, row, fields) {
                    // 数据获取失败
                    if (err) {
                        db.release(); // 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd("没有找到可用数据", 200);
                    }
                    var back = {"totalrecord":_totalrecord,"totalpage":_totalpage,"pagesize":_pagesize,"currentpage":_currentpage}
                    back.list = row;
                    db.release(); // 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.successEnd(back);
                })
            })



        }else if(body.status == 1 ){
              db.query("SELECT count(1) as num  from `db_order` a inner join `db_product` b on a.gid = b.id inner join `db_people` c on a.cid = c.id where  a.status = 1 and a.pay_status=3  and ( a.sid = ?) AND ( a.title LIKE ? or a.pickup_information LIKE ?  or a.order_no LIKE ? ) and a.special_type=0  order by a.id desc ",[body.shopowner_id,body.param_text,body.param_text,body.param_text], function(err, row1, fields) {
                // 数据获取失败
                if (err) {
                    db.release(); // 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd("没有找到可用数据", 200);
                }
                console.log(body);
                var _totalrecord = row1[0].num; //总共有多少条数据
                var _totalpage  = Math.ceil(Number(row1[0].num)/Number(body.pagesize)); // 总共有多少页
                var _pagesize    = Number(body.pagesize); // 每页有多少数据
                var _currentpage = Number(body.currentpage); // 当前页
                var sql = "select a.*,b.name,c.nickname,c.mobile,c.realname ,( select address from db_shop  where id = "+shopowner.shop_id+") shop_address ,( select shop_name from db_shop  where id = "+shopowner.shop_id+") shop_name,( select phone from db_shop  where id = "+shopowner.shop_id+") shop_phone   from `db_order` a inner join `db_product` b on a.gid = b.id inner join `db_people` c on a.cid = c.id where  a.status = 1  and a.pay_status=3 and ( a.sid = ?) AND ( a.title LIKE ? or a.pickup_information LIKE ?  or a.order_no LIKE ? ) and a.special_type=0  order by a.id desc limit "+ _currentpage + "," + _pagesize;
                    db.query(sql,[body.shopowner_id,body.param_text,body.param_text,body.param_text], function(err, row, fields) {
                    // 数据获取失败
                    if (err) {
                        db.release(); // 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd("没有找到可用数据", 200);
                    }
                    var back = {"totalrecord":_totalrecord,"totalpage":_totalpage,"pagesize":_pagesize,"currentpage":_currentpage}
                    back.list = row;
                    db.release(); // 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.successEnd(back);
                })
            })
        }else if(body.status == 2){
                  db.query("SELECT count(1) as num  from `db_order` a inner join `db_product` b on a.gid = b.id inner join `db_people` c on a.cid = c.id where  a.status = 2 and a.pay_status=3 and ( a.sid = ?) AND ( a.title LIKE ? or a.pickup_information LIKE ?  or a.order_no LIKE ? )  and a.special_type=0  order by a.id desc ",[body.shopowner_id,body.param_text,body.param_text,body.param_text], function(err, row1, fields) {
                // 数据获取失败
                if (err) {
                    db.release(); // 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd("没有找到可用数据", 200);
                }
                var _totalrecord = row1[0].num; //总共有多少条数据
                var _totalpage  = Math.ceil(Number(row1[0].num)/Number(body.pagesize)); // 总共有多少页
                var _pagesize    = Number(body.pagesize); // 每页有多少数据
                var _currentpage = Number(body.currentpage); // 当前页
                var sql = "select a.*,b.name,c.nickname,c.mobile,c.realname ,( select address from db_shop  where id = "+shopowner.shop_id+") shop_address ,( select shop_name from db_shop  where id = "+shopowner.shop_id+") shop_name,( select phone from db_shop  where id = "+shopowner.shop_id+") shop_phone   from `db_order` a inner join `db_product` b on a.gid = b.id inner join `db_people` c on a.cid = c.id where  a.status = 2 and a.pay_status=3  and ( a.sid = ?) AND ( a.title LIKE ? or a.pickup_information LIKE ?  or a.order_no LIKE ? ) and a.special_type=0   order by a.id desc limit "+ _currentpage + "," + _pagesize;
                    db.query(sql,[body.shopowner_id,body.param_text,body.param_text,body.param_text], function(err, row, fields) {
                    // 数据获取失败
                    if (err) {
                        db.release(); // 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd("没有找到可用数据", 200);
                    }
                    var back = {"totalrecord":_totalrecord,"totalpage":_totalpage,"pagesize":_pagesize,"currentpage":_currentpage}
                    back.list = row;
                    db.release(); // 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.successEnd(back);
                })
            })
        }
    });


}