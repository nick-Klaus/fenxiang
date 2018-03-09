'use strict';
exports.ready = (req, res, that) => {

    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query; // 当前请求传递过来的 GET 数据,
    const body = req.body; // 当前请求传递过来的 POST 数据

    // 链接数据库
    // 链接 / 操作数据库
    // 有不懂, 看这个 http://blog.csdn.net/zxsrendong/article/details/17006185
    that.connect(( err , db , conn ) => {
        var data = {
            down_pay : body.down_pay,
            have_pay : body.have_pay,
            real_pay : bdoy.real_pay,
            pay_time : '',
            channel : body.channel,
            user_uid : body.user_uid,
            status : 1,
            content : body.content,
            payment_no : body.payment_no,
            out_order_no : body.out_order_no,
            out_order_id : body.out_order_id,
        };
        var where = {
            order_no : body.order_no,
            sid : body.sid,
            mid : body.mid
        };
        // 生成随机的单号
        // 更新数据
        db.query( "UPDATE ?? SET ? WHERE ? " , [ 'db_order' , data , where ] , function( err, result , fields ){

            var total = result.changedRows ; // 受影响的数据条数, ( 已删除的数据条数 )

            if( err ){
                db.release();// 释放资源
                return res.errorEnd('更新数据失败!!', 200);
            }

            if( !total ){
                db.release(); // 释放资源
                return res.errorEnd('没有找到可操作的数据!!', 200);
            }

            // 如果后面还有数据库 增删改查的操作, 那么就不要调用 db.release() 来释放资源!!
            // 在整个程序走完后, 就必须要调用 db.release() 来释放当前占用的资源
            // 同时 调用 db.end() 来结束当前数据库链接 (该方法会在query结束之后才触发)    2017年8月9日 11:09:23 更新
            db.release(); // 释放资源
            conn.end(); // 结束当前数据库链接

            return res.successEnd( '成功更新数据 : '+ total +' [ order_no = '+ rand +' ]' );
        });
    });
}