/**
 * Created by Administrator on 2017/8/11.
 * 拼团活动用户临时存放的添加
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
    if(that.isEmpty(body.fight_groups_id)){
        return res.errorEnd("活动id不存在", 200);
    }
    // {
    //     "token": "0bdf5bacdae8f52bf8e53cdcfc169606",
    //     "fight_groups_id": "5",
    // }
    that.connect(( err , db , conn ) => {
        db.beginTransaction(function(err){
            // 事物创建失败
            if (err) {
                db.release(); // 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd('没有找到可用数据', 200);
            }
            // 判断该用户是否存在 数据
            db.query("select * from `db_fight_groups_frist_user` where fight_groups_id=? and user_id=?", [body.fight_groups_id, user.id], function (err, row_num, fields) {
                // 数据获取失败
                if (err) {
                    db.release();// 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd('没有找到可用数据', 200);
                }
                // 已经存在 则直接返回该条数据
                if( row_num.length == 0 ){
                    var currentdate = moment().format('YYYY-MM-DD HH:mm:ss');
                    var current_date = moment().format('X');
                    var _ip = req.ip.split(':')[3];
                    var create_data = {
                        "openid":user.openid,
                        "headimgurl":user.headimgurl,
                        "phone_number":user.mobile,
                        "username":user.nickname,
                        "fight_groups_id":body.fight_groups_id,
                        "ip":_ip || "",
                        "addtime":currentdate,
                        "boss_id":user.manager_id,
                        "shopowner_id":user.shopowner_id,
                        "salesman_id":user.clerk_id,
                        "agent_id":user.prolocutor_id,
                        "user_id":user.id,
                    }
                    // 插入数据
                    db.query( "INSERT INTO `db_fight_groups_frist_user` SET ?" , create_data , function( err, result , fields ){
                        if( err ){
                            // 数据插入失败, 回滚
                            db.rollback();
                            db.release();// 释放资源
                            conn.end(); // 结束当前数据库链接
                            return res.errorEnd('创建数据失败!!', 200);
                        }
                        db.commit();
                        db.release(); // 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.successEnd("创建数据成功" + result.insertId );
                    });
                }else{
                    db.commit();
                    db.release(); // 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.successEnd(row_num);
                }
            });
        });
    });
}