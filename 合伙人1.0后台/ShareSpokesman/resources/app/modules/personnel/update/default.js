
const moment = require('moment')// 时间处理模块
'use strict';
exports.ready = (req, res, that) => {

    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query; // 当前请求传递过来的 GET 数据,
    const body = req.body; // 当前请求传递过来的 POST 数据

    // 链接数据库
    // 链接 / 操作数据库
    // 有不懂, 看这个 http://blog.csdn.net/zxsrendong/article/details/17006185

    if(req.session.user_rows == null){
         return res.errorEnd('当前请求不存在 Token 或 Token 不可用', 300);
     }
    if(req.session.user_token != body.token){
         return res.errorEnd('当前请求不存在 Token 或 Token 不可用', 300);
    }
    var user = req.session.user_rows;
    that.connect((err, db,conn) => {
        //修改用户名
        if(body.update == 1){
            var data = {
                nickname : body.nickname,
            };
            db.query("select * from `db_people` where nickname = ? and manager_id = ?", [body.nickname,user.manager_id], function(err, row, fields) {
                // 数据获取失败
                if (err) {
                    db.release(); // 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd('没有找到可用数据', 200);
                }
                // 更新数据
                db.query( "UPDATE ?? SET ? WHERE id = ? " , [ 'db_people' , data ,user.id ] , function( err1, result1 , fields1 ){
                    if( err1 ){
                        db.release();// 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd('更新数据失败!!', 200);
                    }
                    db.release(); // 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.successEnd( '成功修改用户名 ' );
                });
            })

        }else if(body.update == 2){
            db.query("select * from `db_people` where mobile = ? and manager_id = ?", [body.phone,user.manager_id], function(err, row, fields) {
                // 数据获取失败
                if (err) {
                    db.release(); // 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd('没有找到可用数据', 200);
                }
                var a = /^1(3|4|5|7|8)\d{9}$/.test(body.phone);
                if(a == false ){
                    db.release(); // 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd('手机号码格式不正确', 200);
                }
                if(row.length > 0){
                    db.release(); // 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd('该手机号码已经被绑定', 600);
                }
       
                var data = {
                    mobile : body.phone
                };
                

                // 更新数据
                db.query( "UPDATE ?? SET  ? WHERE id = ? " , [ 'db_people' , data ,user.id ] , function( err1, result1 , fields1 ){
                    if( err1 ){
                        db.release(); // 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd('更新数据失败!!', 200);
                    }


                    db.release(); // 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.successEnd( '成功修改手机号码 ' );
                });
            })
        }else if(body.update == 3){
            var data = {
                headimgurl : body.headimgurl,
            };
            // 更新数据
            db.query( "UPDATE ?? SET ? WHERE id = ? " , [ 'db_people' , data ,user.id ] , function( err1, result1 , fields1 ){
                if( err1 ){
                    db.release(); // 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd('更新数据失败!!', 200);
                }

                db.release(); // 释放资源
                conn.end(); // 结束当前数据库链接
                return res.successEnd( '成功修改头像' );
            });
        }else if(body.update == 4){
            var data = {
                realname : body.realname,
            };
            db.query("select * from `db_people` where realname = ? and manager_id = ?", [body.realname,user.manager_id], function(err, row, fields) {
                // 数据获取失败
                if (err) {
                    db.release(); // 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd('没有找到可用数据', 200);
                }
                // 更新数据
                db.query( "UPDATE ?? SET ? WHERE id = ? " , [ 'db_people' , data ,user.id ] , function( err1, result1 , fields1 ){
                    if( err1 ){
                        db.release(); // 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd('更新数据失败!!', 200);
                    }

                    db.release(); // 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.successEnd( '成功修改用户名 ' );
                });
            })
        }else if(body.update == 5){
            var _ip = req.ip.split(':')[3];
            var data = {
                latitude : body.latitude,
                longitude : body.longitude
            };
            var dataTwo = {
                "openid": user.openid || "",
                "types": "登录授权",
                "operation_type": 5,
                "addtime": moment().format("YYYY-MM-DD"),
                "time": moment().format("X"),
                "user_id": user.id | 0,
                "boss_id": user.manager_id | 0,
                "activity_type": 0,
                "commission": "",
                "commission_type": 0,
                "commission_no": 0,
                "latitude": body.latitude,
                "longitude": body.longitude,
                "ip": _ip || 0,
                "activity_id": 0
            };
            // 更新数据
            db.query( "UPDATE ?? SET ? WHERE id = ? " , [ 'db_people' , data ,user.id ] , function( err1, result1 , fields1 ){
                if( err1 ){
                    db.release(); // 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd('更新数据失败!!', 200);
                }
                db.query( "INSERT INTO `db_activity_record` SET ?" , dataTwo , function( err, result , fields ){
                    if( err ){
                        db.release();// 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd('创建数据失败1!!', 200);
                    }
                    db.release(); // 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.successEnd("更新记录" );
                });
                db.release(); // 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.successEnd("更新记录" );
            });
        }

    });
}