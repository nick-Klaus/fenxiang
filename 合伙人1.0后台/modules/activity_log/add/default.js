/**
 * Created by Administrator on 2017/8/11.
 * 增加代言人活动 日志信息
 * 当日活动的 点击 分享 收益 和历史的 记录
 */
'use strict';
exports.ready = (req, res, that) => {
    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query; // 当前请求传递过来的 GET 数据,
    const body = req.body; // 当前请求传递过来的 POST 数据
    that.connect(( err , db , conn ) => {
        db.beginTransaction(function(err){
            // 事物创建失败  openid 不能为空
            if (err ||  that.isEmpty(body.openid) || that.isEmpty(body.boss_id) || that.isEmpty(body.user_id) ) {
                db.rollback();
                db.release();// 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd('没有找到可用数据', 200);
            }
            db.query("SELECT * FROM `db_activity_log` WHERE openid=? and boss_id=?",[body.openid,body.boss_id], function(err, row, fields) {
                // 数据获取失败
                if (err) {
                    db.rollback();
                    db.release();// 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd('没有找到可用数据', 200);
                }
                // 用户还没有日志记录时才能呢创建
                if( row.length == 0 ){
                    //插入数据
                    db.query( "INSERT INTO `db_activity_log` SET ?" , body , function( err, result , fields ){
                        if( err ){
                            db.rollback();
                            db.release();// 释放资源
                            conn.end(); // 结束当前数据库链接
                            return res.errorEnd('创建数据失败!!', 200);
                        }
                        db.commit();
                        db.release(); // 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.successEnd("创建数据成功" + result.insertId );
                    });
                }else{
                    db.rollback();
                    db.release();// 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.successEnd(row);
                }
            })
        });
    });
}