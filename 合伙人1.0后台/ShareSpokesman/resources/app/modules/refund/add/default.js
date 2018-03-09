
const request = require('request');
const moment = require('moment');
const crypto = require('crypto');

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

                if(  that.isEmpty(body.user_id) ){
                    db.rollback();
                    db.release();// 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd('用户不能为空', 200);
                }
               
                if(  that.isEmpty(body.id) ){
                    db.rollback();
                    db.release();// 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd('退款订单ID不能为空', 200);
                }
                db.query("SELECT * from  `db_order` where     (pay_status=3 or pay_status=2) and cid=? and id=?   ",[body.user_id,body.id], function(err, order, fields) {

                // 数据获取失败
                    if (err) {
                        db.rollback();
                        db.release();// 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd('没有找到订单数据', 200);
                    }
                    //生成退款申请
                    if(order.length>0&&(order[0].pay_status==2||order[0].pay_status==3)&&order[0].payment_no!=""){

                        var refund = {
                    
                            manager_id : order[0].mid,
                            create_time: new Date()/1000,
                            channel: "JHKJ微信公账号支付",
                            status: 0,
                            body:"直接到账",
                            real_pay:order[0].need_pay,
                            user_id:order[0].cid,
                            payment_no:order[0].payment_no,
                            order_id:order[0].id,
                            order_no:order[0].order_no
                            
                        };

                        db.query(" insert into  `db_manager_refund` set ?",[refund], function(err, row, fields) {
                                // 数据获取失败
                                if (err) {
                                    db.rollback();
                                    db.release();// 释放资源
                                    conn.end(); // 结束当前数据库链接
                                    return res.errorEnd('插入退款记录失败', 200);
                                }

                                //单品
                                if(order[0].activity_type==1){

                                    db.query(" update  db_order   set  pay_status=4 where id =? ",[order[0].id], function(err, row, fields) {
                                        // 数据获取失败
                                        if (err) {
                                            db.rollback();
                                            db.release();// 释放资源
                                            conn.end(); // 结束当前数据库链接
                                            return res.errorEnd('更新退款状态失败', 200);
                                        }
                                        db.commit();
                                        db.release(); // 释放资源
                                        conn.end(); // 结束当前数据库链接
                                        return res.successEnd('申请退款成功', 0);
                               
                                    })  
                                //拼团
                                }else if(order[0].activity_type==4){
                                    var db_order = [];
                                    db_order[0] = order[0];

                                    //正常订单
                                    if(db_order[0].special_type==0){
                                        

                                        db.query("update  db_order   set  pay_status=4  where id =?   ",[body.id], function(err, update_end, fields) {
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
                                            return res.successEnd('申请退款成功88888888', 0);
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
                                                        
                                                        db.query("update  db_order   set  pay_status=4,  special_type =0   where id =?   ",[body.id], function(err, update_end, fields) {
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
                                                                return res.successEnd('申请退款成功811', 0);
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
                                                                    db.query("update  db_order   set pay_status=4,  special_type =0 where id =?   ",[body.id], function(err, update_end, fields) {
                                                                        // 数据获取失败
                                                                        if (err) {
                                                                            db.rollback();
                                                                            db.release();// 释放资源
                                                                            conn.end(); // 结束当前数据库链接
                                                                            return res.errorEnd("更新为正常订单失败!!", 200);
                                                                        }
                                                                        
                                                                        //更改活动正在参加人数-1
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
                                                                                return res.successEnd('申请退款成功1-1', 0);
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
                                                                                            //退款后循环
                                                                                            forEach(index+1);
                                                                                                  
                                                                                           
                                                                                        })

                                                                                        
                                                                                    }else{
                                                                                        //未支付的订单直接循环
                                                                                        forEach(index+1);
                                                                                    }

                                                                                });
                                                                                

                                                                                
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
















                                }else{
                                    db.rollback();
                                    db.release();// 释放资源
                                    conn.end(); // 结束当前数据库链接
                                    return res.errorEnd('活动类型错误', 200);
                                }
                           
                        })

                    //未审批的直接退款
                    }else{
                        db.rollback();
                        db.release();// 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd('没有找到订单数据', 200);
                    }

           
                })
           
            })

                
                    
                
			
                

   

        

           


            
      

           


    
 
    
    
    });
}
