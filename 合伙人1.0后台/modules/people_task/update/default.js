/**
 * Created by Administrator on 2017/8/9.
 * 签到任务 修改
 * task_type 不存在时 为修改普通签到数据
 * task_type 为1的时候 为签到成功 并且查看上一天是否签到成功，如果成功则连续签到，不成功则从新开始
 */
const moment = require('moment'); // 时间处理插件
'use strict';
exports.ready = (req, res, that) => {

    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query; // 当前请求传递过来的 GET 数据,
    const body = req.body; // 当前请求传递过来的 POST 数据

    if(  that.isEmpty(req.session.user_token) ){
        return res.errorEnd('当前请求不存在 Token 或 Token 不可用', 300);
    }
    var user = req.session.user_rows;
    that.connect((err, db, conn) => {
        // 生成随机的单号
        // 更新数据
        //  已经完成签到则修改 签到状态 和时间，找出上一天是否签到成功 成功则连续签到，不成功 则从新开始计算
        if( that.isEmpty(body.user_id)  ){
            db.release();// 释放资源
            conn.end(); // 结束当前数据库链接
            return res.errorEnd('条件不能为空', 200);
        }
        var now_time = moment( moment().format('YYYY-MM-DD ') ).format('X');
        var new_time = moment().format('YYYY-MM-DD HH:mm:ss');// 现在的详细时间
        var  month = moment().format('M');
        var  year = moment().format('YYYY');
        var  day = new Date(year,month,0);
        var  daycount = day.getDate();// 本月的天数
        var  _this_day = moment().format("DD");// 今天的日期
        if( body['task_type'] == 1 ){ // 以task_type 的值为判断依据
            var old_time = now_time - 86400;
            var select_arr = [body['manager_id'],body['user_id'],old_time,1];// 查询条件
            // 找出上一天的 签到数据
            db.query("select * from `db_people_task` where manager_id=? and user_id=? and addtime=? and task_type=?;", select_arr, function(err, row, fields) {
                // 数据获取失败
                if (err) {
                    db.release();// 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd('没有找到可用数据', 200);
                }
                // 没找到则连续完成任务为1
                if( row.length == 0 ){
                    var task_count = 1;
                }else{
                    var task_count = row[0].taskcount + 1;
                }
                var d = new Date();
                var str = d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate()+" "+d.getHours()+":"+d.getMinutes()+":"+d.getSeconds();
                var update = {"task_type":1,"taskcount":task_count,"create_date":str};
                // 达到对应升级条件
                var grade_arr = {"user_level":0};
                if( user.user_level == 1 && task_count == 10 ){
                    //升到2级
                    grade_arr = {"user_level":2}
                }
                if( user.user_level == 2 && task_count == 25 ){
                    //升到3级
                    grade_arr = {"user_level":3}
                }
                if( user.user_level == 3 && task_count == 40 ){
                    //升到4级
                    grade_arr = {"user_level":4}
                }
                if( user.user_level == 4 && task_count == 60 ){
                    //升到5级
                    grade_arr = {"user_level":5}
                }
                if( user.user_level == 5 && task_count == 85 ){
                    //升到6级
                    grade_arr = {"user_level":6}
                }
                if( user.user_level == 6 && task_count == 120 ){
                    //升到7级
                    grade_arr = {"user_level":7}
                }
                if( user.user_level == 7 && task_count == 180 ){
                    //升到8级
                    grade_arr = {"user_level":8}
                }
                if( user.user_level == 8 && task_count == 250 ){
                    //升到9级
                    grade_arr = {"user_level":9}
                }
                if( user.user_level == 9 && task_count == 300 ){
                    //升到10级
                    grade_arr = {"user_level":10}
                }

                // 完成任务修改签到成功task_type=1
                db.query( "UPDATE `db_people_task` SET ? where id=?" , [update,body['id']], function( err, result , fields ){
                    var total = result.changedRows ; // 受影响的数据条数, ( 已删除的数据条数 )
                    if( err ){
                        db.release();// 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd('更新数据失败!!', 200);
                    }
                    if( !total ){
                        db.release(); // 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd('没有找到可操作的数据!!', 200);
                    }
                    // 查看老板资金
                    db.query("select id,amount from `db_manager` where id=? ",[user.manager_id], function(err, row_boss, fields) {
                        // 数据获取失败
                        if (err) {
                            db.rollback();
                            db.release();// 释放资源
                            conn.end(); // 结束当前数据库链接
                            return res.errorEnd('没有找到可用数据', 200);
                        }
                        // 与规则表里面的规则进行对比看是否要给佣金finish_day_task_time,finish_day_month_time
                        db.query("select * from `db_people_day_rule` where  manager_id=?", [user.manager_id], function (err, row_rule, fields) {
                            // 数据获取失败
                            if (err) {
                                db.rollback();
                                db.release();// 释放资源
                                conn.end(); // 结束当前数据库链接
                                return res.errorEnd('没有找到可用数据', 200);
                            }
                            var _money = row_rule[0].finish_day_task_time;
                            var month_money = row_rule[0].finish_day_month_time;
                            var _amount = row_boss[0].amount;
                            if( _amount > 0 && _money > 0 && _amount >= _money ){
                                // 用户完成每日任务收益
                                var income_creat = {
                                    "openid":user.openid,
                                    "manager_id":user.manager_id,
                                    "shopowner_id":user.shopowner_id,
                                    "clerk_id":user.clerk_id,
                                    "prolocutor_id":user.prolocutor_id,
                                    "spokesman_id":user.id,
                                    "MONEY":_money,
                                    "types":"完成每日任务收益",
                                    "create_days":new_time,
                                    "create_date":new_time,
                                    "type":10
                                }
                                if( daycount == _this_day && task_count >= daycount ){
                                    income_creat.type = 11;
                                    income_creat.MONEY = month_money;
                                    income_creat.types = "用户完成一个月任务收益";
                                }
                                // 用户收益记录
                                db.query( "INSERT INTO `db_manager_income` SET ?" , income_creat , function( err, result , fields ){
                                    if( err ){
                                        db.rollback();
                                        db.release();// 释放资源
                                        conn.end(); // 结束当前数据库链接
                                        return res.errorEnd('创建数据失败2!!', 200);
                                    }

                                    if( daycount == _this_day && task_count >= daycount ){
                                        income_creat.type = 9;
                                        income_creat.MONEY = month_money;
                                        income_creat.types = "用户完成一个月任务奖励支出";
                                    }else{
                                        income_creat.type = 8;
                                        income_creat.types = "用户完成每日任务奖励支出";
                                    }
                                    // 老板支出记录
                                    db.query( "INSERT INTO `db_manager_enchashment` SET ?" , income_creat , function( err, result , fields ){
                                        if( err ){
                                            db.rollback();
                                            db.release();// 释放资源
                                            conn.end(); // 结束当前数据库链接
                                            return res.errorEnd('创建数据失败2!!', 200);
                                        }
                                        //  如果达到升级条件则修改用户表的 等级
                                        if( grade_arr.user_level > 0 ){
                                            db.query( "UPDATE `db_people` SET user_level=? where id=? " , [ grade_arr.user_level ,user.id] , function( err, result , fields ){
                                                var total = result.changedRows ; // 受影响的数据条数, ( 已删除的数据条数 )
                                                if( err ){
                                                    db.release();// 释放资源
                                                    conn.end(); // 结束当前数据库链接
                                                    return res.errorEnd('更新数据失败!!', 200);
                                                }
                                                if( !total ){
                                                    db.release(); // 释放资源
                                                    conn.end(); // 结束当前数据库链接
                                                    return res.errorEnd('没有找到可操作的数据!!', 200);
                                                }
                                                db.release(); // 释放资源
                                                conn.end(); // 结束当前数据库链接
                                                return res.successEnd( '成功更新数据J : '+ total );
                                            });
                                        }else{
                                            db.release(); // 释放资源
                                            conn.end(); // 结束当前数据库链接
                                            return res.successEnd(  '成功更新数据123 : '+ total  );
                                        }
                                    });
                                });
                            }else{
                                //  如果达到升级条件则修改用户表的 等级
                                if( grade_arr.user_level > 0 ){
                                    db.query( "UPDATE `db_people` SET user_level=? where id=? " , [ grade_arr.user_level ,user.id] , function( err, result , fields ){
                                        var total = result.changedRows ; // 受影响的数据条数, ( 已删除的数据条数 )
                                        if( err ){
                                            db.release();// 释放资源
                                            conn.end(); // 结束当前数据库链接
                                            return res.errorEnd('更新数据失败!!', 200);
                                        }
                                        if( !total ){
                                            db.release(); // 释放资源
                                            conn.end(); // 结束当前数据库链接
                                            return res.errorEnd('没有找到可操作的数据!!', 200);
                                        }
                                        db.release(); // 释放资源
                                        conn.end(); // 结束当前数据库链接
                                        return res.successEnd( '成功更新数据 : '+ total );
                                    });
                                }else{
                                    db.release(); // 释放资源
                                    conn.end(); // 结束当前数据库链接
                                    return res.successEnd(  '成功更新数据222 : '+ total  );
                                }
                            }
                        });
                    });
                });
            });
        }else{
            // 签到任务进行中 修改任务的次数
            db.query( "UPDATE `db_people_task` SET ? where addtime=? and user_id=?" , [body,now_time,body.user_id], function( err, result , fields ){
                var total = result.changedRows ; // 受影响的数据条数, ( 已删除的数据条数 )
                if( err ){
                    db.release();// 释放资源
                    return res.errorEnd('更新数据失败!!', 200);
                }
                if( !total ){
                    db.release(); // 释放资源
                    return res.errorEnd('没有找到可操作的数据!!1', 200);
                }
                db.release(); // 释放资源
                conn.end(); // 结束当前数据库链接
                return res.successEnd( '成功更新数据 : '+ total  );
            });
        }
    });
}