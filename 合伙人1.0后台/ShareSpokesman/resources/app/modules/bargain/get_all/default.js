/**
 * Created by Administrator on 2017/8/16.
 * 获取活动  用户 和 日志 信息
 */
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
        // 查询数据 老板id不能为空
        if( that.isEmpty(body.boss_id) || that.isEmpty(body.bargain_id) ){
            db.release(); // 释放资源
            conn.end(); // 结束当前数据库链接
            return res.errorEnd('条件不能为空1', 200);
        }
        // 获取砍价活动数据
        db.query("select * from `db_bargain` where id=?",[body.bargain_id], function(err, row1, fields) {
            // 数据获取失败
            if (err) {
                db.release(); // 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd('没有找到可用数据', 200);
            }
            db.query("select * from `db_activity_shopowner_relation` where activity_id=? and boss_id=? and shopowner_id=? and activity_type=2",[body.bargain_id,user.manager_id,user.shopowner_id], function(err, row_relation, fields) {
                // 数据获取失败
                if (err) {
                    db.release(); // 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd('没有找到可用数据', 200);
                }
                if( row_relation.length == 0 && user.is_manager == 0 ){
                    db.release(); // 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd("meifan", 600);
                }else{
                    // 当前活动的所有用户
                    db.query("select username,new_price from `db_bargain_user` where bargain_id=? ",[body.bargain_id], function(err, row2, fields) {
                        // 数据获取失败
                        if (err) {
                            db.release(); // 释放资源
                            conn.end(); // 结束当前数据库链接
                            return res.errorEnd('没有找到可用数据', 200);
                        }
                        // 获取当前砍价的用户信息
                        db.query("select * from `db_bargain_user` where bargain_id=? and user_id=? and shopowner_id=?",[body.bargain_id,body.user_id,user.shopowner_id], function(err, row3, fields) {
                            // 数据获取失败
                            if (err) {
                                db.release(); // 释放资源
                                conn.end(); // 结束当前数据库链接
                                return res.errorEnd('没有找到可用数据', 200);
                            }
                            // 要么获取自己的砍价数据，自己没参加 则获取店长的砍价数据
                            // 作用区域修改后影响到 2017年10月23日修改
                            if( row3.length == 0 ){
                                db.query("select * from `db_bargain_user` where bargain_id=? and shopowner_id=?",[body.bargain_id,user.shopowner_id], function(err, row3, fields) {
                                    // 数据获取失败
                                    if (err) {
                                        db.release(); // 释放资源
                                        conn.end(); // 结束当前数据库链接
                                        return res.errorEnd('没有找到可用数据', 200);
                                    }
                                    // 获取当前用户是否砍过价的日志
                                    db.query("select * from `db_bargain_log` where bargain_id=? and openid=? and user_id=?",[body.bargain_id,body.openid,row3[0].id], function(err, row4, fields) {
                                        // 数据获取失败
                                        if (err) {
                                            db.release(); // 释放资源
                                            conn.end(); // 结束当前数据库链接
                                            return res.errorEnd('没有找到可用数据', 200);
                                        }
                                        db.query("select * from `db_bargain_user` where bargain_id=? and openid=?",[body.bargain_id,body.openid], function(err, row5, fields) {
                                            // 数据获取失败
                                            if (err) {
                                                db.release(); // 释放资源
                                                conn.end(); // 结束当前数据库链接
                                                return res.errorEnd('没有找到可用数据', 200);
                                            }
                                            // 这个打印, 只会出现在主程序的控制台中
                                            db.release(); // 释放资源
                                            conn.end(); // 结束当前数据库链接
                                            return res.successEnd({"list":row1,"bargain_user_all":row2,"user_list":row3,"list_log":row4,"user_this":row5});
                                        })
                                    })
                                })
                            }else{
                                db.query("select * from `db_bargain_user` where bargain_id=? and user_id=?",[body.bargain_id,body.user_id], function(err, row3, fields) {
                                    // 数据获取失败
                                    if (err) {
                                        db.release(); // 释放资源
                                        conn.end(); // 结束当前数据库链接
                                        return res.errorEnd('没有找到可用数据', 200);
                                    }
                                    // 获取当前用户是否砍过价的日志
                                    db.query("select * from `db_bargain_log` where bargain_id=? and openid=? and user_id=?",[body.bargain_id,body.openid,row3[0].id], function(err, row4, fields) {
                                        // 数据获取失败
                                        if (err) {
                                            db.release(); // 释放资源
                                            conn.end(); // 结束当前数据库链接
                                            return res.errorEnd('没有找到可用数据', 200);
                                        }
                                        db.query("select * from `db_bargain_user` where bargain_id=? and openid=?",[body.bargain_id,body.openid], function(err, row5, fields) {
                                            // 数据获取失败
                                            if (err) {
                                                db.release(); // 释放资源
                                                conn.end(); // 结束当前数据库链接
                                                return res.errorEnd('没有找到可用数据', 200);
                                            }
                                            // 这个打印, 只会出现在主程序的控制台中
                                            db.release(); // 释放资源
                                            conn.end(); // 结束当前数据库链接
                                            return res.successEnd({"list":row1,"bargain_user_all":row2,"user_list":row3,"list_log":row4,"user_this":row5});
                                        })
                                    })
                                })
                            }
                        })
                    })
                }
            });
        });
    });
}
