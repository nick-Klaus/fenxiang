/**
 * Created by Administrator on 2017/8/11.
 * 单品活动用户添加
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
    // 单品活动用户添加
    that.connect(( err , db , conn ) => {
        db.beginTransaction(function(err){
            // 事物创建失败
            if (err) {
                return res.errorEnd('没有找到可用数据', 200);
            }
            // 插入数据
            var _product_id = body.single_product_id;
            db.query("select * from `db_single_product_user` where user_id=? and single_product_id=?",[user.id,_product_id], function(err, row, fields) {
                // 数据获取失败
                if (err) {
                    return res.errorEnd('没有找到可用数据', 200);
                }
                if(row.length>0){
                    console.log(err, row, fields, this.sql);
                    db.release(); // 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.successEnd(row);
                }else{
                    var currentdate = moment().format('YYYY-MM-DD');
                    var nowdate = new Date(currentdate) / 1000;
                    var creat = {
                        "openid":user.openid,
                        "phone_number":user.mobile,
                        "username":user.nickname,
                        "single_product_id": _product_id,
                        "addtime":nowdate,
                        "boss_id" :user.manager_id,
                        "shopowner_id": user.shopowner_id,
                        "salesman_id" :user.clerk_id,
                        "agent_id":user.prolocutor_id,
                        "user_id":user.id
                    }
                    db.query( "INSERT INTO `db_single_product_user` SET ?" , creat , function( err, result , fields ){
                        if( err ){
                            // 数据插入失败, 回滚
                            db.rollback();
                            db.release();// 释放资源
                            return res.errorEnd('创建数据失败!!', 200);
                        }
                        db.query("select id,user_cj from `db_single_product` where id=? ",[_product_id], function(err, row, fields) {
                            // 数据获取失败
                            if (err) {
                                return res.errorEnd('没有找到可用数据', 200);
                            }
                        var user_cj = Number(row[0].user_cj)+1;
                        var _id = row[0].id;
                        db.query( "UPDATE `db_single_product` SET user_cj=? where id=?" , [ user_cj ,_id] , function( err, result , fields ){
                            var total = result.changedRows ; // 受影响的数据条数, ( 已删除的数据条数 )
                            if( err ){
                                db.release();// 释放资源
                                return res.errorEnd('更新数据失败!!', 200);
                            }
                            if( !total ){
                                db.release(); // 释放资源
                                return res.errorEnd('没有找到可操作的数据!!', 200);
                            }
                            db.commit();
                            db.release(); // 释放资源
                            conn.end(); // 结束当前数据库链接
                            return res.successEnd("创建数据成功" + total );
                            });
                        });
                    });
                }
            })
        });
    });
}