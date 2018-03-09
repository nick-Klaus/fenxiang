/**
 * Created by Administrator on 2017/8/9.
 *  活动的审核扣钱  扣库存
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
    if( that.isEmpty(body.id) || that.isEmpty(body.table_name) ){
        return res.errorEnd('条件不能为空', 200);
    }
    // 更新数据
    if( !that.isEmpty(body.status) ){
        var update_arr = {"status":body.status}
    }
    
    var user = req.session.user_rows;
    var currentdate = moment().format('YYYY-MM-DD HH:mm:ss');
    that.connect(( err , db , conn ) => {

        var table_name = body.table_name;//表名
        var activity_id  = body.id;// 活动id
        db.query("select * from ?? where id=? ",[table_name,activity_id], function(err, row2, fields) {
            // 数据获取失败
            if (err || row2[0].status != 0 ) {
                db.release(); // 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd('活动不存在或状态不是待审核', 200);
            }
            if( Number(row2[0].product_quantity) == 0 ){
                db.release(); // 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd('该活动没有产品！！', 200);
            }
            var start_up_money = row2[0].start_up_money_all;// 活动启动资金
            // 插入老板端支出明细数据
            var  enchashment_creat = {
                "manager_id": user.manager_id,
                "shopowner_id": user.shopowner_id,
                "clerk_id": user.clerk_id,
                "prolocutor_id": user.prolocutor_id,
                "spokesman_id": user.id,
                "types": "活动的启动资金",
                "activity_id": body.id,
                "activity_type":body.activity_type,
                "type":1,
                "openid":user.openid,
                "record":"活动的启动资金",
                "money": start_up_money,
                "create_days": currentdate,
                "create_date": currentdate
            }
            // 查询老板的余额是否充足
        db.query("select * from `db_manager` where id=? ",[user.manager_id], function(err, row, fields) {
            // 数据获取失败
            if (err) {
                db.release(); // 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd('老板不存在', 200);
            }
            var _product_id = row2[0].product_id;
            db.query("select id,stock  from `db_product` where id=? ",[_product_id], function(err, row1, fields) {
                // 数据获取失败
                if (err) {
                    db.release(); // 释放资源
                    conn.end(); // 结束当前数据库链接                    
                    return res.errorEnd('产品不存在', 200);
                }
                var _product_quantity = Number(row1[0].stock) - Number(row2[0].product_quantity);// 活动产品数量
                var amount_new = Number(row[0].amount) - Number(start_up_money);// 活动启动资金
                if( amount_new >= 0 && _product_quantity >= 0  ){
                    // 插入老板端支出明细
                    db.query( "UPDATE  db_product SET stock=? where id=?" , [_product_quantity, _product_id] , function( err, result , fields ){
                        var total = result.changedRows ; // 受影响的数据条数, ( 已删除的数据条数 )
                        if( err ){
                            db.release(); // 释放资源
                            conn.end(); // 结束当前数据库链接
                            return res.errorEnd('更新数据失败!!', 200);
                        }
                        if( !total ){
                            db.release(); // 释放资源
                            conn.end(); // 结束当前数据库链接
                            return res.errorEnd('库存不足!!', 200);
                        }
                        db.query( "INSERT INTO `db_manager_enchashment` SET ?" , enchashment_creat , function( err, result , fields ){
                        if( err ){
                            // 数据插入失败, 回滚
                            db.rollback();
                            db.release();// 释放资源
                            return res.errorEnd('创建数据失败!!', 200);
                        }
                            //审核活动 把活动status修改为1
                            db.query( "UPDATE ?? SET ? where id=? and boss_id=?" , [ table_name,update_arr ,activity_id,user.manager_id] , function( err, result , fields ){
                                var total = result.changedRows ; // 受影响的数据条数, ( 已删除的数据条数 )
                                if( err ){
                                    db.release(); // 释放资源
                                    conn.end(); // 结束当前数据库链接
                                    return res.errorEnd('更新数据失败!!', 200);
                                }
                                if( !total ){
                                    db.release(); // 释放资源
                                    conn.end(); // 结束当前数据库链接
                                    return res.errorEnd('活动已在进行中!!', 200);
                                }
                                db.commit();
                                db.release(); // 释放资源
                                conn.end(); // 结束当前数据库链接
                                return res.successEnd("修改成功"+ total);
                            });
                        });
                    });
                }else{
                    db.commit();
                    db.release(); // 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd("资金或者产品数量不足啦", 200);
                }
                });
            });
        });
    });
}
