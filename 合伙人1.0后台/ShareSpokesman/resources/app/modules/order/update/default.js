'use strict';
exports.ready = (req, res, that) => {

    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query; // 当前请求传递过来的 GET 数据,
    const body = req.body; // 当前请求传递过来的 POST 数据
    // 链接数据库
    // 链接 / 操作数据库
    // 有不懂, 看这个 http://blog.csdn.net/zxsrendong/article/details/17006185 
    //body = JSON.stringify(body);  //转换json字符串
    that.connect((err, db) => {
        db.beginTransaction(function(err){
            // 事物创建失败
            if (err) {
                return res.errorEnd('没有找到可用数据', 200);
            }
            var myDate = new Date();  
            var data = {
                pay_time :myDate.toLocaleDateString(),
                down_pay : body.down_pay,
                have_pay : body.have_pay,
                real_pay : body.real_pay,
                channel : body.channel,
                status : 0,
                remark : body.remark,
                number : body.number,
                pay_status : body,pay_status
            };  
            // 插入产品表数据
            db.query( "UPDATE ?? SET  ? WHERE id = ? " , [ 'db_order' , data , body.id ]   , function( err, result , fields ){
                if( err ){
                    // 数据插入失败, 回滚
                    db.rollback();
                    db.release();// 释放资源
                    return res.errorEnd('创建数据失败!!', 200);
                }
                // 数据创建成功, 提交数据插入操作, 只有 调用 db.commit() 方法后, 才会真正的在数据库插入数据
                db.commit();
                // 如果后面还有数据库 增删改查的操作, 那么就不要调用 db.release() 来释放资源!!
                // 但整个程序走完后, 就必须要调用 db.release() 来释放当前占用的资源
                db.release(); // 释放资源
                return res.successEnd("创建数据成功" + result.insertId );
            });


        });
    });
}