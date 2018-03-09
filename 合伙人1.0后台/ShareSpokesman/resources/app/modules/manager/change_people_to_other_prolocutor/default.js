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

            if(that.isEmpty(body.pid) ){
                db.rollback();
                db.release();// 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd('转移人不能为空', 200);
            }
            if(that.isEmpty(body.pid_new) ){
                db.rollback();
                db.release();// 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd('被转移人不能为空', 200);
            }
            if(body.pid_new==body.pid){
                db.rollback();
                db.release();// 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd('同一个人不能转移', 200);
            }
            db.query("select * from  db_people where id =? ",[body.pid], function(err, people, fields) {
                // 数据获取失败
                if( err ){
                    db.rollback();
                    db.release();// 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd('查询转移人失败!!', 200);
                }

                
                db.query("select * from  db_people where id =? ",[body.pid_new], function(err, people_new, fields) {
                    // 数据获取失败
                    if( err ){
                        db.rollback();
                        db.release();// 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd('查询被转移人失败!!', 200);
                    }
                    // if(people[0].shopowner_id!=people_new[0].shopowner_id){
                    //     db.rollback();
                    //     db.release();// 释放资源
                    //     conn.end(); // 结束当前数据库链接
                    //     return res.errorEnd('必须是一个店才能转移代言人！', 200);
                    // }

                    if(people[0].is_shopowner=='1'||people[0].is_manager=='1'){
                        db.rollback();
                        db.release();// 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd('店长或老板不能转出下级代言人！', 200);
                    }
                    db.query("update db_people set prolocutor_id =? where prolocutor_id=? and id <>? and is_prolocutor='1' ",[body.pid_new,body.pid,body.pid], function(err, people_update, fields) {
                        // 数据获取失败
                        if( err ){
                            db.rollback();
                            db.release();// 释放资源
                            conn.end(); // 结束当前数据库链接
                            return res.errorEnd('查询转移人失败!!', 200);
                        }
                        db.query("select b.id,b.shop_name,a.realname from  db_shopowner a left join  db_shop b on a.shop_id=b.id where a.id =? ",[people[0].shopowner_id], function(err, shopowner, fields) {
                        // 数据获取失败
                            if( err ){
                                db.rollback();
                                db.release();// 释放资源
                                conn.end(); // 结束当前数据库链接
                                return res.errorEnd('查询原店铺失败!!', 200);
                            }
                            db.query("select b.id,b.shop_name,a.realname from  db_shopowner a left join  db_shop b on a.shop_id=b.id where a.id =? ",[people_new[0].shopowner_id], function(err, shopowner_new, fields) {
                                // 数据获取失败
                                if( err ){
                                    db.rollback();
                                    db.release();// 释放资源
                                    conn.end(); // 结束当前数据库链接
                                    return res.errorEnd('查询新店铺失败!!', 200);
                                }

                                var shop_old_name = shopowner[0].shop_name || shopowner[0].realname + "的店";
                                var shop_new_name = shopowner_new[0].shop_name || shopowner_new[0].realname + "的店";

                                var data = {

                                manager_id : people[0].manager_id,
                                shopowner_id:people[0].shopowner_id,
                                to_shopowner_id : people_new[0].shopowner_id,
                                people_id:body.pid,
                                to_people_id:body.pid_new,
                                create_time:new Date().getTime()/1000,
                                status:1,
                                remark:shop_old_name+"的"+people[0].nickname+"把下级代言人转给了"+shop_old_name+"的"+people_new[0].nickname,
                                type:3,
                                shop_name:shop_old_name,
                                shop_name_new:shop_new_name,
                                people_name:people[0].nickname,
                                mobile:people[0].mobile,
                                people_name_new:people_new[0].nickname,
                                mobile_new:people_new[0].mobile
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
                                    return res.successEnd('转移下级代言人成功！', 0);
                                });


                            });
                        });    
          

                    });

           



                    
                    

                });
            });
     

        });
    
    
    });
}
