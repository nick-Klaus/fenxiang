
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
                        //老板端第一次必须先授权
                        db.query(" UPDATE db_people SET openid_jhkj =? where id=?  ",[openid,body.fans_id], function(err, row, fields) {

                        // 数据获取失败
                            if (err) {
                                db.rollback();
                                db.release();// 释放资源
                                conn.end(); // 结束当前数据库链接
                                return res.errorEnd('没有找到订单数据', 200);
                            }
                            
                            db.commit();
                            db.release(); 
                            conn.end();// 释放资源
                            return res.successEnd('支付申请成功！', 0);
                   
                        })
                        
                       
                   
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
