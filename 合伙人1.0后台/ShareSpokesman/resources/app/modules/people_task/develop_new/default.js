/**
 * Created by Administrator on 2017/8/21.
 * 今日邀请人数加一
 */
const moment = require('moment'); // 时间处理插件
'use strict';
exports.ready = (req, res, that) => {

    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query; // 当前请求传递过来的 GET 数据,
    const body = req.body; // 当前请求传递过来的 POST 数据
    if(that.isEmpty(req.session.user_token)){
        return res.errorEnd('当前请求不存在 Token 或 Token 不可用', 300);
    }
    var user = req.session.user_rows;
    that.connect(( err , db , conn ) => {
        // 查询数据
        var now_time = moment( moment().format('YYYY-MM-DD') ).format('X');
        var select_arr = [user.manager_id, user.id, now_time];// 查询条件
        db.query("SELECT * FROM `db_people_task` WHERE  manager_id=? and user_id=? and addtime=? ",select_arr, function(err, row, fields) {
            // 数据获取失败
            if (err) {
                return res.errorEnd('没有找到可用数据', 200);
            }
            if( row.length > 0 ){
                var _develop_user = Number(row[0].develop_user)+1
                var create_arr = {"develop_user":_develop_user}
                db.query( "UPDATE `db_people_task` SET ? where id=?" , [create_arr,row[0].id], function( err, result , fields ){
                    var total = result.changedRows ; // 受影响的数据条数, ( 已删除的数据条数 )
                    if( err ){
                        db.release();// 释放资源
                        return res.errorEnd('更新数据失败!!', 200);
                    }
                    if( !total ){
                        db.release(); // 释放资源
                        return res.errorEnd('没有找到可操作的数据!!', 200);
                    }
                    db.release(); // 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.successEnd( '成功更新数据 : '+ total  );
                });
            }else{
                //这个打印, 只会出现在主程序的控制台中
                db.release(); // 释放资源
                conn.end(); // 结束当前数据库链接
                return res.successEnd( '今日还未签到，快去签到吧！');
            }
        })

    });
}
