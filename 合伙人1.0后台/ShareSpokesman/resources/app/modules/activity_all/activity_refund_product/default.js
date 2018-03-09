/**
 * Created by Administrator on 2017/8/9.
 * 活动产品的退回
 */
const moment = require('moment'); // 时间处理插件
'use strict';
exports.ready = (req, res, that) => {

    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query; // 当前请求传递过来的 GET 数据,
    const body = req.body; // 当前请求传递过来的 POST 数据
    if(that.isEmpty(req.session.user_token)){
        return res.errorEnd('当前请求不存在 Token 或 Token 不可用', 300);
    }
    var user = req.session.user_rows;
    that.connect(( err , db , conn ) => {
        if( that.isEmpty(body.id) || that.isEmpty(body.table_name) ){
            db.release();// 释放资源
            conn.end(); // 结束当前数据库链接
            return res.errorEnd('条件不能为空', 200);
        }
        var currentdate = moment().format('YYYY-MM-DD HH:ss:mm');
        var _table_name = body.table_name;// 表格名称
        // 找出活动的全部信息
        db.query("SELECT * FROM  ??  WHERE  id=? and boss_id=?",[_table_name,body.id,user.manager_id], function(err, row, fields) {
            // 数据获取失败
            if (err) {
                db.release();// 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd('没有找到可用数据', 200);
            }
            var up_product = row[0].product_quantity;// 剩余的产品
            var _product_id = row[0].product_id;
            if( up_product > 0 ){
                var  update_arr = {"product_quantity":0}// 活动的产品改为0
                // 找出产品的全部信息
                db.query("SELECT * FROM  db_product  WHERE  id=?",[_product_id], function(err, row1, fields) {
                    // 数据获取失败
                    if (err) {
                        db.release();// 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd('没有找到可用数据', 200);
                    }
                    // 把活动的剩余产品数量清空
                    db.query( "UPDATE ?? SET ? where id=? and boss_id=?" , [ _table_name,update_arr ,body.id,user.manager_id] , function( err, result , fields ){
                        var total = result.changedRows ; // 受影响的数据条数, ( 已删除的数据条数 )
                        if( err ){
                            db.release();// 释放资源
                            conn.end(); // 结束当前数据库链接
                            db.release();// 释放资源
                            return res.errorEnd('更新数据失败!!', 200);
                        }
                        if( !total ){
                            db.release();// 释放资源
                            conn.end(); // 结束当前数据库链接
                            db.release(); // 释放资源
                            return res.errorEnd('没有找到可操作的数据!!', 200);
                        }
                        var _update = Number(up_product) + Number(row1[0].stock);// 活动剩余产品加回产品数量
                        // 修改产品表的产品库存数
                        db.query( "UPDATE db_product SET stock=? where id=? " , [_update,_product_id] , function( err, result , fields ){
                            var total = result.changedRows ; // 受影响的数据条数, ( 已删除的数据条数 )
                            if( err ){
                                db.release();// 释放资源
                                conn.end(); // 结束当前数据库链接
                                db.release();// 释放资源
                                return res.errorEnd('更新数据失败!!', 200);
                            }
                            if( !total ){
                                db.release();// 释放资源
                                conn.end(); // 结束当前数据库链接
                                db.release(); // 释放资源
                                return res.errorEnd('没有找到可操作的数据!!', 200);
                            }
                            db.commit();
                            db.release(); // 释放资源
                            conn.end(); // 结束当前数据库链接
                            return res.successEnd(up_product);
                        });
                    });
                });
            }else{
                // 这个打印, 只会出现在主程序的控制台中
                db.release(); // 释放资源
                conn.end(); // 结束当前数据库链接
                return res.successEnd("剩余产品数量为0");
            }
        })
    });
}
