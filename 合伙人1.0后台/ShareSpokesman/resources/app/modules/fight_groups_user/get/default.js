/**
 * Created by Administrator on 2017/8/11.
 * 一个小团的所有人
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
    if(that.isEmpty(body.top_id)){
        return res.errorEnd('团长的id不存在', 300);
    }
    that.connect(( err , db , conn ) => {
        // 判断团长是否存在
        db.query("select * from `db_fight_groups_user` where  id=? and fight_groups_id=? and top_id=0",[body.top_id,body.fight_groups_id], function(err, row, fields) {
            // 数据获取失败
            if (err) {
                db.rollback();
                db.release();// 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd('没有找到可用数据', 200);
            }
            if( row.length == 0 ){
                db.rollback();
                db.release();// 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd('没有找到团长数据', 200);
            }
            // 一个团的所有人，第一个人则为团长
            db.query("select * from `db_fight_groups_user` where  id=? or top_id=? and fight_groups_id=? order by id asc",[body.top_id,body.top_id,body.fight_groups_id], function(err, row, fields) {
            // 数据获取失败
            if (err) {
                db.rollback();
                db.release();// 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd('没有找到可用数据', 200);
            }
                // 这个打印, 只会出现在主程序的控制台中
                db.rollback();
                db.release();// 释放资源
                conn.end(); // 结束当前数据库链接
                return res.successEnd(row);
            });
         });
    });
}
