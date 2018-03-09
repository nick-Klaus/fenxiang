'use strict';
exports.ready = (req, res, that) => {

    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query; // 当前请求传递过来的 GET 数据,
    const body = req.body; // 当前请求传递过来的 POST 数据

    // 链接数据库
    // 链接 / 操作数据库
    // 有不懂, 看这个 http://blog.csdn.net/zxsrendong/article/details/17006185
    that.connect(( err , db , conn ) => {
        db.beginTransaction(function(err){
            // 事物创建失败
            if (err) {
                return res.errorEnd('没有找到可用数据', 200);
            }

            // 插入数据
            db.query( "INSERT INTO ?? (`id`, `order_no`) VALUES (null, ? )" , [ 'db_order' , 'BC123456' ] , function( err, result , fields ){

                if( err ){
                    // 数据插入失败, 回滚
                    db.rollback();
                    db.release();// 释放资源
                    return res.errorEnd('创建数据失败!!', 200);
                }

                // 数据创建成功, 提交数据插入操作, 只有 调用 db.commit() 方法后, 才会真正的在数据库插入数据
                db.commit();

                // 如果后面还有数据库 增删改查的操作, 那么就不要调用 db.release() 来释放资源!!
                // 在整个程序走完后, 就必须要调用 db.release() 来释放当前占用的资源
                // 同时 调用 db.end() 来结束当前数据库链接 (该方法会在query结束之后才触发)    2017年8月9日 11:09:23 更新
                db.release(); // 释放资源
                conn.end(); // 结束当前数据库链接

                return res.successEnd("创建数据成功" + result.insertId );
            });
        });
    });
}