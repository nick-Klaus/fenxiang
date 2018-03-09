/**
 * Created by Administrator on 2017/8/11.
 * 获取当前活动的全部用户
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
        // 当前活动的所有用户
        db.query("select count(id) as num  from `db_bargain_user` where bargain_id=? ",[body.bargain_id], function(err, row1, fields) {
            // 数据获取失败
            if (err) {
                db.release(); // 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd('没有找到可用数据', 200);
            }
            var _totalrecord = row1[0].num; //总共有多少条数据
            var _totalpage  = Math.ceil(Number(row1[0].num)/Number(body.pagesize)); // 总共有多少页
            var _pagesize    = Number(body.pagesize); // 每页有多少数据
            var _currentpage = Number(body.currentpage); // 当前页
            var sql = "select username,new_price from `db_bargain_user` where bargain_id=? order by new_price asc,id desc limit "+ _currentpage + "," + _pagesize;
            db.query(sql,[body.bargain_id], function(err, row, fields) {
                // 数据获取失败
                if (err) {
                    db.release(); // 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd('没有找到可用数据', 200);
                }
                db.release(); // 释放资源
                conn.end(); // 结束当前数据库链接
                var back = {"totalrecord":_totalrecord,"totalpage":_totalpage,"pagesize":_pagesize,"currentpage":_currentpage}
                back.list = row;
                return res.successEnd(back);
            });
        });
    });
}
