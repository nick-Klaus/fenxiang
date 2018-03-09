'use strict';
exports.ready = (req, res, that) => {

    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query; // 当前请求传递过来的 GET 数据,
    const body = req.body; // 当前请求传递过来的 POST 数据

    // 链接数据库
    // 链接 / 操作数据库
    // 有不懂, 看这个 http://blog.csdn.net/zxsrendong/article/details/17006185
    
    // if(req.session.user_rows == null){
    //      return res.errorEnd('当前请求不存在 Token 或 Token 不可用', 300);
    //  }
    // if(req.session.user_token != body.token){
    //      return res.errorEnd('当前请求不存在 Token 或 Token 不可用', 300);
    // }
    var user = req.session.user_rows;
    that.connect((err, db,conn) => {
        //状态
        if(body.update == 1){
            // 更新数据
            var data = {};
            data.pay_status = 4; 
            db.query( "UPDATE ?? SET ? WHERE order_no = ? " , [ 'db_order' , data ,body.order_no ] , function( err1, result1 , fields1 ){
                if( err1 ){
                    db.release();// 释放资源
                    return res.errorEnd('更新数据失败!!', 200);
                }

                db.release(); // 释放资源
                conn.end(); // 结束当前数据库链接
                return res.successEnd( '成功修改订单状态 ' );
            });

        }else if(body.update == 2){
            var data = {};
            data.pay_status = 3; 
             db.query( "UPDATE ?? SET ? WHERE order_no = ? " ,  [ 'db_order' , data ,body.order_no ] , function( err1, result1 , fields1 ){
                if( err1 ){
                    db.release();// 释放资源
                    return res.errorEnd('更新数据失败!!', 200);
                }

                db.release(); // 释放资源
                conn.end(); // 结束当前数据库链接
                return res.successEnd( '成功修改订单状态 ' );
            });
        }else if(body.update == 3){
            var data = {};
            data.pay_status = 5; 
            db.query( "UPDATE ?? SET ? WHERE order_no = ? " ,  [ 'db_order' , data ,body.order_no ] , function( err1, result1 , fields1 ){
                if( err1 ){
                    db.release();// 释放资源
                    return res.errorEnd('更新数据失败!!', 200);
                }

                db.release(); // 释放资源
                conn.end(); // 结束当前数据库链接
                return res.successEnd( '成功修改订单状态 ' );
            });
        }

    });
}