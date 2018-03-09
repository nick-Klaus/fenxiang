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
            //老板注册
            var myDate = new Date();  
            if(body.status == 0){
                var data = {
                    create_time :myDate.toLocaleDateString(),
                    username : body.username,
                    realname : body.realname,
                    mobile : body.mobile,
                    tel : body.tel,
                    address : body.address,
                    password : "j~h!k@j#d$y%r^x&t*"+md5(body.password),
                    password_hash : "j~h!k@j#d$y%r^x&t*",
                    amount : 0,
                    consume : 0,
                    cash : 0,
                };  
                // 插入产品表数据
                db.query( "INSERT INTO db_manager set ?" , data , function( err, result , fields ){
                    if( err ){
                        // 数据插入失败, 回滚
                        db.rollback();
                        db.release();// 释放资源
                        return res.errorEnd('创建数据失败!!', 200);
                    }
                    // 数据创建成功, 提交数据插入操作, 只有 调用 db.commit() 方法后, 才会真正的在数据库插入数据
                    
                    // 如果后面还有数据库 增删改查的操作, 那么就不要调用 db.release() 来释放资源!!
                    // 但整个程序走完后, 就必须要调用 db.release() 来释放当前占用的资源
                    db.release(); // 释放资源
                    return res.successEnd("创建数据成功" + result.insertId );
                });
            //店长注册
            }else if(body.status == 1){
                var data = {
                    create_time :myDate.toLocaleDateString(),
                    shop_id : body.shop_id,
                    realname : body.realname,
                    mobile : body.mobile,
                    tel : body.tel,
                    address : body.address,
                    password : "j~h!k@j#d$y%r^x&t*"+md5(body.password),
                    password_hash : "j~h!k@j#d$y%r^x&t*",
                    amount : 0,
                    consume : 0,
                    cash : 0,
                    status : 1
                };  
                // 插入产品表数据
                db.query( "INSERT INTO db_shoppwner set ?" , data , function( err, result , fields ){
                    if( err ){
                        // 数据插入失败, 回滚
                        db.rollback();
                        db.release();// 释放资源
                        return res.errorEnd('创建数据失败!!', 200);
                    }
                    // 数据创建成功, 提交数据插入操作, 只有 调用 db.commit() 方法后, 才会真正的在数据库插入数据

                    // 如果后面还有数据库 增删改查的操作, 那么就不要调用 db.release() 来释放资源!!
                    // 但整个程序走完后, 就必须要调用 db.release() 来释放当前占用的资源
                    db.release(); // 释放资源
                    return res.successEnd("创建数据成功" + result.insertId );
                });
            //店员或者代言人注册
            }else if(body.status == 2){
                if(){
                    var data ={
                        is_clerk : 0,
                        is_prolocutor : 1,

                    };
                }
            }




        });
    });
}