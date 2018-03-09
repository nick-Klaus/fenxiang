/**
 * Created by Administrator on 2017/8/11.
 * 活动增加库存
 */
'use strict';
exports.ready = (req, res, that) => {
    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query; // 当前请求传递过来的 GET 数据,
    const body = req.body; // 当前请求传递过来的 POST 数据
    if(that.isEmpty(req.session.user_token)){
        return res.errorEnd('当前请求不存在 Token 或 Token 不可用1', 300);
    }
    var user = req.session.user_rows;
    that.connect(( err , db , conn ) => {
        // 查询数据
        var table_name = body.table;// 添加库存库存的表名
        var avt_id = body.activity_id;// 活动id
        var _quantity = body.quantity;// 添加的数量
        var _product_id = body.product_id;// 产品id
        // 找出产品的数据
        db.query("SELECT id,stock FROM `db_product` WHERE  id=?",[_product_id], function(err, row_stock, fields) {
            // 数据获取失败
            if (err ) {
                db.release();// 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd('没有找到可操作数据2!!', 200);
            }
            // 从产品库存里面减去冲值到活动里面
            var quantity_reduce = that.floatSub( parseInt(row_stock[0].stock), parseInt(_quantity));
            if( quantity_reduce < 0 ){
                db.release();// 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd('库存不足剩余'+ Number(row_stock[0].stock), 200);
            }
            db.query( "UPDATE `db_product` SET stock=? WHERE id = ? " , [ quantity_reduce, _product_id] , function( err, result , fields ){
                if( err ){
                    db.release(); // 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd('没有找到可操作数据2!!', 200);
                }
                // 找出活动的数据
                db.query("SELECT id,product_quantity FROM ?? WHERE  id=?",[table_name,avt_id], function(err, row, fields) {
                    // 数据获取失败
                    if (err) {
                        db.release();// 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd('没有找到可用数据3', 200);
                    }
                    var quantity_num = that.floatAdd( parseInt(_quantity),parseInt(row[0].product_quantity) );
                    // 修改库存数据
                    db.query( "UPDATE ?? SET product_quantity=? WHERE id = ? " , [ table_name, quantity_num, avt_id] , function( err, result , fields ){
                        if( err ){
                            db.release(); // 释放资源
                            conn.end(); // 结束当前数据库链接
                            return res.errorEnd('没有找到可操作数据4!!', 200);
                        }
                        // 这个打印, 只会出现在主程序的控制台中
                        db.release(); // 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.successEnd('修改成功!!');
                    })
                })
            })
        })
    });
}


