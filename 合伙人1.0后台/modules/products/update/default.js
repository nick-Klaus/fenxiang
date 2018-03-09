'use strict';
exports.ready = (req, res, that) => {

    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query; // 当前请求传递过来的 GET 数据,
    const body = req.body; // 当前请求传递过来的 POST 数据
    console.log(req);
    console.log(body);
    // 链接数据库
    // 链接 / 操作数据库
    // 有不懂, 看这个 http://blog.csdn.net/zxsrendong/article/details/17006185
    that.connect(( err , db , conn ) => {
        var data = { 
            money : body.money,
            name  : body.name,
            type : body.type,
            type1 : body.type1,
            remark : body.remark,
            image : body.image,
            carousel_figure : body.carousel_figure,
            stock : body.stock,
            product_source : body.product_source,
            mid : body.mid,
            sid : body.sid,
            barcode : body.barcode
        };   
        // 更新数据
        db.query( "UPDATE ?? SET ? WHERE id = ? " , [ 'db_product' , data , body.id ] , function( err, result , fields ){
            if( err ){
                db.release(); // 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd('修改产品信息失败!!', 200);
            }

            db.query( "DELETE FROM ?? WHERE gid = ? " , [ 'db_product_param' , body.id ] , function( err, result , fields ){
                if( err ){
                    db.release();// 释放资源
                    conn.end();
                    return res.errorEnd('修改产品信息失败!!', 200);
                }
                function add_detail(num,parameter){
                   // console.log(parameter[num]['key']);
                    //console.log(parameter[num]['name']);
                    var b = parameter[num]['name'];
                    var c = parameter[num]['value'];
                    var param = {
                        gid : body.id,
                        name : b,
                        value : c
                    };
                    db.query( "INSERT INTO db_product_param set ?" , param , function( err1, result1  ){
                        if( err ){
                            db.release();// 释放资源
                            conn.end();
                            return res.errorEnd('创建数据失败!!', 200);
                        }
                        if(num == body.parameter.length - 1 ){
                            // 数据创建成功, 提交数据插入操作, 只有 调用 db.commit() 方法后, 才会真正的在数据库插入数据
                            db.commit();
                            // 如果后面还有数据库 增删改查的操作, 那么就不要调用 db.release() 来释放资源!!
                            // 但整个程序走完后, 就必须要调用 db.release() 来释放当前占用的资源
                            db.release(); // 释放资源
                            conn.end(); // 结束当前数据库链接
                            return res.successEnd("修改产品信息成功2" );
                        }else{
                            add_detail(num+1,body.parameter);
                        }
                    });
                };
                if(body.parameter != undefined){
                    add_detail(0,body.parameter);              
                }else{
                    console.log(body.parameter);
                    db.commit();
                    db.release(); // 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.successEnd("修改产品信息成功1" );
                }
            });


        });
    });
}