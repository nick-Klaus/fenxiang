
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
            console.log(body);
       
                var _date = moment().format('YYYY-MM-DD hh:mm:ss');
              
                var sign=(body.fee)+body.order_no+"w*2*b^dHWo1_";
                
                sign=crypto.createHash('md5').update( sign ).digest('hex');
                
                sign=crypto.createHash('md5').update( time + sign ).digest('hex');
               

                var need_pay = parseFloat(body.fee)/100.0;
                console.log("1");
                //验证成功开始更新订单支付记录
                if(sign==token){

console.log("1");
                    db.query("SELECT * from  `db_manager_recharge` where     order_no =?   and  real_pay=?  and status=1 ",[body.order_no,need_pay], function(err, row, fields) {

                    // 数据获取失败
                        if (err) {
                            db.release(); // 释放资源
                            conn.end(); // 结束当前数据库链接
                            return res.errorEnd('没有找到订单数据', 200);
                        }

                        db.beginTransaction(function(err){
                            if(row.length>0){

                            //更新充值表
                            db.query(" update  `db_manager_recharge` set status = 2 , pay_time=unix_timestamp(now()) , payment_no=? where     order_no =?   and  real_pay=? ",[payment_no,body.order_no,need_pay], function(err, manager_recharge, fields) {
                                    // 数据获取失败
                                    if (err) {
                                        db.release(); // 释放资源
                                        conn.end(); // 结束当前数据库链接
                                        return res.errorEnd('没有找到可用数据', 200);
                                    }
                                    console.log("2");
                                        //查老板表
                                        db.query("SELECT * from  `db_manager` where     id=? ",[row[0].manager_id], function(err, manager, fields) {

                                            // 数据获取失败
                                            if (err) {
                                                db.release(); // 释放资源
                                                conn.end(); // 结束当前数据库链接
                                                return res.errorEnd('没有老板数据', 200);
                                            }
                                            //查个人表
                                            db.query("SELECT * from  `db_people` where  manager_id=? and    openid=? ",[row[0].manager_id,manager.openid], function(err, people, fields) {

                                                // 数据获取失败
                                                if (err) {
                                                    db.release(); // 释放资源
                                                    conn.end(); // 结束当前数据库链接
                                                    return res.errorEnd('没有找个人数据', 200);
                                                }
                                                var income = {
                                                    manager_id :row[0].manager_id,
                                                    shopowner_id:people.shopowner_id,
                                                    clerk_id:people.clerk_id,
                                                    prolocutor_id:people.prolocutor_id,
                                                    is_clerk:people.is_clerk,
                                                    is_prolocutor:people.is_prolocutor,
                                                    MONEY:need_pay,
                                                    types:"老板端充值",
                                                    record:"",
                                                    create_days:_date,
                                                    create_date:_date,
                                                    activity_id:0,
                                                    activity_type:0,
                                                };
                                                //插入收入表
                                                db.query("  INSERT INTO db_manager_income set ?  ",income, function(err, manager, fields) {

                                                    // 数据获取失败
                                                    if (err) {
                                                        db.release(); // 释放资源
                                                        conn.end(); // 结束当前数据库链接
                                                        return res.errorEnd('没有找个人数据', 200);
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
                                db.release(); // 释放资源
                                conn.end(); // 结束当前数据库链接
                                return res.successEnd("没有找到对应的充值订单！");
                            }
                        })
                    
                        
               
                    })
                    
                }
			
                

   

        

           


            
      

           


    
 
    
    
    });
}
