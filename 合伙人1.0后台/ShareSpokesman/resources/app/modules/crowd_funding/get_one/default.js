/**
 * Created by Administrator on 2017/8/11.
 * 用户众筹活动的获取
 */
'use strict';
exports.ready = (req, res, that) => {

    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query || {}; // 当前请求传递过来的 GET 数据,
    const body = req.body || {}; // 当前请求传递过来的 POST 数据
    const sideUrl = req.sideUrl || '';// 当前域名, 一般为 http://www.zsb2b.com:8081/
    if(that.isEmpty(req.session.user_token)){
        return res.errorEnd('当前请求不存在 Token 或 Token 不可用', 300);
    }
    var user = req.session.user_rows;
    if(that.isEmpty(body.id)){
        return res.errorEnd('条件不存在！！', 300);
    }
    that.connect(( err , db , conn ) => {
        // 查询数据
        db.query("select * from `db_crowd_funding` where id=? ", [body.id] ,function(err, row_funding, fields) {
            if (err) {
                db.release(); // 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd('没有找到可用数据1', 200);
            }
            // 当前众筹用户的信息
            db.release(); // 释放资源
            conn.end(); // 结束当前数据库链接
            return res.successEnd(row_funding);
        });
    });
}