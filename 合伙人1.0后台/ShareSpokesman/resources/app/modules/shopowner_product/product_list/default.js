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




       if(that.isEmpty(body.manager_id) ){
            db.rollback();
            db.release();// 释放资源
            conn.end(); // 结束当前数据库链接
            return res.errorEnd('老板不能为空', 200);
        }
        var     add_sql="";
        if(!that.isEmpty(body.shopowner_id) ){
            add_sql=" AND  sid = "+body.shopowner_id;
        }

        if(body.status == 1){
            var  sql = "select * from `db_product` where  mid = ?   "+add_sql+" and status = 1 order by id desc  limit" +" "  + body.currentpage +',' +body.pagesize;
            db.query(sql  ,[body.manager_id], function(err, row, fields) {
            // 数据获取失败
            db.query("select count(id) totalrecord  from `db_product` where  mid = ?  "+add_sql+" and status = 1 order by id desc ", [body.manager_id] , function(err1, row1, fields1) {
            // 数据获取失败
                    if (err) {
                        db.rollback();
                        db.release();// 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd('没有找到可用数据', 200);
                    }
                    
                    var  len = row.length;
                    function forEach(index) {
                        if( index >= len  ){
                            var totalrecord = row1['0']['totalrecord'];
                            var totalpage = row1['0']['totalrecord'] / body.pagesize;
                            var b  = totalpage.toFixed(0);
                            if(b < totalpage){
                                b = parseInt(b)+1;
                            }
                            if(totalpage < 1){
                                totalpage = 1;
                            }
                            db.release(); // 释放资源
                            conn.end(); // 结束当前数据库链接
                            if(row){
                                var data = { "list" : row , "totalrecord" : totalrecord ,"totalpage" : b,"currentpage" : body.currentpage ,"pagesize"  : body.pagesize}
                                return res.successEnd(data);
                            }
                        }
                        db.query("SELECT to_shopowner_id as shopowner_id  FROM `product_all_new` WHERE mid = ? and id=? and status=? ;",[body.manager_id,row[index].id,body.status], function(err, row_group, fields) {
                            // 数据获取失败
                            if (err) {
                                console.log(this.sql);
                                db.release();// 释放资源
                                conn.end(); // 结束当前数据库链接
                                return res.errorEnd("没有找到可用数据2", 200);
                            }
                            row[index].product_all = row_group;
                            forEach(index+1);
                        });
                    }
                    forEach(0);

                });
            });
        }else if(body.status == 2){
            var  sql = "select * from `db_product` where  mid = ? "+add_sql+" and status = 2 order by id desc  limit" +" "  + body.currentpage +',' +body.pagesize;
            db.query(sql  ,[body.manager_id], function(err, row, fields) {
            // 数据获取失败
                db.query("select count(id) totalrecord  from `db_product` where  mid = ?   "+add_sql+" and status = 2 order by id desc   ", [body.manager_id] , function(err1, row1, fields1) {
            // 数据获取失败
                    if (err) {
                        db.rollback();
                        db.release();// 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd('没有找到可用数据', 200);
                    }
                    var  len = row.length;
                    function forEach(index) {
                        if( index >= len  ){
                            var totalrecord = row1['0']['totalrecord'];
                            var totalpage = row1['0']['totalrecord'] / body.pagesize;
                            var b  = totalpage.toFixed(0);
                            if(b < totalpage){
                                b = parseInt(b)+1;
                            }
                            if(totalpage < 1){
                                totalpage = 1;
                            }
                            db.release(); // 释放资源
                            conn.end(); // 结束当前数据库链接
                            if(row){
                                var data = { "list" : row , "totalrecord" : totalrecord ,"totalpage" : b,"currentpage" : body.currentpage ,"pagesize"  : body.pagesize}
                                return res.successEnd(data);
                            }
                        }
                        db.query("SELECT to_shopowner_id as shopowner_id  FROM `product_all_new` WHERE mid = ? and id=? and status=? ;",[body.manager_id,row[index].id,body.status], function(err, row_group, fields) {
                            // 数据获取失败
                            if (err) {
                                db.release();// 释放资源
                                conn.end(); // 结束当前数据库链接
                                return res.errorEnd("没有找到可用数据2", 200);
                            }
                            row[index].product_all = row_group;
                            forEach(index+1);
                        });
                    }
                    forEach(0);

                });
            });
        }else if(body.status == 3){
            var  sql = "select * from `db_product` where mid = ? "+add_sql+" and status = 3 order by id  desc  limit" +" "  + body.currentpage +',' +body.pagesize;
            db.query(sql  ,[body.manager_id] , function(err, row, fields) {
            // 数据获取失败
                db.query("select count(id) totalrecord  from `db_product` where mid = ? "+add_sql+" and status = 3 order by id desc   ", [body.manager_id] , function(err1, row1, fields1) {
            // 数据获取失败
                    if (err) {
                        db.rollback();
                        db.release();// 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd('没有找到可用数据', 200);
                    }
                    var  len = row.length;
                    function forEach(index) {
                        if( index >= len  ){
                            var totalrecord = row1['0']['totalrecord'];
                            var totalpage = row1['0']['totalrecord'] / body.pagesize;
                            var b  = totalpage.toFixed(0);
                            if(b < totalpage){
                                b = parseInt(b)+1;
                            }
                            if(totalpage < 1){
                                totalpage = 1;
                            }
                            db.release(); // 释放资源
                            conn.end(); // 结束当前数据库链接
                            if(row){
                                var data = { "list" : row , "totalrecord" : totalrecord ,"totalpage" : b,"currentpage" : body.currentpage ,"pagesize"  : body.pagesize}
                                return res.successEnd(data);
                            }
                        }
                        db.query("SELECT to_shopowner_id as shopowner_id  FROM `product_all_new` WHERE mid = ? and id=? and status=? ;",[body.manager_id,row[index].id,body.status], function(err, row_group, fields) {
                            // 数据获取失败
                            if (err) {
                                db.release();// 释放资源
                                conn.end(); // 结束当前数据库链接
                                return res.errorEnd("没有找到可用数据2", 200);
                            }
                            row[index].product_all = row_group;
                            forEach(index+1);
                        });
                    }
                    forEach(0);

                });
            });
        }else if(body.status == 0){
            var  sql = "select * from `db_product` where mid = ? "+add_sql+" and status != 99  order by id  desc  limit" +" "  + body.currentpage +',' +body.pagesize;
            db.query(sql  ,[body.manager_id] , function(err, row, fields) {
            // 数据获取失败
                db.query("select count(id) totalrecord  from `db_product` where mid = ? "+add_sql+" and status != 99 order by id  desc  ", [body.manager_id] , function(err1, row1, fields1) {
            // 数据获取失败
                    if (err) {
                        db.rollback();
                        db.release();// 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd('没有找到可用数据', 200);
                    }
                    var  len = row.length;
                    function forEach(index) {
                        if( index >= len  ){
                            var totalrecord = row1['0']['totalrecord'];
                            var totalpage = row1['0']['totalrecord'] / body.pagesize;
                            var b  = totalpage.toFixed(0);
                            if(b < totalpage){
                                b = parseInt(b)+1;
                            }
                            if(totalpage < 1){
                                totalpage = 1;
                            }
                            db.release(); // 释放资源
                            conn.end(); // 结束当前数据库链接
                            if(row){
                                var data = { "list" : row , "totalrecord" : totalrecord ,"totalpage" : b,"currentpage" : body.currentpage ,"pagesize"  : body.pagesize}
                                return res.successEnd(data);
                            }
                        }
                        db.query("SELECT to_shopowner_id as shopowner_id  FROM `product_all_new` WHERE mid = ? and id=? and status != 99 ;",[body.manager_id,row[index].id], function(err, row_group, fields) {
                            // 数据获取失败
                            if (err) {
          
                                db.release();// 释放资源
                                conn.end(); // 结束当前数据库链接
                                return res.errorEnd("没有找到可用数据2", 200);
                            }
                            row[index].product_all = row_group;
                            forEach(index+1);
                        });
                    }
                    forEach(0);

                });
            });
        }
    });


}