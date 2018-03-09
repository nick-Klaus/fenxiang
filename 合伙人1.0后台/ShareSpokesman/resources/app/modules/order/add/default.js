'use strict';
const moment = require('moment'); // 时间处理插件
exports.ready = (req, res, that) => {

    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query; // 当前请求传递过来的 GET 数据,
    const body = req.body; // 当前请求传递过来的 POST 数据
    // 链接数据库
    // 链接 / 操作数据库
    // 有不懂, 看这个 http://blog.csdn.net/zxsrendong/article/details/17006185
    //body = JSON.stringify(body);  //转换json字符串
    // if(req.session.user_rows == null){
    //      return res.errorEnd('当前请求不存在 Token 或 Token 不可用', 300);
    // }
    // if(req.session.user_token != body.token){
    //      return res.errorEnd('当前请求不存在 Token 或 Token 不可用', 300);
    // }
    var user = req.session.user_rows;

    var special_type=0;
    if(!that.isEmpty(body.special_type) ){
        special_type=body.special_type;
    }  
    that.connect((err, db,conn) => {
        db.beginTransaction(function(err){
            // 单品
            if(body.activity_type == 1){

                var myDate = new Date();
                var now_time = myDate.getTime();
                var day = myDate.getDate();
                var month = myDate.getMonth()+1;
                var year = myDate.getFullYear();
                var data = {
                    commission : body.commission,
                    create_time :now_time/1000,
                    gid : body.gid,
                    total_price : body.total_price,
                    discount_price : body.discount_price,
                    need_pay : body.need_pay,
                    status : 0,
                    remark : body.remark,
                    number : body.number,
                    cid    : body.cid,
                    mid : body.mid,
                    pid : body.pid,
                    sid : body.sid,
                    pay_status : 1,
                    aid : body.aid,
                    activity_type : 1,
                    title_pic : body.title_pic,
                    title : body.title,
                    unit_price : body.unit_price,
                    original_price : body.original_price,
                    is_express : body.is_express,
                    pay_price_type : body.pay_price_type,
                    down_pay : body.down_pay,
                    special_type:special_type
                };
                // 插入产品表数据
                db.query( "INSERT INTO db_order set ?" , data , function( err, result , fields ){
                    if( err ){
                        // 数据插入失败, 回滚
                        db.rollback();
                        db.release();// 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd('创建数据失败!!', 200);
                    }
                    var data1 = {
                        order_no : "DP"+year+month+day+result.insertId
                    };
                    db.query( "UPDATE ?? SET  ? WHERE id = ? " , [ 'db_order' , data1,result.insertId ] , function( err1, result1 , fields1 ){
                        // if(body.product_quantity){
                        //     var data2 = {
                        //         product_quantity : body.product_quantity 
                        //     };
                        // }else{
                        //     var data2 = {};
                        // }
                        var back={};
                        back.id=result.insertId;
                        back.order_no=data1.order_no;
                        back.need_pay=body.need_pay;

                        // 数据创建成功, 提交数据插入操作, 只有 调用 db.commit() 方法后, 才会真正的在数据库插入数据
                        db.commit();
                        // 如果后面还有数据库 增删改查的操作, 那么就不要调用 db.release() 来释放资源!!
                        // 但整个程序走完后, 就必须要调用 db.release() 来释放当前占用的资源
                        db.release();// 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.successEnd(back);
                        // db.query( "UPDATE ?? SET  ? WHERE id = ? " , [ 'db_single_product' , data2,body.aid ] , function( err2, result2 , fields2 ){
   
                        // });
                    });
                });
            //砍价
            }else if(body.activity_type == 2){
                var myDate = new Date();
                var now_time = myDate.getTime();
                var day = myDate.getDate();
                var month = myDate.getMonth()+1;
                var year = myDate.getFullYear();
                var data = {
                    create_time :now_time/1000,
                    gid : body.gid,
                    total_price : body.total_price,
                    discount_price : body.discount_price,
                    need_pay : body.need_pay,
                    status : 0,
                    remark : body.remark,
                    number : body.number,
                    cid    : body.cid,
                    mid : body.mid,
                    pid : body.pid,
                    sid : body.sid,
                    pay_status : 1,
                    aid : body.aid,
                    activity_type : 2,
                    is_express : 0,
                    title_pic : body.title_pic,
                    title : body.title,
                    unit_price : body.unit_price,
                    original_price : body.original_price,
                    special_type:special_type
                };
                // 插入产品表数据
                db.query( "INSERT INTO db_order set ?" , data , function( err, result , fields ){
                    if( err ){
                        db.rollback();
                        db.release();// 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd('创建数据失败!!', 200);
                    }
                    var data1 = {
                        order_no : "KJ"+year+month+day+result.insertId
                    };
                    db.query( "UPDATE ?? SET  ? WHERE id = ? " , [ 'db_order' , data1,result.insertId ] , function( err1, result1 , fields1 ){
                        if( err1 ){
                            db.rollback();
                            db.release();// 释放资源
                            conn.end(); // 结束当前数据库链接
                            return res.errorEnd('更新数据失败!!', 200);
                        }
                        var back={};
                        back.id=result.insertId;
                        back.order_no=data1.order_no;
                        back.need_pay=body.need_pay;
                        // 数据创建成功, 提交数据插入操作, 只有 调用 db.commit() 方法后, 才会真正的在数据库插入数据
                        db.commit();
                        conn.end(); // 结束当前数据库链接
                        db.release();// 释放资源
                        return res.successEnd(back);
                    });
                });
            //众筹
            }else if(body.activity_type == 3){
                var myDate = new Date();
                var now_time = myDate.getTime();
                var day = myDate.getDate();
                var month = myDate.getMonth()+1;
                var year = myDate.getFullYear();
                var data = {
                    create_time :now_time/1000,
                    gid : body.gid,
                    total_price : body.total_price,
                    discount_price : body.discount_price,
                    need_pay : body.need_pay,
                    status : 0,
                    remark : body.remark,
                    number : body.number,
                    cid    : body.cid,
                    mid : body.mid,
                    pid : body.pid,
                    sid : body.sid,
                    pay_status : 0,
                    aid : body.aid,
                    activity_type : 3,
                    title_pic : body.title_pic,
                    title : body.title,
                    unit_price : body.unit_price,
                    original_price : body.original_price,
                    special_type:special_type
                };
                // 插入产品表数据
                db.query( "INSERT INTO db_order set ?" , data , function( err, result , fields ){
                    if( err ){
                        db.rollback();
                        db.release();// 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd('创建数据失败!!', 200);
                    }
                    var data1 = {
                        order_no : "ZC"+year+month+day+result.insertId
                    };
                    db.query( "UPDATE ?? SET  ? WHERE id = ? " , [ 'db_order' , data1,result.insertId ] , function( err1, result1 , fields1 ){
                        if( err1 ){
                            db.rollback();
                            db.release();// 释放资源
                            conn.end(); // 结束当前数据库链接
                            return res.errorEnd('更新数据失败!!', 200);
                        }

                        // 数据创建成功, 提交数据插入操作, 只有 调用 db.commit() 方法后, 才会真正的在数据库插入数据
                        db.commit();
                        db.release();// 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.successEnd("创建数据成功" + result.insertId );
                    });
                });
            //拼团
            }else if(body.activity_type == 4){
                var myDate = new Date();
                var now_time = myDate.getTime();
                var day = myDate.getDate();
                var month = myDate.getMonth()+1;
                var year = myDate.getFullYear();
                var data = {
                    commission : body.commission,
                    create_time :now_time/1000,
                    gid : body.gid,
                    total_price : body.total_price,
                    discount_price : body.discount_price,
                    need_pay : body.need_pay,
                    status : 0,
                    remark : body.remark,
                    number : body.number,
                    cid    : body.cid,
                    mid : body.mid,
                    pid : body.pid,
                    sid : body.sid,
                    pay_status : 1,
                    aid : body.aid,
                    activity_type : 4,
                    title_pic : body.title_pic,
                    title : body.title,
                    unit_price : body.unit_price,
                    original_price : body.original_price,
                    is_express : body.is_express,
                    pay_price_type : body.pay_price_type,
                    down_pay : body.down_pay,
                    special_type:special_type
                };
                // 插入产品表数据
                db.query( "INSERT INTO db_order set ?" , data , function( err, result , fields ){
                    if( err ){
                        // 数据插入失败, 回滚
                        db.rollback();
                        db.release();// 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd('创建数据失败!!', 200);
                    }
                    var data1 = {
                        order_no : "DP"+year+month+day+result.insertId
                    };
                    db.query( "UPDATE ?? SET  ? WHERE id = ? " , [ 'db_order' , data1,result.insertId ] , function( err1, result1 , fields1 ){
                        // if(body.product_quantity){
                        //     var data2 = {
                        //         product_quantity : body.product_quantity 
                        //     };
                        // }else{
                        //     var data2 = {};
                        // }
                        var back={};
                        back.id=result.insertId;
                        back.order_no=data1.order_no;
                        back.need_pay=body.need_pay;

                        // 数据创建成功, 提交数据插入操作, 只有 调用 db.commit() 方法后, 才会真正的在数据库插入数据
                        db.commit();
                        // 如果后面还有数据库 增删改查的操作, 那么就不要调用 db.release() 来释放资源!!
                        // 但整个程序走完后, 就必须要调用 db.release() 来释放当前占用的资源
                        db.release();// 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.successEnd(back);
                        // db.query( "UPDATE ?? SET  ? WHERE id = ? " , [ 'db_single_product' , data2,body.aid ] , function( err2, result2 , fields2 ){
   
                        // });
                    });
                });
            //拍卖
            }else if(body.activity_type == 5){
                var myDate = new Date();
                var now_time = myDate.getTime();
                var day = myDate.getDate();
                var month = myDate.getMonth()+1;
                var year = myDate.getFullYear();
                var data = {
                    create_time :now_time/1000,
                    gid : body.gid,
                    total_price : body.total_price,
                    discount_price : body.discount_price,
                    need_pay : body.need_pay,
                    status : 0,
                    remark : body.remark,
                    number : body.number,
                    cid    : body.cid,
                    mid : body.mid,
                    pid : body.pid,
                    sid : body.sid,
                    pay_status : 0,
                    aid : body.aid,
                    activity_type : 5,
                    title_pic : body.title_pic,
                    title : body.title,
                    unit_price : body.unit_price,
                    original_price : body.original_price,
                    special_type:special_type
                };
                // 插入产品表数据
                db.query( "INSERT INTO db_order set ?" , data , function( err, result , fields ){
                    if( err ){
                        db.rollback();
                        db.release();// 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd('创建数据失败!!', 200);
                    }
                    var data1 = {
                        order_no : "PM"+year+month+day+result.insertId
                    };
                    db.query( "UPDATE ?? SET  ? WHERE id = ? " , [ 'db_order' , data1,result.insertId ] , function( err1, result1 , fields1 ){
                        if( err1 ){
                            db.rollback();
                            db.release();// 释放资源
                            conn.end(); // 结束当前数据库链接
                            return res.errorEnd('更新数据失败!!', 200);
                        }

                        // 数据创建成功, 提交数据插入操作, 只有 调用 db.commit() 方法后, 才会真正的在数据库插入数据
                        db.commit();

                        db.release();// 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.successEnd("创建数据成功" + result.insertId );
                    });

                });

            //传单
            }else if(body.activity_type == 6){
                var myDate = new Date();
                var now_time = myDate.getTime();
                var day = myDate.getDate();
                var month = myDate.getMonth()+1;
                var year = myDate.getFullYear();
                var data = {
                    create_time :now_time/1000,
                    gid : body.gid,
                    total_price : body.total_price,
                    discount_price : body.discount_price,
                    need_pay : body.need_pay,
                    status : 0,
                    remark : body.remark,
                    number : body.number,
                    cid    : body.cid,
                    mid : body.mid,
                    pid : body.pid,
                    sid : body.sid,
                    pay_status : 0,
                    aid : body.aid,
                    activity_type : 6,
                    title_pic : body.title_pic,
                    title : body.title,
                    unit_price : body.unit_price,
                    original_price : body.original_price,
                    special_type:special_type
                };
                // 插入产品表数据
                db.query( "INSERT INTO db_order set ?" , data , function( err, result , fields ){
                    if( err ){
                        db.rollback();
                        db.release();// 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd('创建数据失败!!', 200);
                    }
                    var data1 = {
                        order_no : "CD"+year+month+day+result.insertId
                    };
                    db.query( "UPDATE ?? SET  ? WHERE id = ? " , [ 'db_order' , data1,result.insertId ] , function( err1, result1 , fields1 ){
                        if( err1 ){
                            db.rollback();
                            db.release();// 释放资源
                            conn.end(); // 结束当前数据库链接
                            return res.errorEnd('更新数据失败!!', 200);
                        }

                        // 数据创建成功, 提交数据插入操作, 只有 调用 db.commit() 方法后, 才会真正的在数据库插入数据
                        db.commit();
                        db.release();// 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.successEnd("创建数据成功" + result.insertId );
                    });
                });
            }
        });
    });
}