/**
 * Created by Administrator on 2017/10/23.
 * 拼团单条活动获取 对应的发起者获取  当前打开用户获取
 */
const moment = require('moment');
'use strict';
exports.ready = (req, res, that) => {

    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query; // 当前请求传递过来的 GET 数据,
    const body = req.body; // 当前请求传递过来的 POST 数据
    //查询数据 老板id不能为空 select  a.*,b.num  from  db_fight_groups_user a,(select top_id,count(top_id) as num from db_fight_groups_user group by top_id)b where  a.id = b.top_id  and fight_groups_id=? and a.boss_id=? and a.shopowner_id=?
    if(that.isEmpty(req.session.user_token)){
        return res.errorEnd('当前请求不存在 Token 或 Token 不可用', 300);
    }
    var user = req.session.user_rows;

    that.connect(( err , db , conn ) => {
        var nowdate = moment().format('X');
        if( that.isEmpty(body.id) ){
            // 获取老板的全部数据
            db.query("select * from `db_fight_groups` where boss_id=?",[user.manager_id], function(err, row, fields) {
                // 数据获取失败
                if (err) {
                    db.rollback();
                    db.release();// 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd('没有找到可用数据groups', 200);
                }
                // 这个打印, 只会出现在主程序的控制台中
                db.rollback();
                db.release();// 释放资源
                conn.end(); // 结束当前数据库链接
                return res.successEnd(row);
            })
        }else{
            // 找出拼团活动的活动数据  和 发起拼团的人以及该团的人数
            db.query("select * from `db_fight_groups` where id=?",[body.id], function(err, row_group, fields) {
                if (err) {
                    db.rollback();
                    db.release();// 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd('没有找到可用数据groups', 200);
                }
                db.query("select * from `db_activity_shopowner_relation` where activity_id=? and boss_id=? and shopowner_id=? and activity_type=4",[body.id,user.manager_id,user.shopowner_id], function(err, row1, fields) {
                    // 数据获取失败
                    if (err) {
                        db.release(); // 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd('没有找到可用数据', 200);
                    }
                    if( row1.length == 0 && user.is_manager == 0 ){
                        db.release(); // 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd("meifan", 600);
                    }else{
                        db.query("select count(id) as num from `db_fight_groups_user` where fight_groups_id=? and group_status=1",[body.id], function(err, row_c, fields) {
                            if (err) {
                                db.rollback();
                                db.release();// 释放资源
                                conn.end(); // 结束当前数据库链接
                                return res.errorEnd('没有找到可用数据1', 200);
                            }
                            // 当前活动发起拼团的人
                            db.query("select * ,(select count(1) from db_fight_groups_user where top_id = a.id ) num from db_fight_groups_user a  where a.top_id =0 AND a.fight_groups_id=? and a.boss_id=?  and a.group_status=0 and  user_end_time > ? order by id desc limit 0,5",[body.id,user.manager_id,user.shopowner_id,nowdate], function(err, row_user, fields) {
                                if (err) {
                                    db.rollback();
                                    db.release();// 释放资源
                                    conn.end(); // 结束当前数据库链接
                                    return res.errorEnd('没有找到可用数据2', 200);
                                }
                                // 点开活动用户的拼团信息
                                db.query("select * from `db_fight_groups_user` where  fight_groups_id=? and boss_id=? and shopowner_id=? and openid=?",[body.id,user.manager_id,user.shopowner_id,user.openid], function(err, row_this, fields) {
                                    if (err) {
                                        db.rollback();
                                        db.release();// 释放资源
                                        conn.end(); // 结束当前数据库链接
                                        return res.errorEnd('没有找到可用数据3', 200);
                                    }
                                    if( row_this.length > 0  ){
                                        row_group[0].userall = row_c[0].num;
                                        var group = {
                                            "group_data":row_group,
                                            "group_user":row_user,
                                            "group_this":row_this
                                        }
                                        // 这个打印, 只会出现在主程序的控制台中
                                        db.rollback();
                                        db.release();// 释放资源
                                        conn.end(); // 结束当前数据库链接
                                        return res.successEnd(group);
                                    }else{
                                        // 获取
                                        db.query("select * from `db_fight_groups_frist_user` where  fight_groups_id=? and boss_id=? and shopowner_id=? and openid=?",[body.id,user.manager_id,user.shopowner_id,user.openid], function(err, row_first, fields) {
                                            if (err) {
                                                db.rollback();
                                                db.release();// 释放资源
                                                conn.end(); // 结束当前数据库链接
                                                return res.errorEnd('没有找到可用数据4', 200);
                                            }
                                            row_group[0].userall = row_c[0].num;
                                            var group = {
                                                "group_data":row_group,
                                                "group_user":row_user,
                                                "group_this":row_first
                                            }
                                            // 这个打印, 只会出现在主程序的控制台中
                                            db.rollback();
                                            db.release();// 释放资源
                                            conn.end(); // 结束当前数据库链接
                                            return res.successEnd(group);
                                        });
                                    }
                                });
                            });
                        });
                    }
                });
            });
        }
    });
}
