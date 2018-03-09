/**
 * Created by Administrator on 2017/8/9.
 * 活动剩余资金的退款
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
        if( that.isEmpty(body.id) || that.isEmpty(body.table_name) ){
            db.rollback();
            db.release();// 释放资源
            conn.end(); // 结束当前数据库链接
            return res.errorEnd('条件不能为空', 200);
        }
        var currentdate = moment().format('YYYY-MM-DD HH:ss:mm');
        var _table_name = body.table_name;
        db.query("SELECT * FROM  ??  WHERE  id=? and boss_id=?",[_table_name,body.id,user.manager_id], function(err, row, fields) {
            // 数据获取失败
            if (err) {
                db.rollback();
                db.release();// 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd('没有找到可用数据', 200);
            }
            var up_money = row[0].start_up_money_residue;// 剩余的启动资金
            if( up_money > 0 ){
                var  update_arr = {"start_up_money_residue":0,"return_money":up_money}
                // 活动的剩余启动金改为0
                db.query( "UPDATE ?? SET ? where id=? and boss_id=?" , [ _table_name,update_arr ,body.id,user.manager_id] , function( err, result , fields ){
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
                    var income_creat = {
                        "openid":user.openid,
                        "manager_id":user.manager_id,
                        "shopowner_id":user.shopowner_id,
                        "clerk_id":user.clerk_id,
                        "prolocutor_id":user.prolocutor_id,
                        "spokesman_id":user.id,
                        "MONEY":up_money,
                        "types":"活动剩余金退回",
                        "record":"活动结束剩余的资金退回",
                        "create_days":currentdate,
                        "create_date":currentdate,
                        "activity_id":body.id,
                        "activity_type":body.activity_type,
                        "type":8
                    }
                    // 活动的剩余启动金返回给老板
                    db.query( "INSERT INTO `db_manager_income` SET ?" , income_creat , function( err, result , fields ){
                        if( err ){
                            // 数据插入失败, 回滚
                            db.rollback();
                            db.release();// 释放资源
                            return res.errorEnd('创建数据失败!!', 200);
                        }
                        // 找出老板已消耗的资金
                        db.query("SELECT id,consume  FROM `db_manager` WHERE  id=? ",[user.manager_id], function(err, boss_row, fields) {
                            // 数据获取失败
                            if (err) {
                                db.release();// 释放资源
                                conn.end(); // 结束当前数据库链接
                                return res.errorEnd("没有找到老板数据", 200);
                            }
                            // 退回活动的同时 减去已消耗的资金
                            var consume = that.floatSub(parseFloat(boss_row[0].consume),parseFloat(up_money));
                            db.query( "UPDATE `db_manager` SET consume=? where id=? " , [ consume,user.manager_id] , function( err, result , fields ){
                                var total = result.changedRows ; // 受影响的数据条数, ( 已删除的数据条数 )
                                if( err ){
                                    db.release(); // 释放资源
                                    conn.end(); // 结束当前数据库链接
                                    return res.errorEnd('更新数据失败!!', 200);
                                }
                                db.commit();
                                db.release(); // 释放资源
                                conn.end(); // 结束当前数据库链接
                                return res.successEnd("创建数据成功" + result.insertId );
                            });
                        });
                    });
                });
            }else{
                // 这个打印, 只会出现在主程序的控制台中
                db.rollback();
                db.release();// 释放资源
                conn.end(); // 结束当前数据库链接
                return res.successEnd("剩余启动资金为0");
            }
        })
    });
}
