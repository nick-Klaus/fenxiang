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
const moment = require('moment');
'use strict';
exports.ready = (req, res, that) => {

    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query; // 当前请求传递过来的 GET 数据,
    const body = req.body; // 当前请求传递过来的 POST 数据

    // that 里面有什么可以调用的 你可以看 resources\app\lib\core.js 文件!
    // 例如 that.isEmpty(123) // 判断传入的值, 是否是空 具体看方法说明!!!

    // 链接数据库
    // 链接 / 操作数据库



    function getLastDay(year,month)   
    {   
     var new_year = year;  //取当前的年份   
     var new_month = month++;//取下一个月的第一天，方便计算（最后一天不固定）   
     if(month>12)      //如果当前大于12月，则年份转到下一年   
     {   
     new_month -=12;    //月份减   
     new_year++;      //年份增   
     }   
     var new_date = new Date(new_year,new_month,1);        //取当年当月中的第一天   
     return (new Date(new_date.getTime()-1000*60*60*24)).getDate();//获取当月最后一天日期   
    }

    
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


    var add_sql_order="";
    var add_sql_people="";
    var this_month_days = 0;
    var list=[];
    var one={};
    var _date = moment().format('YYYY-MM');
    var year = moment().format('YYYY');
    var month = moment().format('MM');
    if(that.isEmpty(body.for_month)){

        



        add_sql_order= " and date_format(FROM_UNIXTIME(complete_time), '%Y-%m') = '"+_date+"'";
        add_sql_people= " and date_format(FROM_UNIXTIME(prolocutor_time), '%Y-%m') = '"+_date+"'";
    }else{
        year = body.for_month.split("-")[0];
        month = body.for_month.split("-")[1];
        add_sql_order= " and date_format(FROM_UNIXTIME(complete_time), '%Y-%m') = '"+body.for_month+"'";
        add_sql_people= " and date_format(FROM_UNIXTIME(prolocutor_time), '%Y-%m') = '"+body.for_month+"'";
        
    }
    //这月一共多少天
    this_month_days = getLastDay(year,month);
    for(var i=0;i<this_month_days;i++){
        one={};
        if(i+1<10){
            one.that_day=year+"-"+month+"-0"+(i+1);
        }else{
            one.that_day=year+"-"+month+"-"+(i+1); 
        }
        one.total_price_all=0.0;
        one.need_pay_all=0.0;
        one.all_prolocutor_num=0;
        list[i]=one;
        
    }


    that.connect((err, db,conn) => {    

  






        db.query("select IFNULL(sum(total_price),0) total_price_all,IFNULL(sum(need_pay),0)  need_pay_all ,date_format(FROM_UNIXTIME(complete_time), '%Y-%m-%d') that_day from db_order  where sid =? and status =1 and pay_status=3   "+add_sql_order+"    group by date_format(FROM_UNIXTIME(complete_time), '%Y-%m-%d')", [body.shopowner_id] , function(err, order, fields) {
            if (err) {
                db.release();// 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd("没有找到订单数据", 200);
            }

            db.query("select count(1) all_prolocutor_num ,date_format(FROM_UNIXTIME(prolocutor_time), '%Y-%m-%d') that_day from db_people where is_prolocutor='1' and is_clerk='0' and shopowner_id=?   "+add_sql_people+"    group by date_format(FROM_UNIXTIME(prolocutor_time), '%Y-%m-%d')", [body.shopowner_id] , function(err, people, fields) {
                if (err) {
                    db.release();// 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd("没有找到代言人数据", 200);
                }
                var back={};
                back.list=list;
                for(var i=0;i<list.length;i++){
                    for(var j=0;j<order.length;j++){
                        if(list[i].that_day==order[j].that_day){
                            list[i].total_price_all = order[j].total_price_all;
                            list[i].need_pay_all = order[j].need_pay_all;
                        }
                    }
                }
                for(var i=0;i<list.length;i++){
                    for(var j=0;j<people.length;j++){
                        if(list[i].that_day==people[j].that_day){
                            list[i].all_prolocutor_num = people[j].all_prolocutor_num;
                        }
                    }
                }
                db.release(); // 释放资源
                conn.end(); // 结束当前数据库链接
                return res.successEnd(back);

            });



        });
            
        
    });


}