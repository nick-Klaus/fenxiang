/**
 * Created by Administrator on 2017/8/13.
 * 下级代言人 获得奖励规则配置 删除
 */
exports.ready = (req, res, that) => {

    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query; // 当前请求传递过来的 GET 数据,
    const body = req.body; // 当前请求传递过来的 POST 数据
    // 删除数据
    if(  that.isEmpty(body.id) ){
        return res.errorEnd('条件不能为空', 200);
    }
    that.connect(( err , db , conn ) => {

        db.query( "DELETE FROM `db_commission_configure` WHERE id = ? " , [body.id] , function( err, result , fields ){
            var total = result.affectedRows; // 受影响的数据条数, ( 已删除的数据条数 )
            if( err ){
                db.release();// 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd('删除数据失败!!', 200);
            }
            if( !total ){
                db.release();// 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd('没有找到可操作的数据!!', 200);
            }
            db.release(); // 释放资源
            conn.end(); // 结束当前数据库链接
            return res.successEnd( '成功删除数据 : ' + total );
        });
    });
}