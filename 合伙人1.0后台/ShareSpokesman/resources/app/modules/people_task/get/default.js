/**
 * Created by Administrator on 2017/8/9.
 * 签到任务 获取
 */
const moment = require('moment'); // 时间处理插件
'use strict';
exports.ready = (req, res, that) => {

    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query; // 当前请求传递过来的 GET 数据,
    const body = req.body; // 当前请求传递过来的 POST 数据

    that.connect((err, db, conn) => {
        if (err || that.isEmpty(body.user_id)) {
            return res.errorEnd('没有找到可用数据', 200);
        }
        var now_time = moment(moment().format('YYYY-MM-DD')).format('X');
        var select_arr = [body['manager_id'], body['user_id'], now_time, body['manager_id']];// 查询条件
        db.query("select * from `db_people_task` where manager_id=? and user_id=? and addtime=?; select * from `db_people_day_rule` where manager_id=?", select_arr, function (err, row, fields) {
            // 数据获取失败

            if (err) {
                return res.errorEnd('没有找到可用数据', 200);
            }
            var people_task = row[0][0];// 签到详情
            var day_rule = row[1][0];// 签到规则
            var day_rule_forward = day_rule['forwardcount'];//转发次数规则
            var day_rule_share = day_rule['sharecount'];//分享次数规则
            var day_rule_develop = day_rule['developcount'];//发展代言人规则
            var day_rule_complete = day_rule['completecount'];//完成订单数规则
            var people_task_forward = people_task['forward'];//转发次数
            var people_task_share = people_task['share'];//分享次数
            var people_task_develop = people_task['develop_user'];//发展代言人
            var people_task_complete = people_task['complete_order'];//完成订单数
            var people_task_this_type = people_task['this_type'];//是否签到
            // 计算的时候 当天完成的任务 不能大于任务规则
            if (people_task_forward > day_rule_forward) {
                people_task_forward = day_rule_forward;
            }
            if (people_task_share > day_rule_share) {
                people_task_share = day_rule_share;
            }
            if (people_task_develop > day_rule_develop) {
                people_task_develop = day_rule_develop;
            }
            if (people_task_complete > day_rule_complete) {
                people_task_complete = day_rule_complete;
            }
            var _forward = people_task_forward - day_rule_forward;//转发次数
            var _share = people_task_share - day_rule_share;//分享次数
            var _develop = people_task_develop - day_rule_develop;//发展代言人
            var _complete = people_task_complete - day_rule_complete;//完成订单数
            var _this_type = people_task_this_type;//是否签到
            var rule_all = day_rule_forward + day_rule_share + day_rule_develop + day_rule_complete+1; //规则总数
            var task_all = people_task_forward + people_task_share + people_task_develop + people_task_complete+_this_type;//完成总数
            var percent = Math.round((task_all / rule_all) * 100);// 完成任务百分比
            // if (percent == 0 || percent <= 5) {
            //     percent = 6;
            // }

            var task_type = people_task.task_type;
            people_task._percent = percent;
            // 还没有点击签到
            if (people_task.this_type == 0) {
                // 今天没有签到数据则取前一天的 前一天没有数据则签到连续为1
                if( task_all == 0 ){ percent = 0 }
                var old_time = now_time - 86400;
                var select_arr = [body['manager_id'], body['user_id'], old_time];// 查询条件
                db.query("select * from `db_people_task` where manager_id=? and user_id=? and addtime=?;", select_arr, function (err, row1, fields) {
                    // 数据获取失败
                    if (err) {
                        return res.errorEnd('没有找到可用数据', 200);
                    }
                    db.release(); // 释放资源
                    conn.end(); // 结束当前数据库链接
                    if (row1.length > 0) {
                        var _sign_count = row1[0].sign_count;
                    } else {
                        var _sign_count = 0;
                    }
                    return res.successEnd({
                        "state": "empty",
                        "sign_count": _sign_count,
                        "complete_order": people_task['complete_order'],
                        "develop_user": people_task['develop_user'],
                        "share": people_task['share'],
                        "forward": people_task['forward'],
                        "_percent": percent,
                        "task_rule": row[1]
                    }); //没有签到数据,去调用添加接口
                })
            } else {


                //  满足了签到条件后修改 task_type 为1
                if (task_type == 1) {
                    db.release(); // 释放资源
                    conn.end(); // 结束当前数据库链接
                    people_task.task_rule = row[1];
                    return res.successEnd(people_task); // task_type 为1 签到已经完成 返回整条数据
                } else {
                    db.release(); // 释放资源
                    conn.end(); // 结束当前数据库链接
                    if (_forward >= 0 && _share >= 0 && _develop >= 0 && _complete >= 0 && task_type <= 0) {
                        return res.successEnd({
                            "state": "success",
                            "this_type": people_task.this_type,
                            "_percent": percent,
                            "id": people_task.id,
                            "task_rule": row[1]
                        }); // 签到任务已经完成 需要去修改 task_type 为1
                    } else {
                        // 返回剩余需要完成的任务
                        return res.successEnd({
                            "id": people_task.id,
                            "taskcount": people_task.taskcount,
                            "sign_count": people_task.sign_count,
                            "complete_order": people_task['complete_order'],
                            "develop_user": people_task['develop_user'],
                            "share": people_task['share'],
                            "forward": people_task['forward'],
                            "_percent": percent,
                            "task_rule": row[1]
                        });
                    }
                }
            }
        })
    });
}