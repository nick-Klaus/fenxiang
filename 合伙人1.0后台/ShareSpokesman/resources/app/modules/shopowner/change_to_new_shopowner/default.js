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

            if(that.isEmpty(body.shopowner_pid) ){
                db.rollback();
                db.release();// 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd('原店长不能为空', 200);
            }
            if(  that.isEmpty(body.shopowner_new_pid) ){
                db.rollback();
                db.release();// 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd('新店长不能为空', 200);
            }

            db.query("select * from  db_people where id =? ",[body.shopowner_pid], function(err, shopowner_p, fields) {
                // 数据获取失败
                if( err ){
                    db.rollback();
                    db.release();// 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd('查询原店长失败!!', 200);
                }
                db.query("select * from  db_people where id =? ",[body.shopowner_new_pid], function(err, shopowner_new_p, fields) {
                    // 数据获取失败
                    if( err ){
                        db.rollback();
                        db.release();// 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd('查询新店长失败!!', 200);
                    }


                    if(shopowner_new_p[0].is_shopowner=='1'){
                        db.rollback();
                        db.release();// 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd('已经是店长！', 200);
                    }

                    if(shopowner_p[0].is_manager=='1'){
                        db.rollback();
                        db.release();// 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd('直属店长不能更换！', 200);
                    }
                    if(shopowner_p[0].shopowner_id!=shopowner_new_p[0].shopowner_id||shopowner_p[0].manager_id!=shopowner_new_p[0].manager_id){
                        db.rollback();
                        db.release();// 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd('不同老板或不在一个店里！', 200);
                    }

                    db.query("update db_people set is_shopowner='1' ,is_prolocutor='1' where id =? ",[body.shopowner_new_pid], function(err, shopowner_p_update, fields) {
                        // 数据获取失败
                        if( err ){

                            db.rollback();
                            db.release();// 释放资源
                            conn.end(); // 结束当前数据库链接
                            return res.errorEnd('更新新店长失败!!', 200);
                        }
                        db.query("update db_people set is_shopowner='0' where id =? ",[body.shopowner_pid], function(err, shopowner_new_p_update, fields) {
                            // 数据获取失败
                            if( err ){
                                db.rollback();
                                db.release();// 释放资源
                                conn.end(); // 结束当前数据库链接
                                return res.errorEnd('更新原店长失败!!', 200);
                            }





                            db.query("select b.id,b.shop_name from  db_shopowner a left join  db_shop b on a.shop_id=b.id where a.id =? ",[shopowner_p[0].shopowner_id], function(err, shop, fields) {
                            // 数据获取失败
                                if( err ){
                                    db.rollback();
                                    db.release();// 释放资源
                                    conn.end(); // 结束当前数据库链接
                                    return res.errorEnd('创建人员职位变化记录失败!!', 200);
                                }
                                var data = {

                                    manager_id : shopowner_p[0].manager_id,
                                    shopowner_id:shopowner_p[0].shopowner_id,
                                    to_shopowner_id : shopowner_p[0].shopowner_id,
                                    people_id:shopowner_p[0].id,
                                    to_people_id:shopowner_new_p[0].id,
                                    create_time:new Date().getTime()/1000,
                                    status:1,
                                    remark:shop[0].shop_name+"店长"+shopowner_p[0].nickname+"更换为"+shopowner_new_p[0].nickname,
                                    type:1                             
                                };
                                db.query("INSERT INTO `db_people_change_record` SET ? ",data, function(err, result, fields) {
                                // 数据获取失败
                                    if( err ){
                                        db.rollback();
                                        db.release();// 释放资源
                                        conn.end(); // 结束当前数据库链接
                                        return res.errorEnd('创建人员职位变化记录失败!!', 200);
                                    }


                                    db.commit();
                                    db.release(); // 释放资源
                                    conn.end(); // 结束当前数据库链接
                                    return res.successEnd('更换店长成功！', 0);
                                });
                            });
  


                        });
                    });

                    
                    

                });
            });
     

        });
    
    
    });
}
