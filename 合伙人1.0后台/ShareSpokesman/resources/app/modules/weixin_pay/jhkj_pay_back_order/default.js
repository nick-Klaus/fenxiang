
const request = require('request');
const moment = require('moment');
const crypto = require('crypto');

'use strict';
exports.ready = (req, res, that) => {

    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query; // 当前请求传递过来的 GET 数据,
    const body = req.body; // 当前请求传递过来的 POST 数据
    that.connect(( err , db , conn ) => {

            
            var payment_no = body.payment_no;
            var time = body.time;
            var token = body.token;
            var order_no = body.order_no;
       

              
                var sign=(body.fee)+body.order_no+"w*2*b^dHWo1_";
                
                sign=crypto.createHash('md5').update( sign ).digest('hex');
                
                sign=crypto.createHash('md5').update( time + sign ).digest('hex');
               

                var need_pay = parseFloat(body.fee)/100.0;
                var real_pay = parseFloat(body.rate_payment)/100.0;
                //验证成功开始更新订单支付记录
                if(sign==token){


                    db.query("SELECT * from  `db_order` where     order_no =?   and  need_pay=?  and pay_status=1 ",[body.order_no,need_pay], function(err, order, fields) {

                    // 数据获取失败
                        if (err) {
                            db.release(); // 释放资源
                            conn.end(); // 结束当前数据库链接
                            return res.errorEnd('没有找到订单数据', 200);
                        }

                        if(order.length>0){


                            db.query(" update  `db_order` set pay_status = 2 , pay_time=unix_timestamp(now()) , payment_no=?,real_pay=? where     order_no =?   and  need_pay=? ",[payment_no,real_pay,body.order_no,need_pay], function(err, row, fields) {
                                // 数据获取失败
                                if (err) {
                                    db.release(); // 释放资源
                                    conn.end(); // 结束当前数据库链接
                                    return res.errorEnd('没有找到可用数据', 200);
                                }
                                var activity_table = "";
                                if(order[0].activity_type==1){
                                    activity_table = " db_single_product ";
                                }else if(order[0].activity_type==2){
                                    activity_table = " db_bargain ";
                                }else if(order[0].activity_type==4){
                                    activity_table = " db_fight_groups ";
                                }else if(order[0].activity_type==6){
                                    activity_table = " db_leaflet ";
                                }else{
                                    db.rollback();
                                    db.release();// 释放资源
                                    conn.end(); // 结束当前数据库链接
                                    return res.errorEnd('此活动类型不能补充资金!!', 200);
                                }

                                //商品数量退回
                                db.query(" update "+activity_table+" set product_quantity=product_quantity-1 where id=? ",[order[0].aid], function(err, activity, fields) {
                
                                    // 数据获取失败
                                    if (err) {
                                        db.rollback();
                                        db.release();// 释放资源
                                        conn.end(); // 结束当前数据库链接
                                        return res.errorEnd('还原产品数量失败', 200);
                                    }
                                
                                    db.commit();
                                    db.release(); // 释放资源
                                    conn.end(); // 结束当前数据库链接
                                    return res.successEnd('订单支付更新成功', 0);
                   
                                })

                           
                            })
                        }else{
                            db.release(); // 释放资源
                            conn.end(); // 结束当前数据库链接
                            return res.successEnd("没有找到对应订单！");
                        }
               
                    })
                    
                }
			
                

   

        

           


            
      

           


    
 
    
    
    });
}
