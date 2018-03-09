/**
 * Created by Administrator on 2017/8/11.
 * 修改砍价用户
 */
'use strict';
exports.ready = (req, res, that) => {
    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query; // 当前请求传递过来的 GET 数据,
    const body = req.body; // 当前请求传递过来的 POST 数据
    that.connect(( err , db , conn ) => {
        if( that.isEmpty(body.id) ){
            db.rollback();
            db.release();// 释放资源
            conn.end(); // 结束当前数据库链接
            return res.errorEnd('条件不能为空', 200);
        }
        // 更新用户数据
        var log_arr = {"bargain_type":body.bargain_type,"new_price":body.new_price,"bargain_time":body.bargain_time};
        db.query( "UPDATE `db_bargain_user` SET ? where id=?" , [ log_arr ,body.id] , function( err, result , fields ){
            var total = result.changedRows ; // 受影响的数据条数, ( 已删除的数据条数 )
            if( err ){
                db.rollback();
                db.release();// 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd('更新数据失败!!', 200);
            }
            if( !total ){
                db.rollback();
                db.release();// 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd('没有找到可操作的数据!!', 200);
            }
            // 砍价成功后添加日志
            var log_arr = {"user_id":body.id,"openid":body.openid,"bargain_id":body.bargain_id,"price":body._price,"new_price":body.new_price,"addtime":body.bargain_time};
            db.query( "INSERT INTO `db_bargain_log` SET ?" , log_arr , function( err, result , fields ){
                if( err ){
                    // 数据插入失败, 回滚
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
