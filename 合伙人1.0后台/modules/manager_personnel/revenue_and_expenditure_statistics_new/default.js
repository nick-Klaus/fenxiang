// Node 内置模块
// const fs = require('fs'); // 文件操作模块
// const url = require('url'); // 链接处理模块
// const path = require('path'); // 路径处理模块
// const http = require('http'); // 网页请求模块
// const crypto = require('crypto');// 加密模块
// const child_process = require('child_process');// 进程通信模块
// 第三方模块
// const ftp = require('ftp');// FTP模块
const moment = require('moment'); // 时间处理插件

'use strict';
exports.ready = (req, res, that) => {

    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query; // 当前请求传递过来的 GET 数据,
    const body = req.body; // 当前请求传递过来的 POST 数据

    // that 里面有什么可以调用的 你可以看 resources\app\lib\core.js 文件!
    // 例如 that.isEmpty(123) // 判断传入的值, 是否是空 具体看方法说明!!!

    // 链接数据库
    // 链接 / 操作数据库


    // if(req.session.user_rows == null){
    //      return res.errorEnd('当前请求不存在 Token 或 Token 不可用', 300);
    //  }
    // if(req.session.user_token != body.token){
    //      return res.errorEnd('当前请求不存在 Token 或 Token 不可用', 300);
    // }
    // if(req.session.user_manager == {}){
    //     return res.errorEnd('当前用户 非 老板权限', 300);
    // }
    var user = req.session.user_rows;
    var manager = req.session.user_manager;
    that.connect((err, db,conn) => {
    var date = new Date();
    var today = moment().format('X');



    var now_time = moment().format('YYYY-MM-DD HH:mm:ss');




    var money_in_4 = {'money_in_4' : 0 ,'percentage' : 0};
    var money_in_5 = {'money_in_5' : 0 ,'percentage' : 0};
    var money_in_8 = {'money_in_8' : 0 ,'percentage' : 0};
    var money_in_12 = {'money_in_12' : 0 ,'percentage' : 0};
    

    var money_out_1 = {'money_out_1' : 0 ,'percentage' : 0};
    var money_out_2 = {'money_out_2' : 0 ,'percentage' : 0};
    var money_out_4 = {'money_out_4' : 0 ,'percentage' : 0};
    var money_out_5 = {'money_out_5' : 0 ,'percentage' : 0};
    var money_out_6 = {'money_out_6' : 0 ,'percentage' : 0};
    var money_out_7 = {'money_out_7' : 0 ,'percentage' : 0};
    var money_out_8 = {'money_out_8' : 0 ,'percentage' : 0};
    var money_out_9 = {'money_out_9' : 0 ,'percentage' : 0};


    var data = {
        'total_price' :0 ,
        'money_in_4' :money_in_4,
        'money_in_5' :money_in_5 ,
        'money_in_8' :money_in_8,
        'money_in_12' :money_in_12 ,
        'money_out_1' :money_out_1 ,
        'money_out_2' :money_out_2 ,
        'money_out_4' :money_out_4 ,
        'money_out_5' :money_out_5 ,
        'money_out_6' :money_out_6 ,
        'money_out_7' :money_out_7 ,
        'money_out_8' :money_out_8 ,
        'money_out_9' :money_out_9 
    };
 

    if(body.status == 1){

        var seven_time = moment().subtract(7, 'days').format('YYYY-MM-DD HH:mm:ss');
        db.query("SELECT ifNull(sum(MONEY),0) total_price FROM `all_in_out_money` WHERE money>0 and manager_id=? and ((in_out_type=1 and type in (4,5,8,12)) or (in_out_type=2 and type in (1,2,4,5,6,7,8,9))) and create_days > ? and create_days < ? ",[body.manager_id,seven_time,now_time], function(err, row1, fields) {     
                // 数据获取失败
                if (err) {                          
                    db.release();// 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd("没有找到可用数据", 200);
                }
                data.total_price = row1[0].total_price; //总共有多少条数据

                if(data.total_price>0){
                    var sql = "SELECT in_out_type,type,sum(MONEY) moeny FROM `all_in_out_money` WHERE money>0 and manager_id=? and ((in_out_type=1 and type in (4,5,8,12)) or (in_out_type=2 and type in (1,2,4,5,6,7,8,9))) and create_days > ? and create_days < ?  group by in_out_type,type  ";
                    db.query(sql,[body.manager_id,seven_time,now_time], function(err, row, fields) {
               
                        // 数据获取失败
                        if (err) {                          
                            db.release();// 释放资源
                            conn.end(); // 结束当前数据库链接
                            return res.errorEnd("没有找到可用数据", 200);
                        }
                        for(var i=0;i<row.length;i++){


                            //7天收入
                            if(row[i].in_out_type==1&&row[i].type==4){
                                money_in_4.money_in_4=row[i].moeny;
                                money_in_4.percentage=row[i].moeny/data.total_price;
                            }
                            if(row[i].in_out_type==1&&row[i].type==5){
                                money_in_5.money_in_5=row[i].moeny;
                                money_in_5.percentage=row[i].moeny/data.total_price;
                            }
                            if(row[i].in_out_type==1&&row[i].type==8){
                                money_in_8.money_in_8=row[i].moeny;
                                money_in_8.percentage=row[i].moeny/data.total_price;
                            }
                            if(row[i].in_out_type==1&&row[i].type==12){
                                money_in_12.money_in_12=row[i].moeny;
                                money_in_12.percentage=row[i].moeny/data.total_price;
                            }


                            //7天支出
                            if(row[i].in_out_type==2&&row[i].type==1){
                                money_out_1.money_out_1=row[i].moeny;
                                money_out_1.percentage=row[i].moeny/data.total_price;
                            }
                            if(row[i].in_out_type==2&&row[i].type==2){
                                money_out_2.money_out_2=row[i].moeny;
                                money_out_2.percentage=row[i].moeny/data.total_price;
                            }
                            if(row[i].in_out_type==2&&row[i].type==4){
                                money_out_4.money_out_4=row[i].moeny;
                                money_out_4.percentage=row[i].moeny/data.total_price;
                            }
                            if(row[i].in_out_type==2&&row[i].type==5){
                                money_out_5.money_out_5=row[i].moeny;
                                money_out_5.percentage=row[i].moeny/data.total_price;
                            }
                            if(row[i].in_out_type==2&&row[i].type==6){
                                money_out_6.money_out_6=row[i].moeny;
                                money_out_6.percentage=row[i].moeny/data.total_price;
                            }
                            if(row[i].in_out_type==2&&row[i].type==7){
                                money_out_7.money_out_7=row[i].moeny;
                                money_out_7.percentage=row[i].moeny/data.total_price;
                            }
                            if(row[i].in_out_type==2&&row[i].type==8){
                                money_out_8.money_out_8=row[i].moeny;
                                money_out_8.percentage=row[i].moeny/data.total_price;
                            }
                            if(row[i].in_out_type==2&&row[i].type==9){
                                money_out_9.money_out_9=row[i].moeny;
                                money_out_9.percentage=row[i].moeny/data.total_price;
                            }

                        }
                        
 

                        return res.successEnd(data);
                    })
                }else{
                    db.release(); // 释放资源
                    conn.end(); // 结束当前数据库链接

                    return res.successEnd(data);

                }
                
                
        })
    }else if(body.status == 2){
 
        var thirty_time = moment().subtract(30, 'days').format('YYYY-MM-DD HH:mm:ss');
        db.query("SELECT ifNull(sum(MONEY),0) total_price FROM `all_in_out_money` WHERE money>0 and manager_id=? and ((in_out_type=1 and type in (4,5,8,12)) or (in_out_type=2 and type in (1,2,4,5,6,7,8,9))) and create_days > ? and create_days < ? ",[body.manager_id,thirty_time,now_time], function(err, row1, fields) {     
                // 数据获取失败
                if (err) {                          
                    db.release();// 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd("没有找到可用数据", 200);
                }
                
                data.total_price = row1[0].total_price; //总共有多少条数据

                if(data.total_price>0){
                    var sql = "SELECT in_out_type,type,sum(MONEY) moeny FROM `all_in_out_money` WHERE money>0 and manager_id=? and ((in_out_type=1 and type in (4,5,8,12)) or (in_out_type=2 and type in (1,2,4,5,6,7,8,9))) and create_days > ? and create_days < ?  group by in_out_type,type  ";
                    db.query(sql,[body.manager_id,thirty_time,now_time], function(err, row, fields) {
                        
                        // 数据获取失败
                        if (err) {                          
                            db.release();// 释放资源
                            conn.end(); // 结束当前数据库链接
                            return res.errorEnd("没有找到可用数据", 200);
                        }

                        for(var i=0;i<row.length;i++){

                            //30天收入
                            if(row[i].in_out_type==1&&row[i].type==4){
                                money_in_4.money_in_4=row[i].moeny;
                                money_in_4.percentage=row[i].moeny/data.total_price;
                            }
                            if(row[i].in_out_type==1&&row[i].type==5){
                                money_in_5.money_in_5=row[i].moeny;
                                money_in_5.percentage=row[i].moeny/data.total_price;
                            }
                            if(row[i].in_out_type==1&&row[i].type==8){
                                money_in_8.money_in_8=row[i].moeny;
                                money_in_8.percentage=row[i].moeny/data.total_price;
                            }
                            if(row[i].in_out_type==1&&row[i].type==12){
                                money_in_12.money_in_12=row[i].moeny;
                                money_in_12.percentage=row[i].moeny/data.total_price;
                            }



                            //30天支出
                            if(row[i].in_out_type==2&&row[i].type==1){
                                money_out_1.money_out_1=row[i].moeny;
                                money_out_1.percentage=row[i].moeny/data.total_price;
                            }
                            if(row[i].in_out_type==2&&row[i].type==2){
                                money_out_2.money_out_2=row[i].moeny;
                                money_out_2.percentage=row[i].moeny/data.total_price;
                            }
                            if(row[i].in_out_type==2&&row[i].type==4){
                                money_out_4.money_out_4=row[i].moeny;
                                money_out_4.percentage=row[i].moeny/data.total_price;
                            }
                            if(row[i].in_out_type==2&&row[i].type==5){
                                money_out_5.money_out_5=row[i].moeny;
                                money_out_5.percentage=row[i].moeny/data.total_price;
                            }
                            if(row[i].in_out_type==2&&row[i].type==6){
                                money_out_6.money_out_6=row[i].moeny;
                                money_out_6.percentage=row[i].moeny/data.total_price;
                            }
                            if(row[i].in_out_type==2&&row[i].type==7){
                                money_out_7.money_out_7=row[i].moeny;
                                money_out_7.percentage=row[i].moeny/data.total_price;
                            }
                            if(row[i].in_out_type==2&&row[i].type==8){
                                money_out_8.money_out_8=row[i].moeny;
                                money_out_8.percentage=row[i].moeny/data.total_price;
                            }
                            if(row[i].in_out_type==2&&row[i].type==9){
                                money_out_9.money_out_9=row[i].moeny;
                                money_out_9.percentage=row[i].moeny/data.total_price;
                            }

                        }
                        
 

                        return res.successEnd(data);
                    })
                }else{
                    db.release(); // 释放资源
                    conn.end(); // 结束当前数据库链接

                    return res.successEnd(data);

                }
                
                
        })
    }



    });


}