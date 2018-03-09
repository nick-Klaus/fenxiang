/**
 * Created by Administrator on 2017/8/16.
 * 所有活动的获取 视图
 */
 const crypto = require('crypto');
'use strict';
exports.ready = (req, res, that) => {

    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query; // 当前请求传递过来的 GET 数据,
    const body = req.body; // 当前请求传递过来的 POST 数据
    that.connect(( err , db , conn ) => {
        db.beginTransaction(function(err){
            if(req.session.user_rows = null){
                 return res.errorEnd('当前请求不存在 Token 或 Token 不可用', 301);
            }
            if(req.session.user_token != body.token){
                 return res.errorEnd('当前请求不存在 Token 或 Token 不可用', 300);
            }
            if(  that.isEmpty(body.password) ){
                return res.errorEnd('密码不能为空', 200);
            }
            if( that.isEmpty(body.shopowner_id) ){
                return res.errorEnd('店长不能为空', 200);
            }
            db.query(" select * from   `db_shopowner`  where     id =? ",[body.shopowner_id], function(err, row, fields) {
                // 数据获取失败
                if (err) {
                    return res.errorEnd('没有找到店长数据', 200);
                }
                var password_hash = row[0].password_hash;
                var pa = crypto.createHash('md5').update( body.password.toUpperCase()+password_hash ).digest('hex') 
                db.query(" update   `db_shopowner`  set password =? where     id =? ",[pa,body.shopowner_id], function(err, row, fields) {
                    // 数据获取失败
                    if (err) {
                        return res.errorEnd('没有找到店长数据', 200);
                    }
                    db.commit();
                    db.release(); // 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.successEnd('修改密码成功!', 0);
       
                })
       
            })
        });
    });
}
