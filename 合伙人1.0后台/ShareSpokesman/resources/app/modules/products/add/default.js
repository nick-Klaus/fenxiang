'use strict';
exports.ready = (req, res, that) => {

    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query; // 当前请求传递过来的 GET 数据,
    const body = req.body; // 当前请求传递过来的 POST 数据
    // 链接数据库
    // 链接 / 操作数据库
    // 有不懂, 看这个 http://blog.csdn.net/zxsrendong/article/details/17006185 
    //body = JSON.stringify(body);  //转换json字符串

    // var user_rows = req.session.user_rows;
    // if(req.session.user_rows == null){
    //     return res.errorEnd('当前请求不存在 Token 或 Token 不可用', 300);
    // }
    // if(req.session.user.shopowner == {}){
    //     return res.errorEnd('没有权限添加产品', 300);
    // }   

    that.connect((err, db,conn) => {
        db.beginTransaction(function(err){
            // 事物创建失败
            if (err) {
                db.release();// 释放资源
                conn.end();
                return res.errorEnd('没有找到可用数据', 200);
            }
            var myDate = new Date();  
            var data = { 
                money : body.money,
                status: 1,
                name  : body.name,
                type : body.type,
                type1 : body.type1,
                remark : body.remark,
                create_time :myDate.toLocaleDateString(),
                commission : 0,
                image : body.image,
                carousel_figure : body.carousel_figure,
                sales : 0,
                stock : body.stock,
                product_source : body.product_source,
                mid : body.manager_id,
                sid : body.shop_id,
                barcode : body.barcode
            };  
            // 插入产品表数据
            db.query( "INSERT INTO db_product set ?" , data , function( err, result , fields ){
                if( err ){
                    // 数据插入失败, 回滚
                    db.rollback();
                    db.release();// 释放资源
                    conn.end();
                    return res.errorEnd('创建数据失败!!', 200);
                }

                function add_detail(num,parameter){
                   // console.log(parameter[num]['key']);
                    //console.log(parameter[num]['name']);
                    var b = parameter[num]['key'];
                    var c = parameter[num]['name'];
                    var param = {
                        gid : result.insertId,
                        name : b,
                        value : c
                    };
                    db.query( "INSERT INTO db_product_param set ?" , param , function( err1, result1  ){
                        if( err ){
                            // 数据插入失败, 回滚
                            db.rollback();
                            db.release();// 释放资源
                            conn.end();
                            return res.errorEnd('创建数据失败!!', 200);
                        }
                        if(num == body.parameter.length - 1 ){
                            // 数据创建成功, 提交数据插入操作, 只有 调用 db.commit() 方法后, 才会真正的在数据库插入数据
                            db.commit();
                            // 如果后面还有数据库 增删改查的操作, 那么就不要调用 db.release() 来释放资源!!
                            // 但整个程序走完后, 就必须要调用 db.release() 来释放当前占用的资源
                            conn.end(); // 结束当前数据库链接
                            db.release(); // 释放资源
                            return res.successEnd("创建数据成功" + result.insertId );
                        }else{
                            add_detail(num+1,body.parameter);
                        }
                    });
                };
                if(body.parameter != undefined){
                    if(body.parameter == []){
                        db.commit();
                        // 如果后面还有数据库 增删改查的操作, 那么就不要调用 db.release() 来释放资源!!
                        // 但整个程序走完后, 就必须要调用 db.release() 来释放当前占用的资源
                        conn.end(); // 结束当前数据库链接
                        db.release(); // 释放资源
                        return res.successEnd("创建数据成功" + result.insertId );
                    }else{
                       add_detail(0,body.parameter); 
                    }            
                }else{

                    var relation = { 
                        product_id: result.insertId,
                        addtime : (new Date().getTime())/1000,
                        boss_id : body.manager_id,
                        shopowner_id : body.shop_id,
                        top_shopowner_id : body.shop_id
                    };

                    db.query( "INSERT INTO db_product_shopowner_relation set ?" , relation , function( err, relation_1 , fields ){
                        if( err ){
                            console.log(this.sql);
                            // 数据插入失败, 回滚
                            db.rollback();
                            db.release();// 释放资源
                            conn.end();
                            return res.errorEnd('创建数据失败!!', 200);
                        }

                        db.commit();
                        // 如果后面还有数据库 增删改查的操作, 那么就不要调用 db.release() 来释放资源!!
                        // 但整个程序走完后, 就必须要调用 db.release() 来释放当前占用的资源
                        conn.end(); // 结束当前数据库链接
                        db.release(); // 释放资源
                        return res.successEnd("创建数据成功" + result.insertId );
                    });
                    
                }
                

                



               
            });


        });
    });
}