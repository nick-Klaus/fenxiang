'use strict';
exports.ready = (req, res, that) => {

    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query; // 当前请求传递过来的 GET 数据,
    const body = req.body; // 当前请求传递过来的 POST 数据

    // 链接数据库
    // 链接 / 操作数据库
    // 有不懂, 看这个 http://blog.csdn.net/zxsrendong/article/details/17006185
    that.connect((err, db,conn) => {

        db.beginTransaction(function(err){

            console.log("2222222222");
            // 删除全部产品数据   实际是修改当前的订单状态
            
            console.log("11111111111");
            if(body.activity_type == 1||body.activity_type == 2){
                db.query(  "UPDATE ?? SET status = 999  WHERE id = ? " , [ 'db_order' ,  body.id ] , function( err, result , fields ){
                    if( err ){
                        db.rollback();
                        db.release();// 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd('数据获取失败!!', 200);
                    }
                    db.commit();
                    db.release(); // 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.successEnd( '成功删除数据 :7' );
                });
            }else if(body.activity_type == 4){
                //团长取消订单，会自动取消团员订单，且订单更新为普通订单，同时删除所有活动user信息  
                //队员取消订单，订单更新为普通订单，同时删除自己活动user信息
                db.query(  "select * from  db_order where id=? and pay_status=1 " , [body.id] , function( err, db_order , fields ){
                    if( err ){
                        db.rollback();
                        db.release();// 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd('数据获取失败!!1', 200);
                    }
                    
                    if(db_order.length==0){
                        db.rollback();
                        db.release();// 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd('数据获取失败!!2', 200);
                    }
                    //正常订单
                    if(db_order[0].special_type==0){
                        

                        db.query("update  db_order   set  status = 999  where id =?   ",[body.id], function(err, update_end, fields) {
                            // 数据获取失败
                            if (err) {
                                db.rollback();
                                db.release();// 释放资源
                                conn.end(); // 结束当前数据库链接
                                return res.errorEnd("更新为正常订单失败!!", 200);
                            }
                            db.commit();
                            db.release(); // 释放资源
                            conn.end(); // 结束当前数据库链接
                            return res.successEnd( '成功删除数据 : 88888' );
                        });
                    }else{
                        //拼团订单
                        if(db_order[0].activity_user_id==null||db_order[0].activity_user_id==0){
                            db.rollback();
                            db.release();// 释放资源
                            conn.end(); // 结束当前数据库链接
                            return res.errorEnd('数据异常,订单未绑定拼团信息！', 200);
                        }
                        console.log("33333");
                        db.query("select * from  db_fight_groups_user where id=?" , [db_order[0].activity_user_id] , function( err, fight_groups_user , fields ){
                            if( err ){
                                db.rollback();
                                db.release();// 释放资源
                                conn.end(); // 结束当前数据库链接
                                return res.errorEnd('获取拼团用户数据失败!!', 200);
                            }
                            if(fight_groups_user.length==0){
                                db.rollback();
                                db.release();// 释放资源
                                conn.end(); // 结束当前数据库链接
                                return res.errorEnd('数据获取失败!!3', 200);
                            }
                            //拼团成功，无需修改任何拼团数据！  前后矛盾           (group_status==1,special_type!=0这种情况不存在，拼团成功special_type==0)
                            if(fight_groups_user[0].group_status==1){
                                db.rollback();
                                db.release();// 释放资源
                                conn.end(); // 结束当前数据库链接
                                return res.errorEnd('拼团状态异常!!7878', 200);
                            }else{
                                //拼团中的订单（未满员）
                                //删除自身拼团用户数据
                                db.query("delete from   db_fight_groups_user where id=?" , [db_order[0].activity_user_id] , function( err, fight_groups_user_delete , fields ){
                                    if( err ){
                                        db.rollback();
                                        db.release();// 释放资源
                                        conn.end(); // 结束当前数据库链接
                                        return res.errorEnd('删除拼团用户数据失败!!', 200);
                                    }
                                    console.log("4444");
                                    //如果取消的是团员订单,直接结束
                                    if(fight_groups_user[0].top_id!=0){
                                        
                                        db.query("update  db_order   set  status = 999,  special_type =0  where id =?   ",[body.id], function(err, update_end, fields) {
                                            // 数据获取失败
                                            if (err) {
                                                db.rollback();
                                                db.release();// 释放资源
                                                conn.end(); // 结束当前数据库链接
                                                return res.errorEnd("更新为正常订单失败!!", 200);
                                            }
                                            //更改活动正在参加人数-1
                                            db.query("update  db_fight_groups   set  user_cj = user_cj-1 where id =?   ",[db_order[0].aid], function(err, db_fight_groups_update, fields) {
                                                // 数据获取失败
                                                if (err) {
                                                    db.rollback();
                                                    db.release();// 释放资源
                                                    conn.end(); // 结束当前数据库链接
                                                    return res.errorEnd("更新参加人数失败!!", 200);
                                                }
                                                db.commit();
                                                db.release(); // 释放资源
                                                conn.end(); // 结束当前数据库链接
                                                return res.successEnd( '成功删除数据 :0 ' );
                                            });
                                        });
                                    }else{
                                        //如果取消的是团长订单
                                        //查其他团员的用户信息
                                        db.query("select * from  db_fight_groups_user where top_id=?" , [db_order[0].activity_user_id] , function( err, fight_groups_user_children , fields ){
                                            if( err ){
                                                db.rollback();
                                                db.release();// 释放资源
                                                conn.end(); // 结束当前数据库链接
                                                return res.errorEnd('获取团员拼团用户数据失败!!', 200);
                                            }
                                            //没有其他团员
                                        
                                            //有其他团员
                                            //删除拼团用户信息，取消订单或退款（每个团员）
                                            var  down_num=1+fight_groups_user_children.length;
                                            var  len = fight_groups_user_children.length;
                                            function forEach(index) {
                                                if( index >= len  ){

                                                    //最后更新自己为正常订单
                                                    db.query("update  db_order   set status = 999,  special_type =0 where id =?   ",[body.id], function(err, update_end, fields) {
                                                        // 数据获取失败
                                                        if (err) {
                                                            db.rollback();
                                                            db.release();// 释放资源
                                                            conn.end(); // 结束当前数据库链接
                                                            return res.errorEnd("更新为正常订单失败!!", 200);
                                                        }
                                                        
                                                        //更改活动正在参加人数-N
                                                        db.query("update  db_fight_groups   set  user_cj = user_cj-? where id =?   ",[down_num,db_order[0].aid], function(err, db_fight_groups_update, fields) {
                                                            // 数据获取失败
                                                            if (err) {
                                                                db.rollback();
                                                                db.release();// 释放资源
                                                                conn.end(); // 结束当前数据库链接
                                                                return res.errorEnd("更新参加人数失败!!", 200);
                                                            }
                                                            //更新db_fight_groups_frist_user拼团活动临时表
                                                            db.query(" update  db_fight_groups_frist_user set user_fx=?,user_ck=?,user_zf=?  where user_id=? and fight_groups_id=?  ",[fight_groups_user[0].user_fx,fight_groups_user[0].user_ck,fight_groups_user[0].user_zf,fight_groups_user[0].user_id,fight_groups_user[0].fight_groups_id], function(err, db_fight_groups_frist_user, fields) {
                                                                // 数据获取失败
                                                                if (err) {
                                                                    db.rollback();
                                                                    db.release();// 释放资源
                                                                    conn.end(); // 结束当前数据库链接
                                                                    return res.errorEnd('更新团长db_fight_groups_frist_user拼团活动临时表失败', 200);
                                                                }
                                                                db.commit();
                                                                db.release(); // 释放资源
                                                                conn.end(); // 结束当前数据库链接
                                                                return res.successEnd( '成功删除数据 1-1 ' );
                                                            });
                                                            
                                                        });
                                                    });


                                                    return;
                                                    
                                                }
                                                console.log("99999");
                                                //删除团员拼团用户数据
                                                db.query("delete from   db_fight_groups_user where id=? ",[fight_groups_user_children[index].id], function(err, fight_groups_user_children_delete, fields) {
                                                    // 数据获取失败
                                                    if (err) {
                                                        db.rollback();
                                                        db.release();// 释放资源
                                                        conn.end(); // 结束当前数据库链接
                                                        return res.errorEnd("删除团员拼团用户数据失败!!", 200);
                                                    }
                                                    //查询团员的订单
                                                    db.query(" select * from  db_order where id=?  ",[fight_groups_user_children[index].order_id], function(err, fight_groups_user_children_order, fields) {
                                                        // 数据获取失败
                                                        if (err) {
                                                            db.rollback();
                                                            db.release();// 释放资源
                                                            conn.end(); // 结束当前数据库链接
                                                            return res.errorEnd("查询团员订单数据失败", 200);
                                                        }
                                                        if(fight_groups_user_children_order.length==0){
                                                            db.rollback();
                                                            db.release();// 释放资源
                                                            conn.end(); // 结束当前数据库链接
                                                            return res.errorEnd('未查询到团员订单数据', 200);
                                                        }
                                                        var update_sql="";

                                                        //未支付订单，取消
                                                        if(fight_groups_user_children_order[0].pay_status==1){
                                                            
                                                            update_sql=" UPDATE db_order SET status = 999 ,special_type =0 WHERE id = ? ";

                                                            
                                                        }else if(fight_groups_user_children_order[0].pay_status==2){
                                                        //已支付订单，退款
                                                            update_sql=" update  db_order   set  pay_status=4 ,special_type =0 where id =? ";
                                                        
                                                        }else{
                                                        //订单支付状态异常
                                                            db.rollback();
                                                            db.release();// 释放资源
                                                            conn.end(); // 结束当前数据库链接
                                                            return res.errorEnd("团员订单支付状态异常", 200);
                                                        }

                                                        //更新订单数据
                                                        db.query(update_sql,[fight_groups_user_children[index].order_id], function(err, fight_groups_user_children_order_update, fields) {
                                                                // 数据获取失败
                                                                if (err) {
                                                                    db.rollback();
                                                                    db.release();// 释放资源
                                                                    conn.end(); // 结束当前数据库链接
                                                                    return res.errorEnd("更新团员订单状态失败", 200);
                                                                }




                                                                //更新db_fight_groups_frist_user拼团活动临时表
                                                                db.query(" update  db_fight_groups_frist_user set user_fx=?,user_ck=?,user_zf=?  where user_id=? and fight_groups_id=?  ",[fight_groups_user_children[index].user_fx,fight_groups_user_children[index].user_ck,fight_groups_user_children[index].user_zf,fight_groups_user_children[index].user_id,fight_groups_user_children[index].fight_groups_id], function(err, db_fight_groups_frist_user, fields) {
                                                                    // 数据获取失败
                                                                    if (err) {
                                                                        db.rollback();
                                                                        db.release();// 释放资源
                                                                        conn.end(); // 结束当前数据库链接
                                                                        return res.errorEnd('更新团员db_fight_groups_frist_user拼团活动临时表失败', 200);
                                                                    }
                                                                    //已支付订单继续走退款流程
                                                                    if(fight_groups_user_children_order[0].pay_status==2){
                                                                        
                                                                        var refund = {
                
                                                                            manager_id : fight_groups_user_children_order[index].mid,
                                                                            create_time: new Date()/1000,
                                                                            channel: "JHKJ微信公账号支付",
                                                                            status: 0,
                                                                            body:"直接到账",
                                                                            real_pay:fight_groups_user_children_order[index].need_pay,
                                                                            user_id:fight_groups_user_children_order[index].cid,
                                                                            payment_no:fight_groups_user_children_order[index].payment_no,
                                                                            order_id:fight_groups_user_children_order[index].id,
                                                                            order_no:fight_groups_user_children_order[index].order_no
                                                                            
                                                                        };

                                                                        db.query(" insert into  `db_manager_refund` set ?",[refund], function(err, refund, fields) {
                                                                            // 数据获取失败
                                                                            if (err) {
                                                                                db.rollback();
                                                                                db.release();// 释放资源
                                                                                conn.end(); // 结束当前数据库链接
                                                                                return res.errorEnd('插入团员退款记录失败', 200);
                                                                            }
                                                                            //未支付的订单直接循环
                                                                            forEach(index+1);
                                                  
                                                                        })

                                                                        
                                                                    }else{
                                                                        //未支付的订单直接循环
                                                                        forEach(index+1);
                                                                    }
                                                                      
                                                               
                                                                })

                                                                    

                                                                
                                                        });

                                                        



                                                    });
                                                    
                                                });
                                                
                                            }
                                            forEach(0);

                                           

                                            

                                        });
                                    }

                                });
                                
                                
                            }
                           

                        });
                            

                        

                    }


                });
            }else{

                db.rollback();
                db.release();// 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd("活动类型错误", 200);

            }
                

            

        });          

            
      
        
    });
}