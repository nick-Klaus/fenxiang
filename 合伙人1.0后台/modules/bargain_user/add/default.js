/**
 * Created by Administrator on 2017/8/11.
 * 增加砍价用户
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
        db.beginTransaction(function(err){
            var bargain_time = moment().format('X');
            // 事物创建失败
            if (err) {
                db.rollback();
                db.release();// 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd('没有找到可用数据', 200);
            }
            // 当前用户为代言人的时候直接参加活动
            if( user.is_prolocutor == 1 ){
                var creat ={
                    "openid":user.openid,
                    "bargain_id":body.bargain_id,
                    "original_price":body.original_price,
                    "floor_price":body.floor_price,
                    "new_price":body.original_price,
                    "phone_number":user.mobile,
                    "username":user.nickname,
                    "boss_id":user.manager_id,
                    "shopowner_id":user.shopowner_id,
                    "salesman_id":user.clerk_id,
                    "agent_id":user.prolocutor_id,
                    "user_id":user.id,
                    "bargain_number":100,
                    "bargain_time":body.bargain_time,
                    "addtime":bargain_time,
                    "status":1,
                    "bargain_type":2
                }
                // 插入数据
                db.query( "INSERT INTO `db_bargain_user` SET ?" , creat , function( err, result1 , fields ){
                    if( err ){
                        // 数据插入失败, 回滚
                        db.rollback();
                        db.release();// 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd('没有找到可用数据', 200);
                    }
                    // 用户成功参加活动后查询出当前活动的参加人数
                    db.query("select id,user_cj from `db_bargain` where id=? ",[body.bargain_id], function(err, row, fields) {
                        // 数据获取失败
                        if (err) {
                            db.rollback();
                            db.release();// 释放资源
                            conn.end(); // 结束当前数据库链接
                            return res.errorEnd('没有找到可用数据', 200);
                        }
                        var user_cj = Number(row[0].user_cj)+1;
                        var _id = row[0].id;
                        // 用户成功参加活动后 活动参加人数加1
                        db.query( "UPDATE `db_bargain` SET user_cj=? where id=?" , [ user_cj ,_id] , function( err, result , fields ){
                            var total = result.changedRows ; // 受影响的数据条数, ( 已删除的数据条数 )
                            if( err ){
                                db.rollback();
                                db.release();// 释放资源
                                conn.end(); // 结束当前数据库链接
                                return res.errorEnd('更新数据失败!!', 200);
                            }
                            if( !total ){
                                db.rollback();
                                db.release();// 释放资源
                                conn.end(); // 结束当前数据库链接
                                return res.errorEnd('没有找到可操作的数据!!', 200);
                            }
                            db.commit();
                            db.release(); // 释放资源
                            conn.end(); // 结束当前数据库链接
                            creat.id = result1.insertId
                            return res.successEnd(creat);
                        });
                    });
                });
            }else{
                // 当前用户不为代言人则成为代言人后 再参加活动
                var creat1 ={
                    "openid":user.openid,
                    "bargain_id":body.bargain_id,
                    "original_price":body.original_price,
                    "floor_price":body.floor_price,
                    "new_price":body.original_price,
                    "phone_number":body.phone_number,
                    "username":body.username,
                    "boss_id":user.manager_id,
                    "shopowner_id":user.shopowner_id,
                    "salesman_id":user.clerk_id,
                    "agent_id":user.prolocutor_id,
                    "user_id":user.id,
                    "bargain_number":100,
                    "bargain_time":body.bargain_time,
                    "addtime":bargain_time,
                    "status":1,
                    "bargain_type":2
                }
                db.query( "UPDATE `db_people` SET `is_prolocutor`=?,`mobile`=?,`nickname`=?  where id=? " , ['1',body.phone_number,body.username,user.id] , function( err, result , fields ){
                    var total = result.changedRows ; // 受影响的数据条数, ( 已删除的数据条数 )
                    if( err ){
                        db.rollback();
                        db.release();// 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd('更新数据失败!!', 200);
                    }
                    if( !total ){
                        db.rollback();
                        db.release();// 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd('没有找到可操作的数据!!', 200);
                    }
                    db.query( "INSERT INTO `db_bargain_user` SET ?" , creat1 , function( err, result1 , fields ){
                        if( err ){
                            // 数据插入失败, 回滚
                            db.rollback();
                            db.release();// 释放资源
                            conn.end(); // 结束当前数据库链接
                            return res.errorEnd('没有找到可用数据', 200);
                        }
                        // 用户成功参加活动后查询出当前活动的参加人数
                        db.query("select id,user_cj from `db_bargain` where id=? ",[body.bargain_id], function(err, row, fields) {
                            // 数据获取失败
                            if (err) {
                                db.rollback();
                                db.release();// 释放资源
                                conn.end(); // 结束当前数据库链接
                                return res.errorEnd('没有找到可用数据', 200);
                            }
                            var user_cj = Number(row[0].user_cj)+1;
                            var _id = row[0].id;
                            // 用户成功参加活动后 活动参加人数加1
                            db.query( "UPDATE `db_bargain` SET user_cj=? where id=?" , [ user_cj ,_id] , function( err, result , fields ){
                                var total = result.changedRows ; // 受影响的数据条数, ( 已删除的数据条数 )
                                if( err ){
                                    db.rollback();
                                    db.release();// 释放资源
                                    conn.end(); // 结束当前数据库链接
                                    return res.errorEnd('更新数据失败!!', 200);
                                }
                                if( !total ){
                                    db.rollback();
                                    db.release();// 释放资源
                                    conn.end(); // 结束当前数据库链接
                                    return res.errorEnd('没有找到可操作的数据!!', 200);
                                }
                                db.commit();
                                db.release(); // 释放资源
                                conn.end(); // 结束当前数据库链接
                                creat1.id = result1.insertId
                                return res.successEnd(row);
                            });
                        });
                    });
                });
            }
        });
    });
}