/**
 * Created by Administrator on 2017/8/9.
 *  活动的作用区域的修改
 */
const moment = require('moment'); // 时间处理
'use strict';
exports.ready = (req, res, that) => {

    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query; // 当前请求传递过来的 GET 数据,
    const body = req.body; // 当前请求传递过来的 POST 数据
    if(that.isEmpty(req.session.user_token)){
        return res.errorEnd('当前请求不存在 Token 或 Token 不可用', 300);
    }
    var user = req.session.user_rows;
    if( body.update.length<=0 ){
        return res.errorEnd('店铺id不存在', 200);
    }
    if( !body.activity_type ){
        return res.errorEnd('活动类型不存在', 200);
    }
    if( !body.delete_id ){
        return res.errorEnd('活动id不存在', 200);
    }
    that.connect(( err , db , conn ) => {
        // 更新数据
        var date_time = moment().format('YYYY-MM-DD h:mm:ss');
        var bargain_time = moment().format('X');
        // 获取活动数据
        db.query("select * from db_activity_shopowner_relation  where activity_id=? and activity_type=? ",[body.delete_id,body.activity_type], function(err, row, fields) {
            // 数据获取失败
            if (err) {
                db.rollback();
                db.release();// 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd('没有找到可用数据', 200);
            }
            var relation = row[0];// 其中一条数据
            if( relation.activity_type == 2 ){
                var table_name = "db_bargain";
                var table_user = "db_bargain_user";
            }
            // 删除历史数据
            db.query( "DELETE FROM db_activity_shopowner_relation WHERE activity_id = ? and activity_type=?" , [ body.delete_id,body.activity_type ] , function( err, result , fields ){
                var total = result.affectedRows; // 受影响的数据条数, ( 已删除的数据条数 )
                if( err ){
                    db.release();// 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd('删除数据失败!!', 200);
                }
                if( !total ){
                    db.release();// 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd('没有找到可操作的数据!!', 200);
                }
                var item = body.update;
                var len = item.length
                function forEach(index){
                    if( index >= len  ){
                        db.commit();
                        db.release(); // 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.successEnd('添加成功!!');
                    }
                    var shopowner_obj = {
                        "activity_id": relation.activity_id,
                        "activity_type": relation.activity_type,
                        "boss_id" : relation.boss_id,
                        "shopowner_id": item[index].shopowner_id,
                        "user_id": item[index].user_id,
                        "top_shopowner_id": relation.top_shopowner_id,
                        "addtime" : date_time
                    }
                    // 添加关系表
                    db.query( "INSERT INTO `db_activity_shopowner_relation` SET ?" , shopowner_obj , function( err, result , fields ){
                        if( err ){
                            // 数据插入失败, 回滚
                            db.rollback();
                            db.release();// 释放资源
                            conn.end(); // 结束当前数据库链接
                            return res.errorEnd('添加失败1', 200);
                        }
                        // 砍价活动新添加的店长在db_bargain_user表里面没有数据的时候，给添加新的数据，存在则不修改
                        if( relation.activity_type == 2 ){
                            db.query("select * from db_bargain_user  where bargain_id=? and boss_id=? and user_id=? ",[relation.activity_id,relation.boss_id,item[index].user_id], function(err, row, fields) {
                                // 数据获取失败
                                if (err) {
                                    db.rollback();
                                    db.release();// 释放资源
                                    conn.end(); // 结束当前数据库链接
                                    return res.errorEnd('没有找到可用数据', 200);
                                }
                                if( row.length == 0 ){
                                    // 查询出砍价活动的信息
                                    db.query("select * from ??  where id=? ",[table_name,body.delete_id], function(err, row_a, fields) {
                                        // 数据获取失败
                                        if (err) {
                                            db.rollback();
                                            db.release();// 释放资源
                                            conn.end(); // 结束当前数据库链接
                                            return res.errorEnd('没有找到可用数据', 200);
                                        }
                                        // 查询出用户的信息
                                        db.query("select * from `db_people` where id=? ",[item[index].user_id], function(err, row_p, fields) {
                                            // 数据获取失败
                                            if (err) {
                                                db.rollback();
                                                db.release();// 释放资源
                                                conn.end(); // 结束当前数据库链接
                                                return res.errorEnd('没有找到可用数据', 200);
                                            }
                                            // 添加砍价人的基本资料
                                            var user_obj = {
                                                "openid":row_p[0]['openid'],
                                                "phone_number":row_p[0]['mobile'],
                                                "username":row_p[0]['nickname'],
                                                "bargain_id":row_a[0].id,
                                                "original_price":row_a[0].original_price,
                                                "floor_price":row_a[0].floor_price,
                                                "new_price":row_a[0].original_price,
                                                "bargain_type":relation.activity_type,
                                                "addtime":bargain_time,
                                                "boss_id":relation.boss_id,
                                                "shopowner_id":item[index].shopowner_id,
                                                "salesman_id":row_p[0]['clerk_id'],
                                                "agent_id":row_p[0]['prolocutor_id'],
                                                "user_id":item[index].user_id
                                            }
                                            // 为店长添加砍价信息
                                            db.query( "INSERT INTO `db_bargain_user` SET ?" , user_obj , function( err, result , fields ){
                                                if( err ){
                                                    // 数据插入失败, 回滚
                                                    db.rollback();
                                                    db.release();// 释放资源
                                                    conn.end(); // 结束当前数据库链接
                                                    return res.errorEnd('添加失败1', 200);
                                                }
                                                 forEach(index+1);
                                            });
                                        });
                                    });
                                }else{
                                     forEach(index+1);
                                }
                            });
                        }else{
                            forEach(index+1);
                        }
                    });
                }
                forEach(0);
            });
        });
    });
}
