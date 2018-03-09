/**
 * Created by Administrator on 2017/8/11.
 * 判断用户是否参加拼团活动
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
        db.query("select * from `db_fight_groups` where  id=? and status=1",[body.fight_groups_id], function(err, row1, fields) {
            // 数据获取失败
            if (err) {
                db.release();// 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd('没有找到可用数据', 200);
            }
            db.query("select * from `db_fight_groups_user` where openid=? and fight_groups_id=? and user_id=?",[user.openid,body.fight_groups_id,user.id], function(err, row, fields) {
                // 数据获取失败
                if (err) {
                    db.release();// 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd('没有找到可用数据', 200);
                }
                if( row1.length <= 0 || row.length > 0 ){
                    db.release();// 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd('您已参加过该活动！', 200);
                }
                // 这个打印, 只会出现在主程序的控制台中
                db.release(); // 释放资源
                conn.end(); // 结束当前数据库链接
                return res.successEnd(true);
            })
        });
    });
}
