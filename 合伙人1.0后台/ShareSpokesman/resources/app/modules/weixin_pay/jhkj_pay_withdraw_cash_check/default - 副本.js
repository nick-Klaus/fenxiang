
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

                var openid = body.openid;
                var time = body.time;
                var token = body.token;
                var amount=body.amount;
                var myDate = new Date(); 
                var now_time = myDate.getTime(); 
                var day = myDate.getDate();
                var month = myDate.getMonth()+1;
                var year = myDate.getFullYear();

                var _date = moment().format('YYYY-MM-DD HH:mm:ss');

              
                var sign=body.notify+(openid||'').toUpperCase()+"8JeYdvf-9n.de3R";
                
                sign=crypto.createHash('md5').update( sign ).digest('hex');
                
                sign=crypto.createHash('md5').update( time + sign ).digest('hex');
               
                console.log(body);
                console.log(sign);

                //验证成功开始更新订单支付记录
                if(sign==token){



                    db.query("SELECT * from  `db_people` where    id=? ",[body.fans_id], function(err, people, fields) {
                        // 数据获取失败
                        if (err) {
                            db.rollback();
                            db.release();// 释放资源
                            conn.end(); // 结束当前数据库链接
                            return res.errorEnd('没有找到可用数据', 200);
                        }
                        //余额足够且授权成功！
                        if(people[0].amount>=amount&&openid!=null&&openid!=""){
                            db.query(" UPDATE db_people SET openid_jhkj =? where id=?  ",[openid,body.fans_id], function(err, row, fields) {

                            // 数据获取失败
                                if (err) {
                                    db.rollback();
                                    db.release();// 释放资源
                                    conn.end(); // 结束当前数据库链接
                                    return res.errorEnd('没有找到订单数据', 200);
                                }
                                //生成提现申请
                                var data = {
                                    
                                    manager_id : people[0].manager_id,
                                    openid :people[0].openid,
                                    openid_jhkj :openid,
                                    shopowner_id:people[0].shopowner_id,
                                    clerk_id:people[0].clerk_id,
                                    prolocutor_id:people[0].prolocutor_id,
                                    spokesman_id:people[0].id,
                                    create_time: new Date()/1000,
                                    channel: "JHKJ微信公账号支付",
                                    status: 0,
                                    body:"审批后到账",
                                    real_pay:amount
                                    
                                }; 

                                db.query( "INSERT INTO db_manager_tixian set ?" , data , function( err, result , fields ){
                                    if( err ){
                                        db.rollback();
                                        db.release();// 释放资源
                                        conn.end(); // 结束当前数据库链接
                                        return res.errorEnd('创建数据失败!!', 200);
                                    }
                                    var data1 = {
                                        order_no : "MT"+year+month+day+result.insertId
                                    };
                                    db.query( "UPDATE ?? SET  ? WHERE id = ? " , [ 'db_manager_tixian' , data1,result.insertId ] , function( err1, result1 , fields1 ){
                                        if( err1 ){
                                            db.rollback();
                                            db.release();// 释放资源
                                            conn.end(); // 结束当前数据库链接
                                            return res.errorEnd('更新数据失败!!', 200);
                                        }

                                        var enchashment = {
                                            openid :people[0].openid,
                                            manager_id :people[0].manager_id,
                                            shopowner_id:people[0].shopowner_id,
                                            clerk_id:people[0].clerk_id,
                                            prolocutor_id:people[0].prolocutor_id,
                                            spokesman_id:people[0].id,
                                            MONEY:amount,
                                            types:"提现支出",
                                            type:3,
                                            create_days:_date,
                                            create_date:_date,
                                            activity_id:0,
                                            activity_type:0,
                                            tixian_id:result.insertId
                                        };
                                        db.query(" INSERT INTO db_manager_enchashment set ?  ",enchashment, function(err, manager_enchashment, fields) {
                                            // 数据获取失败
                                                if (err) {
                                                    db.rollback();
                                                    db.release();// 释放资源
                                                    conn.end(); // 结束当前数据库链接
                                                    return res.errorEnd('提现支出记录失败', 200);
                                                }

                                                //添加支出记录
                                                db.commit();
                                                db.release(); 
                                                conn.end();// 释放资源
                                                return res.successEnd('支付申请成功！', 0);
                                        });

                                    }); 
                                });
                       
                            })
                        }else{
                            db.rollback();
                            db.release();// 释放资源
                            conn.end(); // 结束当前数据库链接
                            return res.successEnd('可用余额不足', 0);
                       
                        }
                       
                   
                    })


                 
                    
                }else{
                    db.rollback();
                    db.release();// 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd('验证失败', 0);
                }












            });
            
          
			
                

   

        

           


            
      

           


    
 
    
    
    });
}
