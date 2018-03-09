/**
 * Created by Administrator on 2017/10/23.
 * 传单活动用户的创建
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
    if(that.isEmpty(body.leaflet_id)){
        return res.errorEnd('活动id不存在', 300);
    }
    that.connect(( err , db , conn ) => {
        db.beginTransaction(function(err){
            if (err) {
                db.rollback();
                db.release();// 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd('没有找到可用数据', 200);
            }
            var current_date = moment().format('X');
            var _ip = req.ip.split(':')[3];
            db.query("select * from `db_leaflet_user` where  leaflet_id=? and shopowner_id=? and user_id=?",[body.leaflet_id,user.shopowner_id,user.id], function(err, row, fields) {
                // 数据获取失败
                if (err) {
                    db.rollback();
                    db.release();// 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd('没有找到可用数据', 200);
                }
                if( row.length == 0  ){
                    // 插入数据
                    var  user_dat = {
                        "openid":user.openid,
                        "phone_number":user.mobile,
                        "username":user.nickname,
                        "leaflet_id":body.leaflet_id,
                        "ip": _ip || "",
                        "addtime":current_date,
                        "boss_id":user.manager_id,
                        "shopowner_id":user.shopowner_id,
                        "salesman_id":user.clerk_id,
                        "agent_id":user.prolocutor_id,
                        "user_id":user.id
                    }
                    db.query( "INSERT INTO `db_leaflet_user` SET ?" , user_dat , function( err, result , fields ){
                        if( err ){
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
                    return res.successEnd(row);
                }
            });
        });
    });
}