/**
 * Created by Administrator on 2017/8/9.
 * 签到任务 创建
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
    //  点击打卡创建一条签到数据
    that.connect((err, db ,conn) => {
        db.beginTransaction(function(err){
            if (err || !body['user_id'] ) {
                return res.errorEnd('没有找到可用数据', 200);
            }
            // 今日的签到数据
            var _new_time = moment().format('YYYY-MM-DD ');
            var _time = moment( moment().format('YYYY-MM-DD HH:mm:ss') ).format('X');
            var now_time = moment( moment().format('YYYY-MM-DD') ).format('X');
            var select_arr = [body['manager_id'],body['user_id'],now_time];// 查询条件
            db.query("select * from `db_people_task` where manager_id=? and user_id=? and addtime=?",select_arr,function(err, row, fields) {
                // 数据获取失败
                if (err) {
                    return res.errorEnd('没有找到可用数据', 200);
                }
                // 上一天的签到数据
                var old_time = (Number(now_time) - 86400);
                var select_arr = [body['manager_id'],body['user_id'],old_time];// 查询条件
                db.query("select * from `db_people_task` where manager_id=? and user_id=? and addtime=?;", select_arr, function(err, row1, fields) {
                    // 数据获取失败
                    if (err) {
                        return res.errorEnd('没有找到可用数据', 200);
                    }
                    if( row1.length == 0 ){
                        body.sign_count =  1;
                    }else{
                        body.sign_count =  (Number( row1[0].sign_count)+1) || 0;
                    }
                    // 点击打卡后如果有签到数据则返回签到数据，如果没有则创建 签到规则全部为0
                    if ( row.length == 0  ) {
                        // 今日签到数据没有则 重新创建
                        body.addtime = now_time;
                        db.query( "INSERT INTO `db_people_task` SET ?" , body , function( err, result , fields ){
                            if( err ){
                                // 数据插入失败, 回滚
                                db.rollback();
                                db.release();// 释放资源
                                return res.errorEnd("", 200);
                            }
                            db.commit();
                            db.release(); // 释放资源
                            conn.end(); // 结束当前数据库链接
                            return res.successEnd({"sign_count":body.sign_count});
                        });
                    }else{
                        //  把this_type 为1 则已经点击签到
                        if( row[0].this_type ){
                            db.release(); // 释放资源
                            conn.end(); // 结束当前数据库链接
                            return res.successEnd( "今日已签到" );
                        }else{
                            // 点击签到的时候 把this_type 改为1 并把上一天的连续签到天数加1
                            var _upedate = {"this_type":1,"sign_count":body.sign_count}
                            db.query( "UPDATE `db_people_task` SET ? where id=? " , [ _upedate ,row[0].id] , function( err, result , fields ){
                                var total = result.changedRows ; // 受影响的数据条数, ( 已删除的数据条数 )
                                if( err ){
                                    db.release();// 释放资源
                                    return res.errorEnd('更新数据失败!!', 200);
                                }
                                if( !total ){
                                    db.release(); // 释放资源
                                    return res.errorEnd('没有找到可操作的数据!!', 200);
                                }
                                var  record_arr = {
                                    "openid": user.openid ,
                                    "types":"签到记录",
                                    "operation_type": 4,
                                    "addtime": _new_time,
                                    "time": _time,
                                    "user_id": user.id,
                                    "boss_id": user.manager_id,
                                    "activity_type": 0,
                                    "commission": "",
                                    "commission_type": "",
                                    "commission_no": "",
                                    "ip":  req.ip.split(':')[3],
                                    "activity_id": 0,
                                    "longitude":body.longitude,
                                    "latitude":body.latitude
                                }
                                db.query( "INSERT INTO `db_activity_record` SET ?" , record_arr , function( err, result , fields ){
                                    if( err ){
                                        db.rollback();
                                        db.release();// 释放资源
                                        conn.end(); // 结束当前数据库链接
                                        return res.errorEnd('创建数据失败1!!', 200);
                                    }
                                    db.commit();//有事物处理的时候一定要这个才能完成操作
                                    db.release(); // 释放资源
                                    conn.end(); // 结束当前数据库链接
                                    return res.successEnd( {"sign_count":body.sign_count});
                                });
                            });
                        }
                        //return res.errorEnd('今日签到已经创建', 200);
                    }
                })
            })
        });
    });
}