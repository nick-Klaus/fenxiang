/**
 * Created by Administrator on 2017/8/11.
 * 用户众筹活动 价格变化
 */
const moment = require('moment');
'use strict';
exports.ready = (req, res, that) => {

    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query; // 当前请求传递过来的 GET 数据,
    const body = req.body; // 当前请求传递过来的 POST 数据
    if(that.isEmpty(req.session.user_token)){
        return res.errorEnd('当前请求不存在 Token 或 Token 不可用', 300);
    }
    var user = req.session.user_rows;
    if(that.isEmpty(body.crowd_funding_id)){
        return res.errorEnd("活动id不存在", 200);
    }
    that.connect(( err , db , conn ) => {
        db.beginTransaction(function(err){
            // 事物创建失败
            if (err) {
                db.commit();
                db.release(); // 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd('没有找到可用数据1', 200);
            }
            var current_date = moment().format('X');
            var _ip = req.ip.split(':')[3];
            db.query("select * from `db_crowd_funding_log` where crowd_funding_id=? and crowd_funding_user_id=? and openid=?", [body.crowd_funding_id,body.user_id,user.openid], function (err, row_log, fields) {
                // 数据获取失败
                if (err) {
                    db.commit();
                    db.release();// 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd('活动不存在！！', 200);
                }
                if (row_log.length > 0) {
                    db.commit();
                    db.release();// 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd('您已经帮他筹集过了！！', 200);
                }
                // 查询出活动数据
                db.query("select * from `db_crowd_funding` where id=?", [body.crowd_funding_id], function (err, row, fields) {
                    // 数据获取失败
                    if (err || row.length == 0) {
                        db.commit();
                        db.release();// 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd('活动不存在！！', 200);
                    }
                    // 查询出活动用户的数据
                    db.query("select * from `db_crowd_funding_user` where crowd_funding_id=? and  id=?", [row[0].id,body.user_id], function (err, row_user, fields) {
                        // 数据获取失败
                        if (err || row_user.length == 0) {
                            db.commit();
                            db.release();// 释放资源
                            conn.end(); // 结束当前数据库链接
                            return res.errorEnd('没有找到user数据！', 200);
                        }
                        if( row_user[0].status != 1 ){
                            db.commit();
                            db.release();// 释放资源
                            conn.end(); // 结束当前数据库链接
                            return res.errorEnd('该用户没有参与活动！', 200);
                        }
                        if( row_user[0].new_price == 0 ){
                            // 帮忙众筹的钱小余最小值
                            db.commit();
                            db.release();// 释放资源
                            conn.end(); // 结束当前数据库链接
                            return res.errorEnd('筹款已经成功', 200);
                        }
                        var _price = row_user[0].funding_price;// 朋友帮忙筹款数
                        var _new_price  = that.floatSub(Number(row_user[0].new_price),_price);// 这一次筹款后的价格
                        // 筹款后的价格小于底价  就等于底价
                        if( _new_price <  0){
                            var _price  = Number(row_user[0].new_price);// 这一次筹款后的价格
                            _new_price = 0;
                        }
                        var user_update = {
                            "new_price":_new_price,
                            "success_time":current_date
                        }
                        db.query( "UPDATE `db_crowd_funding_user` SET ? where id=?" , [user_update,row_user[0].id] , function( err, result , fields ){
                            var total = result.changedRows ; // 受影响的数据条数, ( 已删除的数据条数 )
                            if( err ){
                                db.rollback();
                                db.release();// 释放资源
                                conn.end(); // 结束当前数据库链接
                                return res.errorEnd('更新数据失败!!', 200);
                            }
                            var create_data = {
                                "openid":user.openid,
                                "username":user.nickname,
                                "crowd_funding_user_id":row_user[0].id,
                                "crowd_funding_id":row[0].id,
                                "new_price":_new_price,
                                "funding_price":_price,
                                "ip":_ip || "",
                                "addtime":current_date
                            }

                            db.query( "INSERT INTO `db_crowd_funding_log` SET ?" , create_data , function( err, result , fields ){
                                if( err ){
                                    // 数据插入失败, 回滚
                                    db.rollback();
                                    db.release();// 释放资源
                                    conn.end(); // 结束当前数据库链接
                                    return res.errorEnd('创建数据失败!!', 200);
                                }
                                if( _new_price == 0 ){
                                    var _quantity  = that.floatSub(Number(row[0].product_quantity),1);// 这一次筹款后的价格
                                    var _floor_user  = that.floatAdd(Number(row[0].funding_floor_user),1);// 众筹成功的人数
                                    var floor_data = {
                                        "product_quantity":_quantity,
                                        "funding_floor_user":_floor_user
                                    }
                                    db.query( "UPDATE `db_crowd_funding` SET ? where id=?" , [floor_data,body.crowd_funding_id] , function( err, result , fields ){
                                        var total = result.changedRows ; // 受影响的数据条数, ( 已删除的数据条数 )
                                        if( err ){
                                            db.rollback();
                                            db.release();// 释放资源
                                            conn.end(); // 结束当前数据库链接
                                            return res.errorEnd('更新数据失败!!', 200);
                                        }
                                        db.commit();
                                        db.release(); // 释放资源
                                        conn.end(); // 结束当前数据库链接
                                        return res.successEnd('成功帮' + row_user[0].username +"筹得"+_price+"块");
                                    });
                                }else{
                                    db.commit();
                                    db.release(); // 释放资源
                                    conn.end(); // 结束当前数据库链接
                                    return res.successEnd('成功帮' + row_user[0].username +"筹得"+_price+"块");
                                }
                            });
                         });
                    });
                });
            });
        });
    });
}