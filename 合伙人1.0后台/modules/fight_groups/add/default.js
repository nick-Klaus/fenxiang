/**
 * Created by Administrator on 2017/10/23.
 * 拼团活动创建
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
            // 事物创建失败
            if (err) {
                db.release(); // 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd('没有找到可用数据', 200);
            }
            var date_time = moment().format('X');
            var new_date_time = moment().format('YYYY-MM-DD h:mm:ss');
            var fight_groups = {
                "openid":user.openid,
                "product_id":body.product_id,
                "image_logo":body.image_logo,
                "banner_top":body.banner_top,
                "title":body.title,
                "start_time":body.start_time,
                "end_time":body.end_time,
                "user_end_time":body.user_end_time,
                "product_quantity":body.product_quantity,
                "group_product_quantity":body.group_product_quantity,
                "activity_rules":body.activity_rules || "",
                "award_information":body.award_information || "",
                "product_introduction":body.product_introduction,
                "product_introduction_img":body.product_introduction_img,
                "phone_number":user.mobile,
                "addtime":date_time,
                "boss_id":user.manager_id,
                "shopowner_id":user.shopowner_id,
                "remark":body.remark,
                "start_up_money_all":body.start_up_money_all,
                "start_up_money_residue":body.start_up_money_all,
                "share_money_time":body.share_money_time,
                "forward_money_time":body.forward_money_time,
                "browse_money_time":body.browse_money_time,
                "floor_price":body.floor_price,
                "original_price":body.original_price,
                "group_creator_price":body.group_creator_price,
                "group_jion_price":body.group_jion_price,
                "direct_profit":body.direct_profit,
                "indirect_profit":body.indirect_profit,
                "sale_profit":body.sale_profit,
                "action_area":2,
                "deposit":body.deposit
            }
            // 插入数据
            db.query( "INSERT INTO `db_fight_groups` SET ?" ,fight_groups , function( err, result , fields ){
                if( err ){
                    // 数据插入失败, 回滚
                    db.rollback();
                    db.release();// 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd(fight_groups, 200);
                }
                var item = body.shopowner_id;
                var len = item.length;
                function forEach( index ) {
                    if (index >= len) {
                        db.commit();
                        db.release(); // 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.successEnd('添加成功!!');
                    }
                    var shopowner_obj = {
                        "activity_id": result.insertId,
                        "activity_type": 4,
                        "boss_id" : user.manager_id,
                        "shopowner_id":item[index].shopowner_id,
                        "user_id":item[index].user_id,
                        "top_shopowner_id":user.shopowner_id,
                        "addtime" : new_date_time
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
                // db.commit();
                // db.release(); // 释放资源
                // conn.end(); // 结束当前数据库链接
                // return res.successEnd("创建数据成功" + result.insertId );
            });
        });
    });
}