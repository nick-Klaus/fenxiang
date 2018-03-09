/**
 * Created by Administrator on 2017/8/9.
 * 砍价活动 获取
 */
'use strict';
exports.ready = (req, res, that) => {

    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query; // 当前请求传递过来的 GET 数据,
    const body = req.body; // 当前请求传递过来的 POST 数据
    that.connect(( err , db , conn ) => {
        //查询数据 老板id不能为空
        if( that.isEmpty(body.boss_id) ){
            db.release(); // 释放资源
            conn.end(); // 结束当前数据库链接
            return res.errorEnd('条件不能为空', 200);
        }
        if( that.isEmpty(body.id) ){
            // 获取老板的全部数据
            db.query("select * from `db_bargain` where boss_id=?",[body.boss_id], function(err, row, fields) {
                // 数据获取失败
                if (err) {
                    db.release(); // 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd('没有找到可用数据', 200);
                }
                // 这个打印, 只会出现在主程序的控制台中
                db.release(); // 释放资源
                conn.end(); // 结束当前数据库链接
                return res.successEnd(row);
            })
        }else{
            // 获取老板的单条数据
            db.query("select * from `db_bargain` where id=? and boss_id=?",[body.id,body.boss_id], function(err, row, fields) {
                // 数据获取失败
                if (err) {
                    db.release(); // 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd('没有找到可用数据', 200);
                }
                // 这个打印, 只会出现在主程序的控制台中
                db.release(); // 释放资源
                conn.end(); // 结束当前数据库链接
                return res.successEnd(row);
            })
        }
    });
}
