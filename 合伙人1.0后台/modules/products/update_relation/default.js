/**
 * Created by Administrator on 2017/8/9.
 *  活动的作用区域的修改
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
    if( body.update.length<=0 ){
        return res.errorEnd('店铺id不存在', 200);
    }
    if( !body.product_id ){
        return res.errorEnd('产品id不存在', 200);
    }
    that.connect(( err , db , conn ) => {
        // 更新数据
        var date_time = moment().format('YYYY-MM-DD h:mm:ss');
        // 获取活动数据
        db.query("select * from db_product  where  id = ? ",[body.product_id], function(err, row, fields) {
            // 数据获取失败
            if (err) {
                db.rollback();
                db.release();// 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd('没有找到可用数据', 200);
            }
            var db_product = row[0];// 其中一条数据
            var top_shopowner_id = db_product.sid;
            // 删除历史数据
            db.query( "DELETE FROM db_product_shopowner_relation WHERE product_id = ? " , [ body.product_id ] , function( err, result , fields ){
                var total = result.affectedRows; // 受影响的数据条数, ( 已删除的数据条数 )
                if( err ){
                    db.release();// 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd('删除数据失败!!', 200);
                }
                // if( !total ){
                //     db.release();// 释放资源
                //     conn.end(); // 结束当前数据库链接
                //     return res.errorEnd('没有找到可操作的数据!!', 200);
                // }
                var item = body.update;
                var len = item.length
                function forEach(index){
                    if( index >= len  ){
                        db.commit();
                        db.release(); // 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.successEnd('添加成功!!');
                    }
                    var shopowner_obj = {
                        "product_id":body.product_id,
                        "boss_id" : db_product.mid,
                        "shopowner_id": item[index].shopowner_id,

                        "top_shopowner_id": top_shopowner_id,
                        "addtime" : new Date().getTime()/100
                    }
                    // 添加关系表
                    db.query( "INSERT INTO `db_product_shopowner_relation` SET ?" , shopowner_obj , function( err, result , fields ){
                        if( err ){
                            // 数据插入失败, 回滚
                            db.rollback();
                            db.release();// 释放资源
                            conn.end(); // 结束当前数据库链接
                            return res.errorEnd('添加失败1', 200);
                        }
                        forEach(index+1);
                    });
                }
                forEach(0);
            });
        });
    });
}
