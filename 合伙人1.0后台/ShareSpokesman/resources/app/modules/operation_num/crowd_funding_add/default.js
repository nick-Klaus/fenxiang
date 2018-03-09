/**
 * Created by Administrator on 2017/8/16.
 * 分享 转发次数 收益 增加
 */
const moment = require('moment'); // 时间处理插件
'use strict';
exports.ready = (req, res, that) => {

    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query; // 当前请求传递过来的 GET 数据,
    const body = req.body; // 当前请求传递过来的 POST 数据
    that.connect((err, db, conn) => {
        // 查询数据
        if (that.isEmpty(body.user_id) || that.isEmpty(body.boss_id)) {
            db.release();// 释放资源
            conn.end(); // 结束当前数据库链接
            return res.errorEnd('管理员id不能为空', 200);
        }
        var currentdate = moment().format('YYYY-MM-DD');
        var nowdate = moment( currentdate ).format('X');
        // // 活动 日志添加
        db.query("select * from `db_activity_log` where user_id=? and boss_id=?", [body.user_id, body.boss_id], function (err, row1, fields) {
            // 数据获取失败
            if (err || row1.length == 0) {
                db.release();// 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd('没有找到可用数据1', 200);
            }
            var _share = Number(row1[0].share_new) + Number(body.share); // 今日分享次数
            var _share_month = Number(row1[0].share_month) + Number(body.share);// 月分享次数
            var _share_all = Number(row1[0].share_all) + Number(body.share);// 总的分享次数
            var _forward = Number(row1[0].forward_new) + Number(body.forward);// 今日转发次数
            var _forward_month = Number(row1[0].forward_month) + Number(body.forward);// 月转发次数
            var _forward_all = Number(row1[0].forward_all) + Number(body.forward);// 总的转发次数

            var _see = Number(row1[0].see_new) + Number(body.see);// 今日转发次数
            var _see_month = Number(row1[0].see_month) + Number(body.see);// 月转发次数
            var _see_all = Number(row1[0].see_all) + Number(body.see);// 总的转发次数
            // 更新数据
            var date = new Date();
            var currentdate = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
            var activity_log = {
                "see_new": _see,
                "see_month":_see_month,
                "see_all": _see_all,
                "share_new": _share,
                "share_month":_share_month,
                "share_all": _share_all,
                "forward_new": _forward,
                "forward_month": _forward_month,
                "forward_all": _forward_all,
                "forward_time": currentdate,
                "share_time": currentdate,
                "see_time": currentdate
            }
            db.query("UPDATE `db_activity_log` SET ? where id=?", [activity_log, row1[0].id], function (err, result, fields) {
                var total = result.changedRows; // 受影响的数据条数, ( 已删除的数据条数 )
                if (err) {
                    db.release();// 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd('更新数据失败!!', 200);
                }
                if (!total) {
                    db.release();// 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd('没有找到可操作的数据1!!', 200);
                }
                db.query("select * from `db_crowd_funding` where id=?", [body.crowd_funding_id], function (err, row2, fields) {

                    // 数据获取失败
                    if (err || row2.length == 0) {
                        db.release();// 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd('没有找到可用数据2', 200);
                    }
                    var _share = Number(row2[0].user_fx) + Number(body.share);
                    var _forward = Number(row2[0].user_zf) + Number(body.forward);
                    var _see = Number(row2[0].user_ck) + Number(body.see);
                    // 更新数据
                    var crowd_funding_log = {"user_fx": _share, "user_zf": _forward,"user_ck":_see}
                    db.query("UPDATE `db_crowd_funding` SET ? where id=?", [crowd_funding_log, row2[0].id], function (err, result, fields) {
                        var total = result.changedRows; // 受影响的数据条数, ( 已删除的数据条数 )
                        if (err) {
                            db.release();// 释放资源
                            conn.end(); // 结束当前数据库链接
                            return res.errorEnd('更新数据失败!!', 200);
                        }
                        if (!total) {
                            db.release();// 释放资源
                            conn.end(); // 结束当前数据库链接
                            return res.errorEnd('没有找到可操作的数据2!!', 200);
                        }
                        db.query("select * from `db_crowd_funding_user` where crowd_funding_id=? and user_id=?", [body.crowd_funding_id, body.user_id], function (err, row3, fields) {
                            // 数据获取失败
                            if (err) {
                                db.release();// 释放资源
                                conn.end(); // 结束当前数据库链接
                                return res.errorEnd('没有找到可用数据', 200);
                            }
                            var _share = Number(row3[0].user_fx) + Number(body.share);
                            var _forward = Number(row3[0].user_zf) + Number(body.forward);
                            var _see = Number(row3[0].user_ck) + Number(body.see);
                            // 更新数据
                            var crowd_funding_user = {"user_fx": _share, "user_zf": _forward,"user_ck":_see}
                            db.query("UPDATE `db_crowd_funding_user` SET ? where id=?", [crowd_funding_user, row3[0].id], function (err, result, fields) {
                                var total = result.changedRows; // 受影响的数据条数, ( 已删除的数据条数 )
                                if (err) {
                                    db.release();// 释放资源
                                    conn.end(); // 结束当前数据库链接
                                    return res.errorEnd('更新数据失败!!', 200);
                                }
                                if (!total) {
                                    db.release();// 释放资源
                                    conn.end(); // 结束当前数据库链接
                                    return res.errorEnd('没有找到可操作的数据3!!', 200);
                                }
                            });
                            //日常任务
                            db.query("select * from `db_people_task` where user_id=? and manager_id=? and addtime=?", [body.user_id, body.boss_id, nowdate], function (err, row4, fields) {
                                // 数据获取失败
                                if (err) {
                                    db.release();// 释放资源
                                    conn.end(); // 结束当前数据库链接
                                    return res.errorEnd('没有找到可用数据', 200);
                                }
                                if( row4.length == 0 ){
                                    db.release(); // 释放资源
                                    conn.end(); // 结束当前数据库链接
                                    return res.successEnd('今日没签到');
                                }else{
                                    var _share = Number(row4[0].share) + Number(body.share);
                                    var _forward = Number(row4[0].forward) + Number(body.forward);
                                    var _see_task = Number(row4[0].see) + Number(body.see);
                                    // 更新数据
                                    var crowd_funding_user = {"share": _share, "forward": _forward,"see":_see_task}
                                    db.query("UPDATE `db_people_task` SET ? where id=?", [crowd_funding_user, row4[0].id], function (err, result, fields) {
                                        var total = result.changedRows; // 受影响的数据条数, ( 已删除的数据条数 )
                                        if (err) {
                                            db.release();// 释放资源
                                            conn.end(); // 结束当前数据库链接
                                            return res.errorEnd('更新数据失败!!', 200);
                                        }
                                        if (!total) {
                                            db.release(); // 释放资源
                                            conn.end(); // 结束当前数据库链接
                                            return res.successEnd('签到没有点击 : ' + total);
                                        }
                                        db.release(); // 释放资源
                                        conn.end(); // 结束当前数据库链接
                                        return res.successEnd('成功更新数据12 : ' + total);
                                    });

                                }
                            })
                        })
                    });
                })
            });
        })
    });
}