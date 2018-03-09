/**
 * Created by Administrator on 2017/8/11.
 * 当前用户为别人操作过的活动日志记录
 */
'use strict';
exports.ready = (req, res, that) => {
    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query; // 当前请求传递过来的 GET 数据,
    const body = req.body; // 当前请求传递过来的 POST 数据
    that.connect(( err , db , conn ) => {
        // 查询数据
        if(  that.isEmpty(body.openid) || that.isEmpty(body.boss_id) ){
            db.release(); // 释放资源
            conn.end(); // 结束当前数据库链接
            return res.errorEnd('条件不能为空', 200);
        }
        var slecte = [body.openid,body.operation_type,body.addtime,body.user_id,body.activity_type,body.activity_id];
        db.query("SELECT * FROM `db_activity_record` WHERE  openid=? and operation_type=? and addtime=? and user_id=? and activity_type=? and activity_id=?",slecte, function(err, row, fields) {
            // 数据获取失败
            if (err) {
                db.release(); // 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd('没有找到可用数据', 200);
            }
            // 这个打印, 只会出现在主程序的控制台中
            //console.log(err, row, fields, this.sql);
            db.release(); // 释放资源
            conn.end(); // 结束当前数据库链接
            return res.successEnd(row);
        })
    });
}
