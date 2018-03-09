/**
 * Created by Administrator on 2017/8/11.
 * 用户众筹活动的获取
 */
'use strict';
exports.ready = (req, res, that) => {

    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query || {}; // 当前请求传递过来的 GET 数据,
    const body = req.body || {}; // 当前请求传递过来的 POST 数据
    const sideUrl = req.sideUrl || '';// 当前域名, 一般为 http://www.zsb2b.com:8081/
    if(that.isEmpty(req.session.user_token)){
        return res.errorEnd('当前请求不存在 Token 或 Token 不可用', 300);
    }
    var user = req.session.user_rows;
    that.connect(( err , db , conn ) => {
        // 查询数据
        db.query("select * from `db_crowd_funding` where id=? ", [body.crowd_funding_id] ,function(err, row_funding, fields) {
            if (err) {
                db.release(); // 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd('没有找到可用数据1', 200);
            }
            db.query("select * from `db_activity_shopowner_relation` where activity_id=? and boss_id=? and shopowner_id=? and activity_type=3",[body.crowd_funding_id,user.manager_id,user.shopowner_id], function(err, row1, fields) {
                // 数据获取失败
                if (err) {
                    db.release(); // 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd('没有找到可用数据', 200);
                }
                if( row1.length == 0 && user.is_manager == 0 ){
                    db.release(); // 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd("meifan", 600);
                }else{
                    // 当前众筹用户的信息
                    db.query("select * from `db_crowd_funding_user` where crowd_funding_id=? and shopowner_id=? and id=? and status=1", [body.crowd_funding_id,body.shopowner_id,body.user_id] ,function(err, row_user, fields) {
                        console.log( this.sql );
                        if (err) {
                            db.release(); // 释放资源
                            conn.end(); // 结束当前数据库链接
                            return res.errorEnd('没有找到可用数据2', 200);
                        }
                        db.query("select * from `db_crowd_funding_user` where crowd_funding_id=? and shopowner_id=? and user_id=?", [body.crowd_funding_id,body.shopowner_id,user.id] ,function(err, row_this, fields) {
                            if (err) {
                                db.release(); // 释放资源
                                conn.end(); // 结束当前数据库链接
                                return res.errorEnd('没有找到可用数据3', 200);
                            }
                            db.query("select * from `db_crowd_funding_log` where crowd_funding_id=? and crowd_funding_user_id=? and openid=?", [body.crowd_funding_id,body.user_id,user.openid],function(err, row_log, fields) {
                                if (err) {
                                    db.release(); // 释放资源
                                    conn.end(); // 结束当前数据库链接
                                    return res.errorEnd('没有找到可用数据4', 200);
                                }
                                var data_all = {
                                    "funding_data":row_funding, // 活动数据
                                    "funding_user":row_user, // 需要众筹用户的数据
                                    "user_this":row_this, // 当前打开用户的数据
                                    "user_log":row_log // 当前用户的操作日志
                                }
                                db.release(); // 释放资源
                                conn.end(); // 结束当前数据库链接
                                return res.successEnd(data_all);
                            });
                        });
                    });
                }
            });
        });
    });
}