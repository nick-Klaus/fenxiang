
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
