
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
            if(  that.isEmpty(body.id) ){
                db.rollback();
                db.release();// 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd('提现ID不能为空', 200);
            }
            if(  that.isEmpty(body.status) ){
                db.rollback();
                db.release();// 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd('审批状态不能为空', 200);
            }
            
            

            
            
            db.query("SELECT * from  `db_manager_tixian` where    id=? ",[body.id], function(err, tixian, fields) {
                // 数据获取失败
                if (err) {
                    db.rollback();
                    db.release();// 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd('没有找到可用数据', 200);
                }
                if(tixian.length>0){
                    //无效，退回余额数值到代言人端
                    if(tixian[0].status==0&&body.status==2){

                    }else if(tixian[0].status==0&&body.status==1&&tixian[0].real_pay>=1&&tixian[0].real_pay<=200){
                    //通过去发微信红包提现

                        var time_sign=parseInt(new Date().getTime()/1000);
 

                        
                        var sign=(tixian[0].real_pay)+tixian[0].openid_jhkj.toUpperCase()+"7E3UW821ud*4.wwD";
                        
                        sign=crypto.createHash('md5').update( sign ).digest('hex');
                        
                        sign=crypto.createHash('md5').update( time_sign + sign ).digest('hex');
                    
                        var tx = {

                            openid:tixian[0].openid_jhkj,
                            amount:tixian[0].real_pay,
                            wishing : "代言人提现"+tixian[0].real_pay,
                            tenant:"系统奖励提现",
                            act_name:"合伙人系统",
                            remark : "备注",
                            token : sign,
                            time : time_sign,
                            //去掉就真的开始提现了 debug:18
                            // debug:18
        
                        }; 
              
                        request.post({url:'http://weixin.echao.com/app/index.php?i=4&c=entry&do=MemberCash&m=t_we_payment', form:tx}, function(error, response, tx) {
                            if (error) {
                                db.rollback();
                                db.release();// 释放资源
                                conn.end(); // 结束当前数据库链接
                                return res.errorEnd(error, 200);
                            }
                            tx =JSON.parse(tx);
                       
                            //提现成功，更新提现记录
                            if(tx.error_code==0){

                                db.query(" update  `db_manager_tixian` set status = 1 , payment_no=? , pay_time=unix_timestamp(now()) where     id =? ",[tx.data.out_trade_no,tixian[0].id], function(err, row, fields) {
                            
                                    // 数据获取失败
                                    if (err) {
                                        db.rollback();
                                        db.release();// 释放资源
                                        conn.end(); // 结束当前数据库链接
                                        return res.errorEnd('没有找到可用数据', 200);
                                    }

                                    //更新支出表
                                    db.query(" update  `db_manager_enchashment` set  record=?  where     tixian_id =? ",[tx.data.out_trade_no,tixian[0].id], function(err, row1, fields) {

                                        // 数据获取失败
                                        if (err) {
                                            db.rollback();
                                            db.release();// 释放资源
                                            conn.end(); // 结束当前数据库链接
                                            return res.errorEnd('没有找到可用数据', 200);
                                        }

                                        //更新支出表
                                        db.commit();
                                        db.release(); // 释放资源
                                        conn.end(); // 结束当前数据库链接
                                        return res.successEnd('提现成功！', 0);
                                   
                                    })
                               
                                })

                                
                            }else{
                                db.rollback();
                                db.release();// 释放资源
                                conn.end(); // 结束当前数据库链接
                                return res.errorEnd(tx.error_msg, 200);
                            }
                                

                             

                        })



                    
                        

                    }
                
                    
                }else{
                    db.rollback();
                    db.release();// 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd('没有找到对应的提现记录', 200);
                }

            });

        });


        	
        

        

           


            
      

           


    
 
    
    
    });
}
