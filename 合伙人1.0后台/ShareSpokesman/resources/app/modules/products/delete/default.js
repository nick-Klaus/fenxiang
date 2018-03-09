'use strict';
exports.ready = (req, res, that) => {

    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query; // 当前请求传递过来的 GET 数据,
    const body = req.body; // 当前请求传递过来的 POST 数据

    // 链接数据库
    // 链接 / 操作数据库
    // 有不懂, 看这个 http://blog.csdn.net/zxsrendong/article/details/17006185
    that.connect((err, db,conn) => {
        if(body.status == 1){
            // 删除全部产品数据
            //
            db.query("select * from `activity_all` where product_id = ? and status = 1", body.product_id, function(err1, row1, fields1) {
                if( err1 ){
                    db.release();// 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd('数据获取失败!!', 200);
                }
                if( row1.length ){
                    db.release(); // 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd('此产品还有活动正在进行,不能删除!!', 200);
                }else{
                    db.query(  "UPDATE ?? SET status = 99 WHERE id = ? " , [ 'db_product' ,  body.product_id ] , function( err, result , fields ){
                        if( err ){
                            db.release();// 释放资源
                            conn.end(); // 结束当前数据库链接
                            return res.errorEnd('数据修改失败!!', 200);
                        }

                        // if( !total ){
                        //     db.release();// 释放资源
                        //     conn.end();
                        //     return res.errorEnd('没有找到可操作的数据!!', 200);
                        // }

                        // 如果后面还有数据库 增删改查的操作, 那么就不要调用 db.release() 来释放资源!!
                        // 但整个程序走完后, 就必须要调用 db.release() 来释放当前占用的资源
                        db.release(); // 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.successEnd( '成功删除产品' );
                    });
                }

            })
        }else if(body.status == 2){
           // 删除详细的个别数据
            db.query( "DELETE FROM ?? WHERE id = ? " , [ 'db_product_param' , body.id ] , function( err, result , fields ){

                var total = result.affectedRows; // 受影响的数据条数, ( 已删除的数据条数 )

                if( err ){
                    db.release();// 释放资源
                    conn.end();
                    return res.errorEnd('删除数据失败!!', 200);
                }

                if( !total ){
                    db.release();// 释放资源
                    conn.end();
                    return res.errorEnd('没有找到可操作的数据!!', 200);
                }

                // 如果后面还有数据库 增删改查的操作, 那么就不要调用 db.release() 来释放资源!!
                // 但整个程序走完后, 就必须要调用 db.release() 来释放当前占用的资源
                db.commit();
                db.release(); // 释放资源
                conn.end(); // 结束当前数据库链接
                return res.successEnd( '成功删除数据 : ' + total );
            });
        }

    });
}