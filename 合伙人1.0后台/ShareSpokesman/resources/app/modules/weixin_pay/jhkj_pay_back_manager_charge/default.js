
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
            
       
                var _date = moment().format('YYYY-MM-DD HH:mm:ss');
              
                var sign=(body.fee)+body.order_no+"w*2*b^dHWo1_";
                
                sign=crypto.createHash('md5').update( sign ).digest('hex');
                
                sign=crypto.createHash('md5').update( time + sign ).digest('hex');
               

                var real_pay = parseFloat(body.rate_payment)/100.0;
                var all_pay = parseFloat(body.fee)/100.0;
                
                //验证成功开始更新订单支付记录
                if(sign==token){


                    db.query("SELECT * from  `db_manager_recharge` where     order_no =?   and  real_pay=?  and status=1 ",[body.order_no,all_pay], function(err, row, fields) {

                    // 数据获取失败
                        if (err) {
                            db.release(); // 释放资源
                            conn.end(); // 结束当前数据库链接
                            return res.errorEnd('没有找到订单数据', 200);
                        }

                        db.beginTransaction(function(err){
                            if(row.length>0){

                            //更新充值表
                            db.query(" update  `db_manager_recharge` set status = 2 , pay_time=unix_timestamp(now()) , payment_no=? ,all_pay=? ,real_pay=? where     order_no =?      ",[payment_no,all_pay,real_pay,body.order_no], function(err, manager_recharge, fields) {
                                    // 数据获取失败
                                    if (err) {
                                        db.rollback();
                                        db.release();// 释放资源
                                        conn.end(); // 结束当前数据库链接
                                        return res.errorEnd('没有找到可用数据', 200);
                                    }

                                        //查老板表
                                        db.query("SELECT * from  `db_manager` where     id=? ",[row[0].manager_id], function(err, manager, fields) {

                                            // 数据获取失败
                                            if (err) {
                                                db.rollback();
                                                db.release();// 释放资源
                                                conn.end(); // 结束当前数据库链接
                                                return res.errorEnd('没有老板数据', 200);
                                            }
   
                                            //查个人表
                                            db.query("SELECT * from  `db_people` where  manager_id=? and  openid=? ",[row[0].manager_id,manager[0].openid], function(err, people, fields) {
                                             
                                                // 数据获取失败
                                                if (err) {
                                                    db.rollback();
                                                    db.release();// 释放资源
                                                    conn.end(); // 结束当前数据库链接
                                                    return res.errorEnd('没有找个人数据', 200);
                                                }

                                                
                                                var income = {
                                                    openid :manager[0].openid,
                                                    manager_id :row[0].manager_id,
                                                    shopowner_id:people[0].shopowner_id,
                                                    clerk_id:people[0].clerk_id,
                                                    prolocutor_id:people[0].prolocutor_id,
                                                    spokesman_id:people[0].id,
                                                    MONEY:real_pay,
                                                    types:"老板端充值",
                                                    type:4,
                                                    record:payment_no,
                                                    create_days:_date,
                                                    create_date:_date,
                                                    activity_id:0,
                                                    activity_type:0
                                                };
                  
                                                //插入收入表
                                                db.query("  INSERT INTO db_manager_income set ?  ",income, function(err, manager, fields) {

                                                    // 数据获取失败
                                                    if (err) {
                                                        db.rollback();
                                                        db.release();// 释放资源
                                                        conn.end(); // 结束当前数据库链接
                                                        return res.errorEnd('收入插入失败', 200);
                                                    }

                                                

                                                    db.commit();
                                                    db.release(); // 释放资源
                                                    conn.end(); // 结束当前数据库链接
                                                    return res.successEnd('收入插入成功', 0);
                                                
                                                })


                                                
                                            })


                                        })

                                    


                                
                               
                                })
                            }else{
                                db.rollback();
                                db.release();// 释放资源
                                conn.end(); // 结束当前数据库链接
                                return res.successEnd("没有找到对应的充值订单！");
                            }
                        })
                    
                        
               
                    })
                    
                }
            
                

   

        

           


            
      

           


    
 
    
    
    });
}
