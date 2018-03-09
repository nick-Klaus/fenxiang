/**
 * Created by Administrator on 2017/8/11.
 * 单品活动添加
 */
const moment = require('moment'); // 时间处理插件
'use strict';
exports.ready = (req, res, that) => {
    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query; // 当前请求传递过来的 GET 数据,
    const body = req.body; // 当前请求传递过来的 POST 数据
    if(that.isEmpty(req.session.user_token)){
        return res.errorEnd('当前请求不存在 Token 或 Token 不可用1', 300);
    }
    var user = req.session.user_rows;
    var currentdate = moment().format('YYYY-MM-DD ');
    var date_time = moment().format('YYYY-MM-DD h:mm:ss');
    if( body.shopowner_id.length<=0 ){
        return res.errorEnd('店铺id不存在', 200);
    }
    // 传单活动添加
    that.connect(( err , db , conn ) => {
        db.beginTransaction(function(err){
            // 事物创建失败  老板id不能为空
            if (err) {
                db.rollback();
                db.release();// 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd('没有找到可用数据', 200);
            }
            if ( body.browse_money_time >= 1 || body.forward_money_time >= 1 || body.share_money_time >= 1 ) {
                db.rollback();
                db.release();// 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd('分享、转发、浏览奖励金不能超过1块', 200);
            }
            var single_product = {
                "addtime": body.addtime,
                "banner_top":body.banner_top,
                "boss_id":user.manager_id,
                "browse_money_time":body.browse_money_time,
                "direct_profit":body.direct_profit,
                "end_time":body.end_time,
                "floor_price":body.floor_price,
                "forward_money_time":body.forward_money_time,
                "image_logo":body.image_logo,
                "indirect_profit":body.indirect_profit,
                "openid":user.openid,
                "original_price":body.original_price,
                "product_id":body.product_id,
                "product_introduction":body.product_introduction,
                "product_introduction_img":body.product_introduction_img,
                "product_quantity":body.product_quantity,
                "sale_profit":body.sale_profit,
                "share_money_time":body.share_money_time,
                "shopowner_id":user.shopowner_id,
                "start_time":body.start_time,
                "start_up_money_all":body.start_up_money_all,
                "start_up_money_residue": body.start_up_money_all,
                "deposit": body.deposit,
                "status":body.status,
                "action_area": 2,
                "title":body.title
            }
            db.query("select * from `db_manager` where id=? ",[user.manager_id], function(err, row, fields) {
                // 数据获取失败
                if (err) {
                    db.rollback();
                    db.release();// 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd('没有找到可用数据', 200);
                }
                var amount_new = Number(row[0].amount) - Number(body.start_up_money_all);
                if( amount_new >= 0  ){
                    // 添加单品活动数据
                    db.query( "INSERT INTO `db_single_product` SET ?" , single_product , function( err, result , fields ){
                        if( err ){
                            // 数据插入失败, 回滚
                            db.rollback();
                            db.release();// 释放资源
                            conn.end(); // 结束当前数据库链接
                            return res.errorEnd("添加失败", 200);
                        }
                        var product_id = result.insertId;
                        var product_user = {
                            "openid":user.openid,
                            "phone_number":user.mobile,
                            "username":user.nickname,
                            "single_product_id":product_id,
                            "addtime":body.addtime,
                            "boss_id":user.manager_id,
                            "shopowner_id":user.shopowner_id,
                            "user_id":user.id,
                            "salesman_id":user.clerk_id,
                            "agent_id":user.prolocutor_id
                        }
                        // 添加单品活动用户
                        db.query( "INSERT INTO `db_single_product_user` SET ?" , product_user , function( err, result , fields ){
                            if( err ){
                                // 数据插入失败, 回滚
                                db.rollback();
                                db.release();// 释放资源
                                conn.end(); // 结束当前数据库链接
                                return res.errorEnd('创建数据失败!!', 200);
                            }
                            // 关系表参数
                            var item = body.shopowner_id;
                            var len = item.length;
                            function forEach( index ){
                                if( index >= len  ){
                                    db.commit();
                                    db.release(); // 释放资源
                                    conn.end(); // 结束当前数据库链接
                                    return res.successEnd('添加成功!!');
                                }
                                var shopowner_obj = {
                                    "activity_id": product_id,
                                    "activity_type": 1,
                                    "boss_id" : user.manager_id,
                                    "shopowner_id":item[index].shopowner_id,
                                    "user_id":item[index].user_id,
                                    "top_shopowner_id":user.shopowner_id,
                                    "addtime" : date_time
                                }
                                db.query( "INSERT INTO `db_activity_shopowner_relation` SET ?" , shopowner_obj , function( err, result , fields ){
                                    if( err ){
                                        // 数据插入失败, 回滚
                                        db.rollback();
                                        db.release();// 释放资源
                                        conn.end(); // 结束当前数据库链接
                                        return res.errorEnd('添加失败1', 200);
                                    }
                                    forEach(index+1);
                                });
                            }
                            forEach(0);
                        });
                    });
                }else{
                    // 这个打印, 只会出现在主程序的控制台中
                    db.commit();
                    db.release(); // 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd('余额不足', 200);
                }
            })
        });
    });
}