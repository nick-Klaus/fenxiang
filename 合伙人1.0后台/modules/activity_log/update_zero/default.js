/**
 * Created by Administrator on 2017/8/12.
 * 用户活动日志 当日的数据在 每天凌晨12点清零
 */

const path = require("path"); //系统路径模块。
const fs = require('fs');
'use strict';
exports.ready = (req, res, that) => {
    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query; // 当前请求传递过来的 GET 数据,
    const body = req.body; // 当前请求传递过来的 POST 数据
    that.connect(( err , db , conn ) => {
        // 更新数据
        var d = new Date();
        var str_date = d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate();
        var update_arr = {
            "share_time":str_date,
            "forward_time":str_date,
            "profit_time":str_date,
            "share_price_time":str_date,
            "commission_price_time":str_date,
            "see_new":0,
            "share_new":0,
            "forward_new":0,
            "profit_new":0,
            "share_price_new":0,
            "commission_price_new":0
        }
        // 判断一个文件是否存在
        var path  = __dirname+"/"+str_date+".txt";
        if( fs.existsSync(path) ){
            db.release(); // 释放资源
            conn.end(); // 结束当前数据库链接
            return res.errorEnd('今日任务已经执行!!', 200);
        }
        db.query( "UPDATE `db_activity_log` SET ? " , [ update_arr] , function( err, result , fields ){
            var total = result.changedRows ; // 受影响的数据条数, ( 已删除的数据条数 )
            if( err ){
                db.release(); // 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd('更新数据失败!!', 200);
            }
            if( !total ){
                db.release(); // 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd('没有找到可操作的数据!!', 200);
            }
            db.release(); // 释放资源
            conn.end(); // 结束当前数据库链接
            var fd = fs.openSync(__dirname+"/"+str_date+".txt", 'w', "0666");
            fs.writeSync( fd, 'ok' );
            return res.successEnd( '成功更新数据 : '+ total);
        });
    });
}
