/**
 * Created by Administrator on 2017/8/16.
 * 所有活动的获取 视图
 */
const moment = require('moment'); // 时间处理插件
'use strict';
exports.ready = (req, res, that) => {

    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query; // 当前请求传递过来的 GET 数据,
    const body = req.body; // 当前请求传递过来的 POST 数据
    // 查询数据
    if(that.isEmpty(req.session.user_token)){
        return res.errorEnd('当前请求不存在 Token 或 Token 不可用', 300);
    }
    var user = req.session.user_rows;
    that.connect(( err , db , conn ) => {
        var new_time = moment().format('X');
        var end_time;
        var _status = body.status;
        if( _status == 1 ){
            end_time = ' and  end_time > now() '
        }else if( _status == 2 ){
            end_time = ' and  end_time < now() '
        }else{
            end_time = " and status="+_status;
        }
        // 活动类型 不存在
        if( Number(body.activity_type) === 0 ){
            var sql_f = "SELECT count(id) as num FROM `activity_all_new` WHERE  boss_id=? and (to_shopowner_id=? or action_area=1) "+end_time;
            db.query(sql_f,[user.manager_id,user.shopowner_id], function(err, row1, fields) {
                // 数据获取失败
                if (err) {
                    db.release(); // 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd("没有找到可用数据2", 200);
                }
                var _totalrecord = row1[0].num; //总共有多少条数据
                var _totalpage  = Math.ceil(Number(row1[0].num)/Number(body.pagesize)); // 总共有多少页
                var _pagesize    = Number(body.pagesize); // 每页有多少数据
                var _currentpage = Number(body.currentpage); // 当前页
                var sql = "SELECT * FROM `activity_all_new` WHERE  boss_id=? and (to_shopowner_id=? or action_area=1) "+ end_time +"  order by addtime desc limit "+ _currentpage + "," + _pagesize;
                db.query(sql,[user.manager_id,user.shopowner_id], function(err, row, fields) {
                    // 数据获取失败
                    if (err) {
                        db.release(); // 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd("没有找到可用数据2", 200);
                    }
                    var back = {"totalrecord":_totalrecord,"totalpage":_totalpage,"pagesize":_pagesize,"currentpage":_currentpage}
                    back.list = row;
                    db.release(); // 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.successEnd(back);
                })
            })
        }else{
            var sql_t = "SELECT count(id) as num FROM `activity_all_new` WHERE  boss_id=? and (to_shopowner_id=? or action_area=1) "+ end_time +" and activity_type=? ";
            db.query(sql_t,[user.manager_id,user.shopowner_id,body.activity_type], function(err, row1, fields) {
                // 数据获取失败
                if (err) {
                    db.release(); // 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd("没有找到可用数据2", 200);
                }
                var _totalrecord = row1[0].num; //总共有多少条数据
                var _totalpage  = Math.ceil(Number(row1[0].num)/Number(body.pagesize)); // 总共有多少页
                var _pagesize    = Number(body.pagesize); // 每页有多少数据
                var _currentpage = Number(body.currentpage); // 当前页
                var sql = "SELECT * FROM `activity_all_new` WHERE  boss_id=? and (to_shopowner_id=? or action_area=1) "+ end_time +" and activity_type=? order by addtime desc limit "+ _currentpage + "," + _pagesize;
                db.query(sql,[user.manager_id,user.shopowner_id,body.activity_type], function(err, row, fields) {
                    // 数据获取失败
                    if (err) {
                        db.release(); // 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd("没有找到可用数据2", 200);
                    }
                    var back = {"totalrecord":_totalrecord,"totalpage":_totalpage,"pagesize":_pagesize,"currentpage":_currentpage}
                    back.list = row;
                    db.release(); // 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.successEnd(back);
                })
            })
        }
    });
}
