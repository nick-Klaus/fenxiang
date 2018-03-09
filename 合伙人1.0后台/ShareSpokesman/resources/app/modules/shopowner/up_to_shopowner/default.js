/**
 * Created by Administrator on 2017/8/16.
 * 所有活动的获取 视图
 */
'use strict';
exports.ready = (req, res, that) => {

    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query; // 当前请求传递过来的 GET 数据,
    const body = req.body; // 当前请求传递过来的 POST 数据
    that.connect(( err , db , conn ) => {
        db.beginTransaction(function(err){
            if(req.session.user_rows = null){
                db.rollback();
                db.release();// 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd('当前请求不存在 Token 或 Token 不可用', 300);
            }
            if(req.session.user_token != body.token){
                db.rollback();
                db.release();// 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd('当前请求不存在 Token 或 Token 不可用', 300);
            }
            if(that.isEmpty(body.openid) ){
                db.rollback();
                db.release();// 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd('openid不能为空', 200);
            }
            if(that.isEmpty(body.manager_id) ){
                db.rollback();
                db.release();// 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd('老板不能为空', 200);
            }
            if(that.isEmpty(body.pid) ){
                db.rollback();
                db.release();// 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd('个人不能为空', 200);
            }
  

            var shop = {

                    manager_id : body.manager_id,
                    shop_name:body.nickname+"的店"
                 
                }; 
            db.query("INSERT INTO `db_shop` SET ? ",shop, function(err, shop_back, fields) {
                // 数据获取失败
                if( err ){
                    db.rollback();
                    db.release();// 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd('创建数据失败!!', 200);
                }
                var data = {

                    manager_id : body.manager_id,
                    shop_id:shop_back.insertId,
                    status : 1,
                    openid:body.openid,
                    realname:body.nickname,
                    password_hash:Math.random().toString(12).substr(0,16),

                 
                };
                db.query("INSERT INTO `db_shopowner` SET ? ",data, function(err, result, fields) {
                // 数据获取失败
                    if( err ){
                        db.rollback();
                        db.release();// 释放资源
                        conn.end(); // 结束当前数据库链接
                            return res.errorEnd('创建数据失败!!', 200);
                    }

                    if(result){

                         db.query(" update db_people set shopowner_id =? ,is_shopowner = '1' ,is_prolocutor='1',is_clerk='1',prolocutor_id=?,clerk_id=? where id=? ",[result.insertId,body.pid,body.pid,body.pid], function(err, result1, fields) {
                            // 数据获取失败
                            if (err) {
                                db.rollback();
                                db.release();// 释放资源
                                conn.end(); // 结束当前数据库链接
                                return res.errorEnd('修改个人信息失败', 200);
                            }
                            db.query(" update db_people set shopowner_id =? ,clerk_id=? where prolocutor_id=? ",[result.insertId,body.pid,body.pid], function(err, result2, fields) {
                                // 数据获取失败
                                if (err) {
                                    db.rollback();
                                    db.release();// 释放资源
                                    conn.end(); // 结束当前数据库链接
                                    return res.errorEnd('修改下级个人信息失败', 200);
                                }
                                db.commit();
                                db.release(); // 释放资源
                                conn.end(); // 结束当前数据库链接
                                return res.successEnd('升级为店长成功！', 0);
                            })
       
                        })
                  
                    }
           
                })
            })

        });
    
    
    });
}
