/**
 * Created by Administrator on 2017/8/9.
 * 获取用户的签到数据 创建
 */
'use strict';
exports.ready = (req, res, that) => {
    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query; // 当前请求传递过来的 GET 数据,
    const body = req.body; // 当前请求传递过来的 POST 数据
    if(that.isEmpty(req.session.user_token)){
        return res.errorEnd('当前请求不存在 Token 或 Token 不可用', 300);
    }
    var user = req.session.user_rows;
    that.connect(( err , db , conn ) => {
        // 获取老板的单条数据
        db.query("select count(id) as num from  db_people_task  where openid=? and user_id=?",[user.openid,user.id], function(err, row1, fields) {
            // 数据获取失败
            if (err) {
                db.release();// 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd('没有找到可用老板规则数据', 200);
            }
            var _totalrecord = row1[0].num; //总共有多少条数据
            var _totalpage  = Math.ceil(Number(row1[0].num)/Number(body.pagesize)); // 总共有多少页
            var _pagesize    = Number(body.pagesize); // 每页有多少数据
            var _currentpage = Number(body.currentpage); // 当前页
            var sql = "select a.*,b.forwardcount,b.sharecount,b.developcount,b.completecount,c.prolocutor_time from  db_people_task a left JOIN   db_people_day_rule b on a.manager_id=b.manager_id left join db_people c on a.user_id=c.id  where a.openid=? and a.user_id=? and a.addtime >= unix_timestamp(FROM_UNIXTIME(c.prolocutor_time,'%Y-%m-%d')) order by addtime desc limit "+ _currentpage + "," + _pagesize;
            db.query(sql,[user.openid,user.id], function(err, row_rule, fields) {
                // 数据获取失败
                if (err) {
                    db.release();// 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd('没有找到可用数据', 200);
                }
                // 这个打印, 只会出现在主程序的控制台中
                db.release(); // 释放资源
                conn.end(); // 结束当前数据库链接
                var back = {"totalrecord":_totalrecord,"totalpage":_totalpage,"pagesize":_pagesize,"currentpage":_currentpage}
                back.list = row_rule;
                return res.successEnd(back);
            })
        })
    });
}
