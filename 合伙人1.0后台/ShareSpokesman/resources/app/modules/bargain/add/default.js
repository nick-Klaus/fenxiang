/**
 * Created by Administrator on 2017/8/9.
 * 砍价活动 创建
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
    var currentdate = moment().format('YYYY-MM-DD ');
    if( body.shopowner_id.length<=0 ){
        return res.errorEnd('店铺id不存在', 200);
    }
    that.connect(( err , db , conn ) => {
        db.beginTransaction(function(err){
            if ( body.browse_money_time >= 1 || body.forward_money_time >= 1 || body.share_money_time >= 1 ) {
                db.rollback();
                db.release();// 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd('分享、转发、浏览奖励金不能超过1块', 200);
            }
            // 事物创建失败  老板id不能为空
            var date_time = moment().format('YYYY-MM-DD h:mm:ss');
            var bargain_time = moment().format('X');
            var bargain_obj = {
                "boss_id":  user.manager_id,
                "shopowner_id": user.shopowner_id,
                "openid": user.openid,
                "status" : body.status,
                "title" : body.title,
                "start_time" : body.start_time,
                "end_time" : body.end_time,
                "start_up_money_all" : body.start_up_money_all,
                "start_up_money_residue" : body.start_up_money_all,
                "gift_quantity" : body.gift_quantity,
                "product_quantity" : body.product_quantity,
                "original_price" : body.original_price,
                "floor_price" :body.floor_price,
                "bargain_times" : body.bargain_times,
                "max_sale" : body.max_sale,
                "min_sale" : body.min_sale,
                "product_id" : body.product_id,
                "share_money_time" : body.share_money_time,
                "forward_money_time" : body.forward_money_time,
                "browse_money_time" : body.browse_money_time,
                "image_logo" : body.image_logo,
                "gift_describe_txt" : body.gift_describe_txt,
                "activity_rules" :body.activity_rules,
                "award_information" : body.award_information,
                "company_introduction" : body.company_introduction,
                "gift_describe" : body.gift_describe,
                "company_introduction_img" : body.company_introduction_img,
                "addtime" : bargain_time,
                "action_area" : 2
            }
            // 查询老板的余额是否充足
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
                    // 添加砍价活动
                    db.query( "INSERT INTO `db_bargain` SET ?" , bargain_obj , function( err, result , fields ){
                        if( err ){
                            // 数据插入失败, 回滚
                            db.rollback();
                            db.release();// 释放资源
                            conn.end(); // 结束当前数据库链接
                            return res.errorEnd("错误提示", 200);
                        }
                        // 前台传入的shopowner_id 集合  需要参与店铺的店长在创建活动的时候就参与活动
                        var item = body.shopowner_id;
                        var len = item.length
                        function forEach(index){
                            if( index >= len  ){
                                db.commit();
                                db.release(); // 释放资源
                                conn.end(); // 结束当前数据库链接
                                return res.successEnd('添加成功!!');
                            }
                            // 获取店长在people表里的数据
                            db.query("select * from `db_people` where id=? ",[item[index].user_id], function(err, row_p, fields) {
                                // 数据获取失败
                                if (err) {
                                    db.rollback();
                                    db.release();// 释放资源
                                    conn.end(); // 结束当前数据库链接
                                    return res.errorEnd('没有找到可用数据', 200);
                                }
                                if( row.length != 0 ){
                                    // 店长参加砍价活动
                                    var user_obj = {
                                        "openid":row_p[0]['openid'],
                                        "phone_number":row_p[0]['mobile'],
                                        "username":row_p[0]['nickname'],
                                        "bargain_id":result.insertId,
                                        "original_price":body.original_price,
                                        "floor_price":body.floor_price,
                                        "new_price":body.original_price,
                                        "bargain_type":2,
                                        "addtime":bargain_time,
                                        "boss_id":user.manager_id,
                                        "shopowner_id":item[index].shopowner_id,
                                        "salesman_id":row_p[0]['clerk_id'],
                                        "agent_id":row_p[0]['prolocutor_id'],
                                        "user_id":item[index].user_id
                                    }
                                    // 关系表参数
                                    var shopowner_obj = {
                                        "activity_id": result.insertId,
                                        "activity_type": 2,
                                        "boss_id" : user.manager_id,
                                        "shopowner_id":item[index].shopowner_id,
                                        "user_id":item[index].user_id,
                                        "top_shopowner_id":user.shopowner_id,
                                        "addtime" : date_time
                                    }
                                    // 添加砍价的人
                                    db.query( "INSERT INTO `db_bargain_user` SET ?" , user_obj , function( err, result , fields ){
                                        if( err ){
                                            // 数据插入失败, 回滚
                                            db.rollback();
                                            db.release();// 释放资源
                                            conn.end(); // 结束当前数据库链接
                                            return res.errorEnd('添加失败1', 200);
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
                                            forEach(index+1);
                                        });
                                    });
                                }else{
                                    forEach(index+1);
                                }
                            });
                        }
                        forEach(0);
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