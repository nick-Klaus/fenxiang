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

    if(req.session.user_rows = null){
        return res.errorEnd('当前请求不存在 Token 或 Token 不可用', 300);
    }
    if(req.session.user_token != body.token){
        return res.errorEnd('当前请求不存在 Token 或 Token 不可用', 300);
    } 

    if(that.isEmpty(body.pid) ){
        return res.errorEnd('个人不能为空', 200);
    }
    if(that.isEmpty(body.manager_pid) ){
        return res.errorEnd('老板用户不能为空', 200);
    }
    if(body.manager_pid==body.pid ){
        return res.errorEnd('老板直属店长不可降级', 200);
    }

    that.connect(( err , db , conn ) => {
        db.beginTransaction(function(err){

 



            db.query("SELECT * from  `db_people` where  is_shopowner='1' and    id =? ",[body.pid], function(err, people, fields) {
                // 数据获取失败
                if (err||people.length==0) {
                    db.rollback();
                    db.release();// 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd('用户不存在', 200);
                }
                db.query("SELECT * from  `db_people` where is_manager='1' and    id =? ",[body.manager_pid], function(err, manager_people, fields) {
                    // 数据获取失败
                    if (err||manager_people.length==0) {
                        db.rollback();
                        db.release();// 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd('老板用户不存在', 200);
                    }
                    //店长降级
                    db.query("update db_people set is_shopowner='0' , clerk_id=? , prolocutor_id=? where  id =? ",[body.manager_pid,body.manager_pid,body.pid], function(err, row, fields) {
                        // 数据获取失败
                        if (err) {
                            db.rollback();
                            db.release();// 释放资源
                            conn.end(); // 结束当前数据库链接
                            return res.errorEnd('店长降级失败', 200);
                        }


                        db.query("select * from db_shopowner where id= ? ",[people[0].shopowner_id], function(err, shopowner, fields) {
                            // 数据获取失败
                            if (err) {
                                db.rollback();
                                db.release();// 释放资源
                                conn.end(); // 结束当前数据库链接
                                return res.errorEnd('原店长信息查询失败', 200);
                            }
                            db.query("delete from  db_shop where id= ? ",[shopowner[0].shop_id], function(err, row, fields) {
                                // 数据获取失败
                                if (err) {
                                    db.rollback();
                                    db.release();// 释放资源
                                    conn.end(); // 结束当前数据库链接
                                    return res.errorEnd('原店铺信息删除失败', 200);
                                }
                                db.query("call update_activity_all_shopowner_downgrade(?,?)",[people[0].shopowner_id,manager_people[0].shopowner_id], function(err, row, fields) {
                                    // 数据获取失败
                                    if (err) {
                                        db.rollback();
                                        db.release();// 释放资源
                                        conn.end(); // 结束当前数据库链接
                                        return res.errorEnd('原店长活动记录转移到老板直属店铺失败', 200);
                                    }
                                    

                                    //卡券转移，判断是否在新店已存在
                                    db.query("  select id from db_coupons_access  where  shopowner_id =?  and coupons_id not in (select coupons_id from db_coupons_access where shopowner_id=?) ",[people[0].shopowner_id,manager_people[0].shopowner_id], function(err, coupons_access_ids, fields) {
                                        // 数据获取失败
                                        if (err) {
                                            db.rollback();
                                            db.release();// 释放资源
                                            conn.end(); // 结束当前数据库链接
                                            return res.errorEnd('查询可转移卡券失败', 200);
                                        }

                                        //有卡券要转移
                                        if(coupons_access_ids.length>0){
                                            var coupons_ids="";
                                            for(var i=0;i<coupons_access_ids.length;i++){
                                                coupons_ids+=coupons_access_ids[i].id+",";
                                            }
                                            coupons_ids=coupons_ids.substring(0,coupons_ids.length-1);
 
                                            //转移卡券
                                            db.query("   update db_coupons_access set shopowner_id=? where id in (  "+coupons_ids+" )",[manager_people[0].shopowner_id], function(err, coupons_access_ids_update, fields) {
                                                // 数据获取失败
                                                if (err) {
                                                    db.rollback();
                                                    db.release();// 释放资源
                                                    conn.end(); // 结束当前数据库链接
                                                    return res.errorEnd('转移卡券失败', 200);
                                                }
                                                //删除重复卡券
                                                db.query("   delete from  db_coupons_access where shopowner_id =?  ",[people[0].shopowner_id], function(err, coupons_access_ids_delete, fields) {
                                                    // 数据获取失败
                                                    if (err) {
                                                        db.rollback();
                                                        db.release();// 释放资源
                                                        conn.end(); // 结束当前数据库链接
                                                        return res.errorEnd('转移卡券失败', 200);
                                                    }
                                                    db.commit();
                                                    db.release();// 释放资源
                                                    conn.end(); // 结束当前数据库链接                                                   
                                                    return res.successEnd("降级成功!" ,0 );
                                                });
                                            });
                                        }else{

                                            db.commit();
                                            db.release();// 释放资源
                                            conn.end(); // 结束当前数据库链接                                                   
                                            return res.successEnd("降级成功!" ,0 );
                                        }
                    
                                    });
                    
                                });
                
                            });
            
                        });

        
                    });
        
                });
    
            });
           

        });
    
    
    });
}
