/**
 * Created by Administrator on 2017/8/16.
 * 老板获取所有活动的获取 视图
 */
'use strict';
exports.ready = (req, res, that) => {

    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query; // 当前请求传递过来的 GET 数据,
    const body = req.body; // 当前请求传递过来的 POST 数据
    that.connect(( err , db , conn ) => {
        // 查询数据
        if(  that.isEmpty(body.boss_id) ){
            db.release();// 释放资源
            conn.end(); // 结束当前数据库链接
            return res.errorEnd('条件不能为空', 200);
        }
        // 活动类型 不存在
        db.query("SELECT count(id) as num  FROM `activity_all` WHERE  boss_id=? and status=? ",[body.boss_id,body.status], function(err, row1, fields) {
            // 数据获取失败
            if (err) {
                db.release();// 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd("没有找到可用数据2", 200);
            }
            var _totalrecord = row1[0].num; //总共有多少条数据
            var _totalpage  = Math.ceil(Number(row1[0].num)/Number(body.pagesize)); // 总共有多少页
            var _pagesize    = Number(body.pagesize); // 每页有多少数据
            var _currentpage = Number(body.currentpage); // 当前页
            var sql = "SELECT * FROM `activity_all` WHERE  boss_id=? and status=?  order by addtime desc limit "+ _currentpage + "," + _pagesize;
            db.query(sql,[body.boss_id,body.status], function(err, row, fields) {
                // 数据获取失败
                if (err) {
                    db.release();// 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd("没有找到可用数据2", 200);
                }
                var  len = row.length;
                function forEach(index) {
                    if( index >= len  ){
                        var back = {"totalrecord":_totalrecord,"totalpage":_totalpage,"pagesize":_pagesize,"currentpage":_currentpage}
                        back.list = row;
                        db.release(); // 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.successEnd(back);
                    }
                    db.query("SELECT to_shopowner_id as shopowner_id,user_id  FROM `activity_all_new` WHERE boss_id = ? and id=? and status=? ;",[body.boss_id,row[index].id,body.status], function(err, row_group, fields) {
                        // 数据获取失败
                        if (err) {
                            db.release();// 释放资源
                            conn.end(); // 结束当前数据库链接
                            return res.errorEnd("没有找到可用数据2", 200);
                        }
                        row[index].shop_all = row_group;
                        forEach(index+1);
                    });
                }
                forEach(0);
            });
        });
    });
}
