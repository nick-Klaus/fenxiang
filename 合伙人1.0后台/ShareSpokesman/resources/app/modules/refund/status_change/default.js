/**
 * Created by Administrator on 2017/8/16.
 * 所有 视图
 */
const moment = require('moment');

const request = require('request');
const crypto = require('crypto');
'use strict';
exports.ready = (req, res, that) => {

    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query; // 当前请求传递过来的 GET 数据,
    const body = req.body; // 当前请求传递过来的 POST 数据



    if(req.session.user_rows = null){
         return res.errorEnd('当前请求不存在 Token 或 Token 不可用', 301);
    }
    if(req.session.user_token != body.token){
         return res.errorEnd('当前请求不存在 Token 或 Token 不可用', 300);
    }
    if(that.isEmpty(body.id) ){
         return res.errorEnd('订单ID不能为空', 300);
    }



    that.connect(( err , db , conn ) => {
        db.beginTransaction(function(err){
           
                var _date = moment().format('YYYY-MM-DD HH:mm:ss');
                var _date_log = moment().format('YYYY-MM-DD');

            
                //查对应订单数据
                db.query(" select  * from db_manager_refund      where  status=0 and id=? ",[body.id], function(err, refund , fields) {
                    // 数据获取失败
                    if (err||refund.length==0) {
                        db.rollback();
                        db.release();// 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd('未查到退款信息', 200);
                    }


                    db.query(" select  * from db_order      where  pay_status=4 and status in (0,1) and  id=? ",[refund[0].order_id], function(err, order , fields) {
                        // 数据获取失败
                        if (err||order.length==0) {
                            db.rollback();
                            db.release();// 释放资源
                            conn.end(); // 结束当前数据库链接
                            return res.errorEnd('未查到退款订单信息', 200);
                        }


                        //查老板数据判断是否够金额退款
                        db.query(" select  * from db_manager  where id=? ",[refund[0].manager_id], function(err, manager, fields) {
                            // 数据获取失败
                            if (err) {
                                db.rollback();
                                db.release();// 释放资源
                                conn.end(); // 结束当前数据库链接
                                return res.errorEnd('查询老板失败', 200);
                            }
                            //老板ID
                            var manager_id = order[0].mid;
                            var amount =  manager[0].amount; 

                            var temp_status=order[0].status;
                            //够钱退款  或未审批
                            //通过审批的老板要
                            if((temp_status==1&&amount>=refund[0].real_pay)||temp_status==0){

                                var time_sign=parseInt(new Date().getTime()/1000);
                        
                                var sign=refund[0].payment_no+"9FuW8k*W3D";
                                
                                sign=crypto.createHash('md5').update( sign ).digest('hex');
                                
                                sign=crypto.createHash('md5').update( time_sign + sign ).digest('hex');

                                var tk = {

                                    out_trade_no:order[0].payment_no,            
                                    token : sign,
                                    time : time_sign
                
                                }; 
                                request.post({url:'http://weixin.echao.com/app/index.php?i=4&c=entry&do=MemberPayRefund&m=t_we_payment', form:tk}, function(error, response, tk) {
                                    if (error) {
                                        db.release(); // 释放资源
                                        conn.end(); // 结束当前数据库链接
                                        return res.errorEnd(error, 200);
                                    }
                                    tk =JSON.parse(tk);
                    
                                    //退款成功，更新订单
                                    if(tk.error_code==0){

                                        db.query(" update  `db_order` set pay_status = 5 ,status=1  where    id =? ",[refund[0].order_id], function(err, row, fields) {
                               
                                            // 数据获取失败
                                            if (err) {
                                                db.rollback();
                                                db.release();// 释放资源
                                                conn.end(); // 结束当前数据库链接
                                                return res.errorEnd('没有找到要更新的退款订单数据', 200);
                                            }
                                            //退款成功，更新退款记录
                                            db.query(" update  `db_manager_refund` set status = 1 , pay_time=unix_timestamp(now()),real_pay=? where      id =? ",[tk.data.result_fee/100,body.id], function(err, row, fields) {
                               
                                                // 数据获取失败
                                                if (err) {
                                                    db.rollback();
                                                    db.release();// 释放资源
                                                    conn.end(); // 结束当前数据库链接
                                                    return res.errorEnd('没有找到要更新的退款数据', 200);
                                                }
                                                var enchashment = {
                                                    openid:manager[0].openid,
                                                    manager_id :refund[0].manager_id,
                                                    shopowner_id:order[0].sid,
                                                    clerk_id:0,
                                                    prolocutor_id:order[0].pid,
                                                    spokesman_id:order[0].cid,
                                                    MONEY:refund[0].real_pay,
                                                    types:"订单退款支出",
                                                    type:5,
                                                    record:order[0].payment_no,
                                                    create_days:_date,
                                                    create_date:_date,
                                                    activity_id:order[0].aid,
                                                    activity_type:order[0].activity_type,
                                                    order_id:order[0].id
                                                };
                                                //退款成功，老板端插入退款记录
                                                //未审核无需生成退款记录(老板还没收到订单的钱)
                                                if(temp_status==0){

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
                                                    db.query(" update "+activity_table+" set product_quantity=product_quantity+? where id=? ",[order[0].number,order[0].aid], function(err, activity, fields) {
                                    
                                                        // 数据获取失败
                                                        if (err) {
                                                            db.rollback();
                                                            db.release();// 释放资源
                                                            conn.end(); // 结束当前数据库链接
                                                            return res.errorEnd('还原产品数量失败', 200);
                                                        }
                                                    
                                                        //更新支出表
                                                        db.commit();
                                                        db.release(); // 释放资源
                                                        conn.end(); // 结束当前数据库链接
                                                        return res.successEnd('退款成功！', 0);
                                       
                                                    })



                                                }else{

                                                    //已审核需要 支出记录
                                                    //退款成功，老板端插入退款支出记录
                                                    db.query(" insert into  db_manager_enchashment set ? ",[enchashment], function(err, row, fields) {
                                        
                                                        // 数据获取失败
                                                        if (err) {
                                                            console.log(this.sql);
                                                            db.rollback();
                                                            db.release();// 释放资源
                                                            conn.end(); // 结束当前数据库链接
                                                            return res.errorEnd('插入老板支出记录失败', 200);
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
                                                        db.query(" update "+activity_table+" set product_quantity=product_quantity+? where id=? ",[order[0].number,order[0].aid], function(err, activity, fields) {
                                        
                                                            // 数据获取失败
                                                            if (err) {
                                                                db.rollback();
                                                                db.release();// 释放资源
                                                                conn.end(); // 结束当前数据库链接
                                                                return res.errorEnd('还原产品数量失败', 200);
                                                            }
                                                            
                                                            //佣金退还老板，已从预收益转到可用余额的不退还
                                                            //普通老板隔天到账，佐卡伊7天
                                                            db.query(" select * from db_manager_income where order_id=? and finish_time is null and type=6 ",[order[0].id], function(err, refund_income, fields) {

                                                                // 数据获取失败
                                                                if (err) {
                                                                    db.rollback();
                                                                    db.release();// 释放资源
                                                                    conn.end(); // 结束当前数据库链接
                                                                    return res.errorEnd('查询退还的佣金记录失败', 200);
                                                                }

                                                                
                                                                //找到要退还的佣金记录
                                                                if(refund_income.length>0){

                                                                    //删除代言人佣金记录
                                                                    db.query(" delete  from db_manager_income where order_id=? and finish_time is null and type=6 ",[order[0].id], function(err, delete_income, fields) {

                                                                        // 数据获取失败
                                                                        if (err) {
                                                                            db.rollback();
                                                                            db.release();// 释放资源
                                                                            conn.end(); // 结束当前数据库链接
                                                                            return res.errorEnd('删除代言人佣金记录失败', 200);
                                                                        }

                                                                        function loopService( callback ){
                                                                
                                                                            function forEach( Index ){
                                                                                var data_income = refund_income[ Index ];
                                                                                if( typeof data_income !== 'object' ){
                                                                                    // 业务代码执行完成, 执行回调
                                                                                    return callback( Index );
                                                                                }
                                                                                // 你的业务代码!
                                                                                // 备注: 业务代码执行完成后 调用 forEach( Index + 1 ) 进入下一轮的业务
                                                                                // ....

                                                                                //给老板反佣金
                                                                                var income = {
                                                                                    openid :refund_income[ Index ].openid,
                                                                                    manager_id :refund_income[ Index ].manager_id,
                                                                                    shopowner_id:refund_income[ Index ].shopowner_id,
                                                                                    clerk_id:refund_income[ Index ].clerk_id,
                                                                                    prolocutor_id:refund_income[ Index ].clerk_id,
                                                                                    spokesman_id:refund_income[ Index ].spokesman_id,
                                                                                    MONEY:refund_income[ Index ].MONEY,
                                                                                    record:"佣金退回到老板可用余额",
                                                                                    types:"佣金退回收入",
                                                                                    type:12,
                                                                                    record:refund_income[ Index ].payment_no,
                                                                                    create_days:_date,
                                                                                    create_date:_date,
                                                                                    activity_id:refund_income[ Index ].activity_id,
                                                                                    activity_type:refund_income[ Index ].activity_type,
                                                                                    order_id:order[0].id
                                                                                    };
                                                                                    db.query(" insert into  db_manager_income set ? ",[income], function(err, row, fields) {
                                                
                                                                                        // 数据获取失败
                                                                                        if (err) {
                                                                                            
                                                                                            db.rollback();
                                                                                            db.release();// 释放资源
                                                                                            conn.end(); // 结束当前数据库链接
                                                                                            return res.errorEnd('插入佣金退回记录失败', 200);
                                                                                        }
                                                                                        
                                                                                        //触发器发公告，减对应代言人预收益,删除佣金收入等
                                                                                        forEach( Index + 1 );

                                                                                    })              

                                                                                    

                                                                            }
                                                                            forEach( 0 );
                                                                        }

                                                                        loopService( function( total ){
                                                                            db.commit();
                                                                            db.release(); // 释放资源
                                                                            conn.end(); // 结束当前数据库链接
                                                                            return res.successEnd('退款成功！', 0);
                                                                        })

                                                                    })
                                                                    
                                                                }else{
                                                                    //没找到要退还的佣金记录
                                                                    //更新支出表
                                                                    db.commit();
                                                                    db.release(); // 释放资源
                                                                    conn.end(); // 结束当前数据库链接
                                                                    return res.successEnd('退款成功！', 0);
                                                                }
                                                            
                                                             
                                           
                                                            })
                                                        
                                                            // //更新支出表
                                                            // db.commit();
                                                            // db.release(); // 释放资源
                                                            // conn.end(); // 结束当前数据库链接
                                                            // return res.successEnd('退款成功！', 0);
                                           
                                                        })
                                           
                                                    })

                                                }


                                       
                                            })
                                       
                                        })
                                 
                                    }
                                        

                                })


                            }else{

                                db.rollback();
                                db.release();// 释放资源
                                conn.end(); // 结束当前数据库链接
                                return res.errorEnd('您的可用金额不够退款支付！', 1);
                            }

                        });
                        
                        


                    });
                });
       
    
            });
    
    
    });
}
