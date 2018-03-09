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

   
    var user = req.session.user_rows;
    // 链接数据库
    // 链接 / 操作数据库
    that.connect((err, db,conn) => {
        // 查询数据历史，有有历史次数加1，没有的新增

            db.query("select count(1) num from `db_order` a inner join `db_product` b on a.gid = b.id inner join `db_people` c on a.cid = c.id where  a.status = 0 and  a.pay_status in (1,2) and  a.cid = ? and a.special_type=1  order by a.id desc", [body.user_id], function(err, row, fields) {
       
                var _totalrecord = row[0].num; //总共有多少条数据
                var _totalpage  = Math.ceil(Number(row[0].num)/Number(body.pagesize)); // 总共有多少页
                var _pagesize    = Number(body.pagesize); // 每页有多少数据
                var _currentpage = Number(body.currentpage); // 当前页
                if(row[0].num == 0){
                        db.release(); // 释放资源
                        conn.end(); // 结束当前数据库链接
                    var back = {"totalrecord":0,"totalpage":0,"pagesize":0,"currentpage":0}
                    return res.successEnd(back);
                }else{
                    var sql = "select a.*,b.name,c.nickname,c.mobile from `db_order` a inner join `db_product` b on a.gid = b.id inner join `db_people` c on a.cid = c.id where  a.status = 0 and  a.pay_status in (1,2) and  a.cid = ? and a.special_type=1  order by a.id desc limit  " + _currentpage + "," + _pagesize;
                    db.query(sql, [body.user_id], function(err1, row1, fields1) {
                        // 数据获取失败
                        row1.forEach(function(value,key){
                            db.query("select b.address,b.phone,b.shop_name from `db_shopowner` a inner join `db_shop` b on a.shop_id = b.id where a.id = ?", [value.sid], function(err2, row2, fields2) {
                                // 数据获取失败
                                if(row2){
                                    row1[key].shop_address = row2[0].address;
                                    row1[key].shop_phone = row2[0].phone;
                                    row1[key].shop_name = row2[0].shop_name;
                                }else{
                                    row1[key].shop_address = '';
                                    row1[key].shop_phone = '';
                                    row1[key].shop_name = '';
                                }
                                if(err){
                                    row1[key].shop_address = '';
                                    row1[key].shop_phone = '';
                                    row1[key].shop_name = '';
                                }
                                if(key == row1.length - 1){
                                    var back = {"totalrecord":_totalrecord,"totalpage":_totalpage,"pagesize":_pagesize,"currentpage":_currentpage}
                                    back.list = row1;
                                    db.release(); // 释放资源
                                    conn.end(); // 结束当前数据库链接
                                    return res.successEnd(back);
                                }
                            })
                        })
                    })  
                }
            })

         
    });


}