/**
 * Created by Administrator on 2017/8/11.
 * 拼团活动用户添加
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
    if(that.isEmpty(body.order_id)){
        return res.errorEnd('订单id不存在', 300);
    }
    if(that.isEmpty(body.fight_groups_id)){
        return res.errorEnd('活动id不存在', 300);
    }
    // 单品活动用户添加
    that.connect(( err , db , conn ) => {
        db.beginTransaction(function(err){
            // 事物创建失败
            if (err) {
                db.rollback();
                db.release();// 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd('没有找到可用数据', 200);
            }
            var currentdate = moment().format('YYYY-MM-DD HH:mm:ss');
            var current_date = moment().format('X');
            var _ip = req.ip.split(':')[3];
            // 插入数据
            db.query("select * from `db_fight_groups` where id=? ",[body.fight_groups_id], function(err, row_group, fields) {
                // 数据获取失败
                if (err || row_group.length == 0 ) {
                    db.rollback();
                    db.release();// 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd('没有找到活动数据', 200);
                }
                db.query("select * from `db_fight_groups_user` where fight_groups_id=? and  user_id=?",[body.fight_groups_id,user.id], function(err, row_check, fields) {
                    // 数据获取失败
                    if (err || row_check.length > 0 ) {
                        db.rollback();
                        db.release();// 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd("数据获取失败,或者已经参与拼团！！", 200);
                    }
                    // 拼团结束时间 活动的设定时间*3600+当前的时间
                    var _end_time = that.floatMul(Number(row_group[0].user_end_time),3600);
                    var _user_cj = that.floatAdd(Number(row_group[0].user_cj),1);
                    var end_time = that.floatAdd(current_date,_end_time);
                    var add_data = {
                        "openid":user.openid,
                        "headimgurl":user.headimgurl,
                        "phone_number":user.mobile,
                        "username":user.nickname,
                        "fight_groups_id":body.fight_groups_id,
                        "ip":_ip || "",
                        "addtime":currentdate,
                        "user_end_time":end_time,
                        "boss_id":user.manager_id,
                        "shopowner_id":user.shopowner_id,
                        "salesman_id":user.clerk_id,
                        "agent_id":user.prolocutor_id,
                        "is_header":0,
                        "user_id":user.id,
                        "order_id":body.order_id,
                        "group_status":""
                    }
                    db.query("select * from `db_fight_groups_frist_user` where fight_groups_id=? and  user_id=?",[body.fight_groups_id,user.id], function(err, row_frist, fields) {
                        // 数据获取失败
                        if (err || row_frist.length == 0) {
                            db.rollback();
                            db.release();// 释放资源
                            conn.end(); // 结束当前数据库链接
                            return res.errorEnd("数据获取失败first", 200);
                        }
                        add_data.user_ck = row_frist[0].user_ck;
                        add_data.user_fx = row_frist[0].user_fx;
                        add_data.user_zf = row_frist[0].user_zf;
                        add_data.share_money = row_frist[0].share_money;
                        if( body.top_id > 0 ){
                            // 团长的user数据
                            db.query("select * from `db_fight_groups_user` where id=? and top_id=0 and  is_header=1 and fight_groups_id=?",[body.top_id,body.fight_groups_id], function(err, row_user, fields) {
                                // 数据获取失败
                                if (err || row_user.length == 0 ) {
                                    db.rollback();
                                    db.release();// 释放资源
                                    conn.end(); // 结束当前数据库链接
                                    return res.errorEnd('团长不存在', 200);
                                }
                                // 获取团员的个数
                                db.query("select count(id) as num  from `db_fight_groups_user` where  top_id=?",[row_user[0].id], function(err, row_num, fields) {
                                    // 数据获取失败
                                    if ( err ) {
                                        db.rollback();
                                        db.release();// 释放资源
                                        conn.end(); // 结束当前数据库链接
                                        return res.errorEnd('没有找到可用数据', 200);
                                    }
                                    var group_num = that.floatAdd(Number(row_num[0].num),1);
                                    if(  group_num >= row_group[0].group_product_quantity ){
                                        db.rollback();
                                        db.release();// 释放资源
                                        conn.end(); // 结束当前数据库链接
                                        return res.errorEnd('该团人数已满', 200);
                                    }
                                    var group_num_new = that.floatAdd(Number(group_num),1);
                                    add_data.top_id = body.top_id;
                                    if( group_num_new >= row_group[0].group_product_quantity ){
                                        // 拼团完成
                                        db.query( "INSERT INTO `db_fight_groups_user` SET ?" , add_data , function( err, result1 , fields ){
                                            if( err ){
                                                db.rollback();
                                                db.release();// 释放资源
                                                conn.end(); // 结束当前数据库链接
                                                return res.errorEnd('没有找到可用数据', 200);
                                            }
                                            // 用户参加成功以后修改 活动表的参与人数
                                            db.query( "UPDATE `db_fight_groups` SET user_cj=? where id=?" , [ _user_cj ,body.fight_groups_id] , function( err, result , fields ){
                                                var total = result.changedRows ; // 受影响的数据条数, ( 已删除的数据条数 )
                                                if( err ){
                                                    db.rollback();
                                                    db.release();// 释放资源
                                                    conn.end(); // 结束当前数据库链接
                                                    return res.errorEnd('更新数据失败!!', 200);
                                                }
                                                var  new_id  =  result1.insertId;// 新创建user表数据的id
                                                db.query( "UPDATE `db_order` SET  activity_user_id=? where id=?",[new_id,add_data.order_id] , function( err, result , fields ){
                                                    var total = result.changedRows ; // 受影响的数据条数, ( 已删除的数据条数 )
                                                    if( err ){
                                                        db.rollback();
                                                        db.release();// 释放资源
                                                        conn.end(); // 结束当前数据库链接
                                                        return res.errorEnd('更新数据失败!!', 200);
                                                    }
                                                    // 找出该组的所有订单号码
                                                    db.query("select order_id  from `db_fight_groups_user` where  top_id=? or id=?",[row_user[0].id,row_user[0].id], function(err, row_order, fields) {
                                                        // 数据获取失败
                                                        if ( err ) {
                                                            db.rollback();
                                                            db.release();// 释放资源
                                                            conn.end(); // 结束当前数据库链接
                                                            return res.errorEnd('没有找到可用数据', 200);
                                                        }
                                                        var len = row_order.length;
                                                        var creat_arr = [];
                                                        if( len > 0){
                                                            row_order.forEach(function(value,index){
                                                                creat_arr[index] = value.order_id;
                                                            });
                                                        }else{
                                                            db.rollback();
                                                            db.release();// 释放资源
                                                            conn.end(); // 结束当前数据库链接
                                                            return res.errorEnd('更新数据失败!!', 200);
                                                        }
                                                        // 修改
                                                        db.query( "UPDATE `db_order` SET  special_type=0  where id in (?)",[creat_arr] , function( err, result , fields ){
                                                            var total6 = result.changedRows ; // 受影响的数据条数, ( 已删除的数据条数 )
                                                            if( err ){
                                                                db.rollback();
                                                                db.release();// 释放资源
                                                                conn.end(); // 结束当前数据库链接
                                                                return res.errorEnd('更新数据失败!!', 200);
                                                            }
                                                            // 修改团长的group_status为1拼团成功
                                                            db.query( "UPDATE `db_fight_groups_user` SET  group_status=1  where order_id in (?) ",[creat_arr] , function( err, result , fields ){
                                                                var total = result.changedRows ; // 受影响的数据条数, ( 已删除的数据条数 )
                                                                if( err ){
                                                                    db.rollback();
                                                                    db.release();// 释放资源
                                                                    conn.end(); // 结束当前数据库链接
                                                                    return res.errorEnd('更新数据失败!!', 200);
                                                                }
                                                                db.commit();
                                                                db.rollback();
                                                                db.release();// 释放资源
                                                                conn.end(); // 结束当前数据库链接
                                                                return res.successEnd( "创建数据成功完成" + total6 );
                                                            });
                                                        });
                                                    });
                                                });
                                            });
                                        });
                                    }else{
                                        // 拼团未完成
                                        db.query( "INSERT INTO `db_fight_groups_user` SET ?" , add_data , function( err, result1 , fields ){
                                            if( err ){
                                                db.rollback();
                                                db.release();// 释放资源
                                                conn.end(); // 结束当前数据库链接
                                                return res.errorEnd('没有找到可用数据1', 200);
                                            }
                                            // 用户参加成功以后修改 活动表的参与人数
                                            db.query( "UPDATE `db_fight_groups` SET user_cj=? where id=?" , [ _user_cj ,body.fight_groups_id] , function( err, result , fields ){
                                                var total = result.changedRows ; // 受影响的数据条数, ( 已删除的数据条数 )
                                                if( err ){
                                                    db.rollback();
                                                    db.release();// 释放资源
                                                    conn.end(); // 结束当前数据库链接
                                                    return res.errorEnd('更新数据失败!!', 200);
                                                }
                                                var  new_id  =  result1.insertId;// 新创建user表数据的id
                                                db.query( "UPDATE `db_order` SET  activity_user_id=? where id=?",[new_id,add_data.order_id] , function( err, result , fields ){
                                                    var total = result.changedRows ; // 受影响的数据条数, ( 已删除的数据条数 )
                                                    if( err ){
                                                        db.rollback();
                                                        db.release();// 释放资源
                                                        conn.end(); // 结束当前数据库链接
                                                        return res.errorEnd('更新数据失败!!', 200);
                                                    }
                                                    db.commit();
                                                    db.rollback();
                                                    db.release();// 释放资源
                                                    conn.end(); // 结束当前数据库链接
                                                    return res.successEnd( "创建数据成功未完成" + result1.insertId );
                                                });
                                            });
                                        });
                                    }
                                });
                            });
                        }else{
                            // 添加团长
                            add_data.is_header = 1;
                            add_data.group_status = 0;
                            add_data.top_id = 0;
                            db.query( "INSERT INTO `db_fight_groups_user` SET ?" , add_data , function( err, result1 , fields ){
                                if( err ){
                                    db.rollback();
                                    db.release();// 释放资源
                                    conn.end(); // 结束当前数据库链接
                                    return res.errorEnd(add_data, 200);
                                }
                                db.query( "UPDATE `db_fight_groups` SET user_cj=? where id=?" , [ _user_cj ,body.fight_groups_id] , function( err, result , fields ){
                                    var total = result.changedRows ; // 受影响的数据条数, ( 已删除的数据条数 )
                                    if( err ){
                                        db.rollback();
                                        db.release();// 释放资源
                                        conn.end(); // 结束当前数据库链接
                                        return res.errorEnd('更新数据失败!!', 200);
                                    }
                                    var  new_id  =  result1.insertId;// 新创建user表数据的id
                                    db.query( "UPDATE `db_order` SET  activity_user_id=? where id=?",[new_id,add_data.order_id] , function( err, result , fields ){
                                        var total = result.changedRows ; // 受影响的数据条数, ( 已删除的数据条数 )
                                        if( err ){
                                            db.rollback();
                                            db.release();// 释放资源
                                            conn.end(); // 结束当前数据库链接
                                            return res.errorEnd('更新数据失败!!', 200);
                                        }
                                        db.commit();
                                        db.rollback();
                                        db.release();// 释放资源
                                        conn.end(); // 结束当前数据库链接
                                        return res.successEnd( "创建数据团长成功" + result1.insertId );
                                    });
                                });
                            })
                        }
                    });
                });
            });
        });
    });
}