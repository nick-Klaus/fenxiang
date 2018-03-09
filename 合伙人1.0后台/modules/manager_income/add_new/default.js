/**
 * Created by Administrator on 2017/8/18.
 * 收益日志的添加
 */
const moment = require('moment')// 时间处理模块
'use strict';
exports.ready = (req, res, that) => {
    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query; // 当前请求传递过来的 GET 数据,
    const body = req.body; // 当前请求传递过来的 POST 数据
    that.connect(( err , db , conn ) => {
        db.beginTransaction(function(err){
            // 事物创建失败  管理员id不能为空
            var _ip = req.ip.split(':')[3];
            var _date = moment().format('YYYY-MM-DD HH:mm:ss');
            var _timethis = moment( moment().format('YYYY-MM-DD HH:mm:ss') ).format('X');
            var _addtime = moment().format('YYYY-MM-DD');
            var  record_arr = {
                "openid": body.openid || "",
                "types": body.types || "",
                "operation_type": body.type | 0,
                "addtime": _addtime,
                "time": _timethis,
                "user_id": body.spokesman_id | 0,
                "boss_id": body.manager_id | 0,
                "activity_type": body.activity_type | 0,
                "commission": "",
                "commission_type": "",
                "commission_no": "",
                "latitude": body.latitude,
                "longitude": body.longitude,
                "ip": _ip || 0,
                "activity_id": body.activity_id | 0
            }
            //1单排 2砍价 3众筹 4拼团 5拍卖 6传单
            if( body.activity_type == 1 ){
                var _table = "db_single_product";
            }
            if( body.activity_type == 2 ){
                var _table = "db_bargain";
            }
            if( body.activity_type == 6 ){
                var _table = "db_leaflet";
            }
            // 查询出今日的分享 转发 浏览的次数
            db.query("select count(id) as num from `db_activity_record` where activity_type=? and activity_id=? and user_id=? and operation_type=? and openid=? and addtime=?", [body.activity_type,body.activity_id,body.spokesman_id,body.type,body.openid,_addtime], function (err, row1, fields) {
                // 数据获取失败
                if (err) {
                    db.rollback();
                    db.release();// 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd('没有找到可用数据', 200);
                }
                // 与规则表里面的规则进行对比看是否要给佣金
                db.query("select forward_time,share_time,see_time from `db_people_day_rule` where  manager_id=?", [body.manager_id], function (err, row2, fields) {
                    // 数据获取失败
                    if (err) {
                        db.rollback();
                        db.release();// 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd('没有找到可用数据', 200);
                    }
                    if( body.type == 1 ){ //分享
                        var this_type = row2[0].share_time;
                    }
                    if( body.type == 2 ){ //转发
                        var this_type = row2[0].forward_time;
                    }
                    if( body.type == 3 ){ //浏览
                        var this_type = row2[0].see_time;
                    }
                    if( row1[0].num >= this_type ){
                        record_arr.commission_type = 2;
                        record_arr.commission = "次数用完没有佣金";
                        db.query( "INSERT INTO `db_activity_record` SET ?" , record_arr , function( err, result , fields ){
                            if( err ){
                                db.rollback();
                                db.release();// 释放资源
                                conn.end(); // 结束当前数据库链接
                                return res.errorEnd('创建数据失败1!!', 200);
                            }
                            db.commit();
                            db.release(); // 释放资源
                            conn.end(); // 结束当前数据库链接
                            return res.successEnd("次数用完没有佣金" );
                        });
                    }else{
                        // 查寻出当前活动的活动启动金还剩多少
                        db.query("select id,start_up_money_all,start_up_money_residue from ?? where id=?", [_table,body.activity_id], function (err, row, fields) {
                            if (err) {
                                db.rollback();
                                db.release();// 释放资源
                                conn.end(); // 结束当前数据库链接
                                return res.errorEnd('没有找到可用数据', 200);
                            }
                            var _money = Number(body.MONEY);// 发放奖励
                            var _money_all =  Number(row[0].start_up_money_all);// 原始启动资金
                            var _old_money = Number(row[0].start_up_money_residue);// 剩余启动资金
                            if( _old_money > 0 && _old_money >= _money ){
                                // 减掉活动奖励后剩余的资金 并修改
                                var new_money = _old_money - _money;
                                db.query("UPDATE ?? SET start_up_money_residue=? where id=?", [_table,new_money, row[0].id], function (err, result, fields) {
                                    var total = result.changedRows; // 受影响的数据条数, ( 已删除的数据条数 )
                                    if (err) {
                                        db.rollback();
                                        db.release();// 释放资源
                                        conn.end(); // 结束当前数据库链接
                                        return res.errorEnd('更新数据失败!!', 200);
                                    }
                                    if (!total) {
                                        db.rollback();
                                        db.release();// 释放资源
                                        conn.end(); // 结束当前数据库链接
                                        return res.errorEnd('启动资金不足或没有查看奖励!!', 200);
                                    }
                                    var income_arr = {
                                        openid : body.openid,
                                        spokesman_id :body.spokesman_id,
                                        manager_id : body.manager_id,
                                        shopowner_id : body.shopowner_id,
                                        clerk_id : body.clerk_id,
                                        prolocutor_id : body.prolocutor_id,
                                        MONEY : body.MONEY,
                                        types : body.types,
                                        type : body.type,
                                        create_days :_date,
                                        create_date : _date,
                                        activity_id : body.activity_id,
                                        activity_type : body.activity_type
                                    }
                                    // 插入数据
                                    db.query( "INSERT INTO `db_manager_income` SET ?" , income_arr , function( err, result , fields ){
                                        if( err ){
                                            db.rollback();
                                            db.release();// 释放资源
                                            conn.end(); // 结束当前数据库链接
                                            return res.errorEnd('创建数据失败2!!', 200);
                                        }
                                        record_arr.commission_type = 1;
                                        record_arr.commission_no = _money;
                                        record_arr.commission = "本次获得:"+_money;
                                        db.query( "INSERT INTO `db_activity_record` SET ?" , record_arr , function( err, result , fields ){
                                            if( err ){
                                                db.rollback();
                                                db.release();// 释放资源
                                                conn.end(); // 结束当前数据库链接
                                                return res.errorEnd('创建数据失败1!!', 200);
                                            }
                                            db.query("select * from `db_activity_log` where user_id=? and boss_id=?", [body.spokesman_id, body.manager_id], function (err, row1, fields) {
                                                // 数据获取失败
                                                if (err) {
                                                    db.rollback();
                                                    db.release();// 释放资源
                                                    conn.end(); // 结束当前数据库链接
                                                    return res.errorEnd('没有找到可用数据', 200);
                                                }
                                                var  share_price = Number(body.MONEY);
                                                var _share_price_new = Number(row1[0].share_price_new) + share_price;// 今日分享金
                                                var _share_price_month = Number(row1[0].share_price_month) + share_price;// 月分享金
                                                var _share_price_all = Number(row1[0].share_price_all) + share_price;// 总的分享金
                                                var _profit_new = Number(row1[0].profit_new) + share_price;// 今日收益
                                                var _profit_month = Number(row1[0].profit_month) + share_price;// 本月收益
                                                var _profit_all = Number(row1[0].profit_all) + share_price;// 总的收益
                                                var date = new Date();
                                                var currentdate = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
                                                var activity_log = {
                                                    "share_price_new": _share_price_new,
                                                    "share_price_month": _share_price_month,
                                                    "share_price_all": _share_price_all,
                                                    "share_price_time": currentdate,
                                                    "profit_time": currentdate,
                                                    "profit_new": _profit_new,
                                                    "profit_month": _profit_month,
                                                    "profit_all": _profit_all
                                                }
                                                db.query("UPDATE `db_activity_log` SET ? where id=?", [activity_log, row1[0].id], function (err, result, fields) {
                                                    var total = result.changedRows; // 受影响的数据条数, ( 已删除的数据条数 )
                                                    if (err) {
                                                        db.rollback();
                                                        db.release();// 释放资源
                                                        conn.end(); // 结束当前数据库链接
                                                        return res.errorEnd('更新数据失败!!', 200);
                                                    }
                                                    if (!total) {
                                                        db.rollback();
                                                        db.release();// 释放资源
                                                        conn.end(); // 结束当前数据库链接
                                                        return res.errorEnd('没有找到可操作的数据1!!', 200);
                                                    }
                                                    db.commit();
                                                    db.release(); // 释放资源
                                                    conn.end(); // 结束当前数据库链接
                                                    return res.successEnd("更新成功"+total);
                                                });
                                            });
                                        });
                                    });
                                });
                            }else{
                                db.commit();
                                db.release(); // 释放资源
                                conn.end(); // 结束当前数据库链接
                                return res.successEnd("当前活动资金不足");
                            }
                        });
                    }
                });
            });
        });
    });
}