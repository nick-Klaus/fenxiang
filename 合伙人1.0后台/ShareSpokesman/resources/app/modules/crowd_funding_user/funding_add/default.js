/**
 * Created by Administrator on 2017/8/11.
 * 众筹活动用户的添加 如果不存在则创建数据直接参加活动，存在则改status为1
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
    // {
    //     "token": "0bdf5bacdae8f52bf8e53cdcfc169606",
    //     "crowd_funding_id": "5",
    // }
    that.connect(( err , db , conn ) => {
        db.beginTransaction(function(err){
            // 事物创建失败
            if (err) {
                db.commit();
                db.release(); // 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd('没有找到可用数据', 200);
            }
            // 查询出活动数据
            db.query("select * from `db_crowd_funding` where id=?", [body.crowd_funding_id], function (err, row, fields) {
                // 数据获取失败
                if (err || row.length == 0) {
                    db.commit();
                    db.release();// 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd('没有找到可用数据', 200);
                }
                db.query("select * from `db_crowd_funding_user` where crowd_funding_id=? and user_id=? and shopowner_id=?", [row[0].id,user.id,user.shopowner_id], function (err, row_user, fields) {
                    // 数据获取失败
                    if (err) {
                        db.commit();
                        db.release();// 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd('没有找到可用数据', 200);
                    }
                    // 已经存在 则直接返回该条数据
                    if( row_user.length == 0 ){
                        var currentdate = moment().format('YYYY-MM-DD HH:mm:ss');
                        var current_date = moment().format('X');
                        var _ip = req.ip.split(':')[3];
                        var create_data = {
                            "openid":user.openid,
                            "floor_price":row[0].floor_price,
                            "new_price":row[0].floor_price,
                            "funding_price":row[0].funding_price,
                            "phone_number":user.mobile,
                            "username":user.nickname,
                            "crowd_funding_id": row[0].id,
                            "ip": _ip || "",
                            "addtime":current_date,
                            "boss_id":user.manager_id,
                            "shopowner_id":user.shopowner_id,
                            "salesman_id":user.clerk_id,
                            "agent_id":user.prolocutor_id,
                            "status":1,
                            "user_id":user.id
                        }
                        // 插入数据
                        db.query( "INSERT INTO `db_crowd_funding_user` SET ?" , create_data , function( err, result , fields ){
                            if( err ){
                                // 数据插入失败, 回滚
                                db.rollback();
                                db.release();// 释放资源
                                conn.end(); // 结束当前数据库链接
                                return res.errorEnd('创建数据失败!!', 200);
                            }
                            db.commit();
                            db.release(); // 释放资源
                            conn.end(); // 结束当前数据库链接
                            create_data.id = result.insertId;
                            var data = new Array();
                            data.push(create_data);
                            return res.successEnd(data);
                        });
                    }else{
                        if( row_user[0].status == 0 ){
                            db.query( "UPDATE `db_crowd_funding_user` SET status=1 where id=?" , [row_user[0].id] , function( err, result , fields ){
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
                                    return res.errorEnd('你已经参与了此活动!!', 200);
                                }
                                // 修改活动的参加人数  参加成功则加1个人
                                var _user_cj = that.floatAdd(Number(row[0].user_cj),1);
                                db.query( "UPDATE `db_crowd_funding` SET user_cj=? where id=?" , [ _user_cj ,row[0].id] , function( err, result , fields ){
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
                                    return res.successEnd(row_user);
                                });
                            });
                        }else{
                            db.commit();
                            db.release(); // 释放资源
                            conn.end(); // 结束当前数据库链接
                            return res.successEnd(row_user);
                        }
                    }
                });
            });
        });
    });
}