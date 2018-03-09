/**
 * Created by Administrator on 2017/8/13.
 * 下级代言人 获得奖励规则配置 添加
 */
'use strict';
exports.ready = (req, res, that) => {
    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query; // 当前请求传递过来的 GET 数据,
    const body = req.body; // 当前请求传递过来的 POST 数据
    // 事物创建失败  老板id不能为空
    if (err ||  that.isEmpty(body.manager_id) ) {
        return res.errorEnd('没有找到可用数据', 200);
    }
    that.connect(( err , db , conn ) => {
        db.beginTransaction(function(err){

            // 插入数据
            db.query( "INSERT INTO `db_commission_configure` SET ?" , body , function( err, result , fields ){
                if( err ){
                    db.rollback();
                    db.release();// 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd('创建数据失败!!', 200);
                }
                db.commit();
                db.release(); // 释放资源
                conn.end(); // 结束当前数据库链接
                return res.successEnd("创建数据成功" + result.insertId );
            });
        });
    });
}