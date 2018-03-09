/**
 * Created by Administrator on 2017/8/17.
 * 砍到底价后 减去礼品数量 和 增加砍到底价的人数
 */
'use strict';
exports.ready = (req, res, that) => {

    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query; // 当前请求传递过来的 GET 数据,
    const body = req.body; // 当前请求传递过来的 POST 数据
    that.connect(( err , db , conn ) => {
        // 查询数据
        if(  that.isEmpty(body.bargain_id) ){
            db.release(); // 释放资源
            conn.end(); // 结束当前数据库链接
            return res.errorEnd('条件不能为空', 200);
        }
        db.query("SELECT * FROM `db_bargain` WHERE  id=?",[body.bargain_id], function(err, row, fields) {
            // 数据获取失败
            if (err) {
                db.release(); // 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd('没有找到可用数据', 200);
            }
            var quantity =  Number(row[0].product_quantity) - 1;
            if( quantity <0){quantity=0}
            var floor =  Number(row[0].user_floor) + 1;
            var update_arr = {"product_quantity":quantity,"user_floor":floor}
            db.query( "UPDATE `db_bargain` SET ? where id=?" , [ update_arr ,body.bargain_id ] , function( err, result , fields ){
                var total = result.changedRows ; // 受影响的数据条数, ( 已删除的数据条数 )
                if( err ){
                    db.release(); // 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd('更新数据失败!!', 200);
                }
                if( !total ){
                    db.release(); // 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd('没有找到可操作的数据!!', 200);
                }
                db.release(); // 释放资源
                conn.end(); // 结束当前数据库链接
                return res.successEnd( '成功更新数据 : '+ total );
            });
        })
    });
}
