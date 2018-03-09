/**
 * Created by Administrator on 2017/8/13.
 * 传单活动用户 获取
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
    if( that.isEmpty(body.leaflet_id) ){
        return res.errorEnd('活动id不存在！！', 200);
    }
    that.connect(( err , db , conn ) => {
        db.query("select * from `db_leaflet_user` where user_id=? and leaflet_id=? and shopowner_id=?",[user.id,body.leaflet_id,user.shopowner_id], function(err, row, fields) {
            // 数据获取失败
            if (err) {
                db.release();// 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd('没有找到可用数据', 200);
            }
            db.release(); // 释放资源
            conn.end(); // 结束当前数据库链接
            return res.successEnd(row);
        })
    });
}
