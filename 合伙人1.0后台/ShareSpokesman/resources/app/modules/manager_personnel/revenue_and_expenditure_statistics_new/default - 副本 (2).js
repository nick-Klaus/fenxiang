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
    //var newDate = new Date(today - 7 * 24 * 3600 * 1000);
    var seven_day = moment().subtract(7, 'days').format('X');
    //seven_day = parseInt(seven_day / 1000);
    //var newDate1 = new Date(today - 30 * 24 * 3600 * 1000);
    var month = moment().subtract(30, 'days').format('X');
    //month = parseInt(month / 1000);
    //today = parseInt(today / 1000);
    // var today_year = date.getFullYear();
    // if(date.getMonth() + 1 < 10){
    //     var today_month = '0' + (date.getMonth() + 1);
    // }else{
    //     var today_month =  date.getMonth() + 1;
    // }
    // if(date.getDate() < 10){
    //     var today_day = '0' + date.getDate();
    // }else{
    //     var today_day = date.getDate();
    // }
    // if(date.getHours() < 10){
    //     var today_hour = '0' + date.getHours();
    // }else{
    //     var today_hour= date.getHours() ;
    // }
    // if(date.getMinutes() < 10){
    //     var today_min = '0' + date.getMinutes();
    // }else{
    //     var today_min = date.getMinutes() ;
    // }
    // if(date.getSeconds() < 10){
    //     var today_sec = '0' + date.getSeconds();
    // }else{
    //     var today_sec = date.getSeconds();
    // }
    var now_time = moment().format('YYYY-MM-DD HH:mm:ss');
    if(body.status == 1){
        // var seven_year = newDate.getFullYear();
        // if(newDate.getMonth() + 1 < 10){
        //     var seven_month = '0' + (newDate.getMonth() + 1);
        // }else{
        //     var seven_month =  newDate.getMonth() + 1;
        // }
        // if(newDate.getDate() < 10){
        //     var seven_day = '0' + newDate.getDate();
        // }else{
        //     var seven_day = newDate.getDate();
        // }
        // if(newDate.getHours() < 10){
        //     var seven_hour = '0' + newDate.getHours();
        // }else{
        //     var seven_hour= newDate.getHours() ;
        // }
        // if(newDate.getMinutes() < 10){
        //     var seven_min = '0' + newDate.getMinutes();
        // }else{
        //     var seven_min = newDate.getMinutes() ;
        // }
        // if(newDate.getSeconds() < 10){
        //     var seven_sec = '0' + newDate.getSeconds();
        // }else{
        //     var seven_sec = newDate.getSeconds();
        // }
        var seven_time = moment().subtract(7, 'days').format('YYYY-MM-DD HH:mm:ss');
        db.query("select IFNULL(sum(real_pay),0) chongzhi from `db_manager_recharge` where pay_time > ? and pay_time < ? and manager_id = ? and (status = 2 or status = 3)", [seven_day,today,body.manager_id] , function(err, row, fields) {
            if(row.length == 0){
                row[0].chongzhi = 0;
            }
            db.query("select IFNULL(sum(need_pay),0) total_price from `db_order` where  pay_time > ? and pay_time < ?  and mid = ? and status = 1 and pay_status = 3", [seven_day,today,body.manager_id] , function(err1, row1, fields1) {
                if(row1.length == 0){
                    row1[0].total_price = 0;
                }
                db.query("select IFNULL(sum(real_pay),0) tixian from `db_manager_tixian` where  pay_time > ? and pay_time < ? and  manager_id = ? and status = 1", [seven_day,today,body.manager_id] , function(err2, row2, fields2) {
                    if(row2.length == 0){
                        row2[0].tixian = 0;
                    }
                    db.query("select IFNULL(sum(money),0) manager_enchashment1 from `db_manager_enchashment` where  create_days > ? and create_days < ? and  manager_id = ? and type = 1", [seven_time,now_time,body.manager_id] , function(err3, row3, fields3) {
                        if(row3.length == 0){
                            row3[0].manager_enchashment1 = 0;
                        }
                        db.query("select IFNULL(sum(money),0) manager_enchashment2 from `db_manager_enchashment` where  create_days > ? and create_days < ? and  manager_id = ? and type = 2", [seven_time,now_time,body.manager_id] , function(err4, row4, fields4) {
                            if(row4.length == 0){
                                row4[0].manager_enchashment2 = 0;
                            }
                            db.query("select IFNULL(sum(money),0) manager_enchashment7 from `db_manager_enchashment` where  create_days > ? and create_days < ? and  manager_id = ? and type = 7", [seven_time,now_time,body.manager_id] , function(err5, row5, fields5) {
                                if(row5.length == 0){
                                    row5[0].manager_enchashment7 = 0;
                                }
                                db.query("select IFNULL(sum(money),0) manager_enchashment8 from `db_manager_enchashment` where  create_days > ? and create_days < ? and  manager_id = ? and type = 8", [seven_time,now_time,body.manager_id] , function(err6, row6, fields6) {
                                    if(row6.length == 0){
                                        row6[0].manager_enchashment8 = 0;
                                    }
                                    db.query("select IFNULL(sum(money),0) manager_enchashment9 from `db_manager_enchashment` where  create_days > ? and create_days < ? and  manager_id = ? and type = 9", [seven_time,now_time,body.manager_id] , function(err7, row7, fields7) {
                                        if(row7.length == 0){
                                            row7[0].manager_enchashment9 = 0;
                                        }
                                        var total = row[0].chongzhi + row1[0].total_price + row3[0].manager_enchashment1 + row2[0].tixian + row4[0].manager_enchashment2 + row5[0].manager_enchashment7 + row6[0].manager_enchashment8 + row7[0].manager_enchashment9 ;
                                        if(total==0){
                                            var percentage = 0;
                                            var percentage1 = 0;

        
                                            var percentage2 = 0;
                                            var percentage3 =  0;

                                            var percentage4 =  0;
                                            var percentage5 =  0;
                                            var percentage6 =  0;
                                            var percentage7 =  0;

                                            var chongzhi = {'chongzhi' : row[0].chongzhi,'percentage' : percentage};
                                            var total_price = {'total_price' : row1[0].total_price,'percentage' :percentage1};
                                            var start_up_money_all = {'start_up_money_all' : row3[0].manager_enchashment1,'percentage' : percentage2};
                                            var tixian = {'tixian' : row2[0].tixian ,'percentage' : percentage3};

                                            var manager_enchashment2 = {'manager_enchashment2' : row4[0].manager_enchashment2 ,'percentage' : percentage4};
                                            var manager_enchashment7 = {'manager_enchashment7' : row5[0].manager_enchashment7 ,'percentage' : percentage5};
                                            var manager_enchashment8 = {'manager_enchashment8' : row6[0].manager_enchashment8 ,'percentage' : percentage6};
                                            var manager_enchashment9 = {'manager_enchashment9' : row7[0].manager_enchashment9 ,'percentage' : percentage7};
                                        }else{
                                            var percentage = parseFloat(row[0].chongzhi / total);
                                            var percentage1 = parseFloat(row1[0].total_price / total);

        
                                            var percentage2 = row3[0].manager_enchashment1/ total; parseFloat(row3[0].manager_enchashment1/ total);
                                            var percentage3 =  row2[0].tixian  / total;parseFloat(row2[0].tixian  / total);

                                            var percentage4 =  row4[0].manager_enchashment2  / total;parseFloat(row4[0].manager_enchashment2  / total);
                                            var percentage5 =  row5[0].manager_enchashment7  / total;parseFloat(row5[0].manager_enchashment7  / total);
                                            var percentage6 =  row6[0].manager_enchashment8  / total;parseFloat(row6[0].manager_enchashment8  / total);
                                            var percentage7 =  row7[0].manager_enchashment9  / total;parseFloat(row7[0].manager_enchashment9  / total);

                                            var chongzhi = {'chongzhi' : row[0].chongzhi,'percentage' : percentage};
                                            var total_price = {'total_price' : row1[0].total_price,'percentage' :percentage1};
                                            var start_up_money_all = {'start_up_money_all' : row3[0].manager_enchashment1,'percentage' : percentage2};
                                            var tixian = {'tixian' : row2[0].tixian ,'percentage' : percentage3};

                                            var manager_enchashment2 = {'manager_enchashment2' : row4[0].manager_enchashment2 ,'percentage' : percentage4};
                                            var manager_enchashment7 = {'manager_enchashment7' : row5[0].manager_enchashment7 ,'percentage' : percentage5};
                                            var manager_enchashment8 = {'manager_enchashment8' : row6[0].manager_enchashment8 ,'percentage' : percentage6};
                                            var manager_enchashment9 = {'manager_enchashment9' : row7[0].manager_enchashment9 ,'percentage' : percentage7};
                                        }
                           
                                        var data = {'chongzhi' : chongzhi,'total_price' :total_price , 'start_up_money_all' : start_up_money_all, 'tixian' : tixian , 'manager_enchashment2' :manager_enchashment2,'manager_enchashment7' : manager_enchashment7, 'manager_enchashment8' : manager_enchashment8 , 'manager_enchashment9' : manager_enchashment9};
                                        db.release(); // 释放资源
                                        conn.end(); // 结束当前数据库链接
                                        return res.successEnd(data);

                                    });

                                });
                            });

                        });

                    });

                });

            });

        });
    }else if(body.status == 2){
        // var thirty_year = newDate1.getFullYear();
        // if(newDate1.getMonth() + 1 < 10){
        //     var thirty_month = '0' + (newDate1.getMonth() + 1);
        // }else{
        //     var thirty_month =  newDate1.getMonth() + 1;
        // }
        // if(newDate1.getDate() < 10){
        //     var thirty_day = '0' + newDate1.getDate();
        // }else{
        //     var thirty_day = newDate1.getDate();
        // }
        // if(newDate1.getHours() < 10){
        //     var thirty_hour = '0' + newDate1.getHours();
        // }else{
        //     var thirty_hour= newDate1.getHours() ;
        // }
        // if(newDate1.getMinutes() < 10){
        //     var thirty_min = '0' + newDate1.getMinutes();
        // }else{
        //     var thirty_min = newDate1.getMinutes() ;
        // }
        // if(newDate1.getSeconds() < 10){
        //     var thirty_sec = '0' + newDate1.getSeconds();
        // }else{
        //     var thirty_sec = newDate1.getSeconds();
        // }
        var thirty_time = moment().subtract(30, 'days').format('YYYY-MM-DD HH:mm:ss');
        db.query("select IFNULL(sum(real_pay),0) chongzhi from `db_manager_recharge` where pay_time > ? and pay_time < ? and manager_id = ? and (status = 2 or status = 3)", [month,today,body.manager_id] , function(err, row, fields) {
            if(row.length == 0){
                row[0].chongzhi = 0;
            }
            db.query("select IFNULL(sum(need_pay),0) total_price from `db_order` where  pay_time > ? and pay_time < ?  and mid = ? and status = 1 and pay_status = 3", [month,today,body.manager_id] , function(err1, row1, fields1) {
                if(row1.length == 0){
                    row1[0].total_price = 0;
                }
                db.query("select IFNULL(sum(real_pay),0) tixian from `db_manager_tixian` where  pay_time > ? and pay_time < ? and  manager_id = ? and status = 1", [month,today,body.manager_id] , function(err2, row2, fields2) {
                    if(row2.length == 0){
                        row2[0].tixian = 0;
                    }
                    db.query("select IFNULL(sum(money),0) manager_enchashment1 from `db_manager_enchashment` where  create_days > ? and create_days < ? and  manager_id = ? and type = 1", [thirty_time,now_time,body.manager_id] , function(err3, row3, fields3) {
                        if(row3.length == 0){
                            row3[0].manager_enchashment1 = 0;
                        }
                        db.query("select IFNULL(sum(money),0) manager_enchashment2 from `db_manager_enchashment` where  create_days > ? and create_days < ? and  manager_id = ? and type = 2", [seven_time,now_time,body.manager_id] , function(err4, row4, fields4) {

                            if(row4.length == 0){
                                row4[0].manager_enchashment2 = 0;
                            }
                            db.query("select IFNULL(sum(money),0) manager_enchashment7 from `db_manager_enchashment` where  create_days > ? and create_days < ? and  manager_id = ? and type = 7", [seven_time,now_time,body.manager_id] , function(err5, row5, fields5) {
                                if(row5.length == 0){
                                    row5[0].manager_enchashment7 = 0;
                                }
                                db.query("select IFNULL(sum(money),0) manager_enchashment8 from `db_manager_enchashment` where  create_days > ? and create_days < ? and  manager_id = ? and type = 8", [seven_time,now_time,body.manager_id] , function(err6, row6, fields6) {
                                    if(row6.length == 0){
                                        row6[0].manager_enchashment8 = 0;
                                    }
                                    db.query("select IFNULL(sum(money),0) manager_enchashment9 from `db_manager_enchashment` where  create_days > ? and create_days < ? and  manager_id = ? and type = 9", [seven_time,now_time,body.manager_id] , function(err7, row7, fields7) {
                                        if(row7.length == 0){
                                            row7[0].manager_enchashment9 = 0;
                                        }


                                        var total = row[0].chongzhi + row1[0].total_price + row3[0].manager_enchashment1 + row2[0].tixian + row4[0].manager_enchashment2 + row5[0].manager_enchashment7 + row6[0].manager_enchashment8 + row7[0].manager_enchashment9 ;
                                        
                                        if(total==0){
                                            var percentage = 0;
                                            var percentage1 = 0;
                                            var percentage2 = 0;
                                            var percentage3 =  0;

                                            var percentage4 =  0;
                                            var percentage5 =  0;
                                            var percentage6 =  0;
                                            var percentage7 =  0;

                                            var chongzhi = {'chongzhi' : row[0].chongzhi,'percentage' : percentage};
                                            var total_price = {'total_price' : row1[0].total_price,'percentage' :percentage1};
                                            var start_up_money_all = {'start_up_money_all' : row3[0].manager_enchashment1,'percentage' : percentage2};
                                            var tixian = {'tixian' : row2[0].tixian ,'percentage' : percentage3};

                                            var manager_enchashment2 = {'manager_enchashment2' : row4[0].manager_enchashment2 ,'percentage' : percentage4};
                                            var manager_enchashment7 = {'manager_enchashment7' : row5[0].manager_enchashment7 ,'percentage' : percentage5};
                                            var manager_enchashment8 = {'manager_enchashment8' : row6[0].manager_enchashment8 ,'percentage' : percentage6};
                                            var manager_enchashment9 = {'manager_enchashment9' : row7[0].manager_enchashment9 ,'percentage' : percentage7};

                                        }else{
                                            var percentage = parseFloat(row[0].chongzhi / total);
                                            var percentage1 = parseFloat(row1[0].total_price / total);
                                            var percentage2 = row3[0].manager_enchashment1/ total; parseFloat(row3[0].manager_enchashment1/ total);
                                            var percentage3 =  row2[0].tixian  / total;parseFloat(row2[0].tixian  / total);

                                            var percentage4 =  row4[0].manager_enchashment2  / total;parseFloat(row4[0].manager_enchashment2  / total);
                                            var percentage5 =  row5[0].manager_enchashment7  / total;parseFloat(row5[0].manager_enchashment7  / total);
                                            var percentage6 =  row6[0].manager_enchashment8  / total;parseFloat(row6[0].manager_enchashment8  / total);
                                            var percentage7 =  row7[0].manager_enchashment9  / total;parseFloat(row7[0].manager_enchashment9  / total);

                                            var chongzhi = {'chongzhi' : row[0].chongzhi,'percentage' : percentage};
                                            var total_price = {'total_price' : row1[0].total_price,'percentage' :percentage1};
                                            var start_up_money_all = {'start_up_money_all' : row3[0].manager_enchashment1,'percentage' : percentage2};
                                            var tixian = {'tixian' : row2[0].tixian ,'percentage' : percentage3};

                                            var manager_enchashment2 = {'manager_enchashment2' : row4[0].manager_enchashment2 ,'percentage' : percentage4};
                                            var manager_enchashment7 = {'manager_enchashment7' : row5[0].manager_enchashment7 ,'percentage' : percentage5};
                                            var manager_enchashment8 = {'manager_enchashment8' : row6[0].manager_enchashment8 ,'percentage' : percentage6};
                                            var manager_enchashment9 = {'manager_enchashment9' : row7[0].manager_enchashment9 ,'percentage' : percentage7};
                                        }
                               
                                        var data = {'chongzhi' : chongzhi,'total_price' :total_price , 'start_up_money_all' : start_up_money_all, 'tixian' : tixian , 'manager_enchashment2' :manager_enchashment2,'manager_enchashment7' : manager_enchashment7, 'manager_enchashment8' : manager_enchashment8 , 'manager_enchashment9' : manager_enchashment9};
                                        db.release(); // 释放资源
                                        conn.end(); // 结束当前数据库链接
                                        return res.successEnd(data);

                                    });

                                });
                            });

                        });

                    });

                });

            });

        });
    }



    });


}