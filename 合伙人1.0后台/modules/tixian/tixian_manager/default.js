
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
            if(  that.isEmpty(body.manager_id) ){
                db.rollback();
                db.release();// 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd('老板不能为空', 200);
            }
            if(  that.isEmpty(body.amount) ){
                db.rollback();
                db.release();// 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd('提现金额不为空', 200);
            }
            if(  that.isEmpty(body.openid_jhkj) ){
                db.rollback();
                db.release();// 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd('授权openid不为空', 200);
            }
            
            var _date = moment().format('YYYY-MM-DD HH:mm:ss');

            
            
            db.query("SELECT * from  `db_manager` where    id=? ",[body.manager_id], function(err, manager, fields) {
                // 数据获取失败
                if (err) {
                    db.rollback();
                    db.release();// 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd('没有找到老板数据', 200);
                }

                
                
                //判断是否够钱提现
                if(manager[0].amount>=body.amount&&body.amount<=200){
                //通过去发微信红包提现

                    var time_sign=parseInt(new Date().getTime()/1000);


                    
                    var sign=(body.amount)+(body.openid_jhkj||'').toUpperCase()+"7E3UW821ud*4.wwD";
                    
                    sign=crypto.createHash('md5').update( sign ).digest('hex');
                    
                    sign=crypto.createHash('md5').update( time_sign + sign ).digest('hex');
                
                    var tx = {

                        openid:body.openid_jhkj,
                        amount:body.amount,
                        wishing : "老板提现"+body.amount,
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
                        //提现成功，插入支出记录
                        if(tx.error_code==0){

                            
                             var enchashment = {

                                openid :manager[0].openid,
                                manager_id :manager[0].id,
                                shopowner_id:0,
                                clerk_id:0,
                                prolocutor_id:0,
                                spokesman_id:0,
                                MONEY:body.amount,
                                types:"老板提现支出",
                                type:4,
                                record:tx.data.out_trade_no,
                                create_days:_date,
                                create_date:_date,
                                activity_id:0,
                                activity_type:0
            
                            };
                            //更新支出表
                            db.query(" INSERT INTO `db_manager_enchashment` SET ? ",[enchashment], function(err, row1, fields) {

                                // 数据获取失败
                                if (err) {
                                    db.rollback();
                                    db.release();// 释放资源
                                    conn.end(); // 结束当前数据库链接
                                    return res.errorEnd('老板支出记录插入失败', 200);
                                }

                                //更新支出表
                                db.commit();
                                db.release(); // 释放资源
                                conn.end(); // 结束当前数据库链接
                                return res.successEnd('提现成功！', 0);
                           
                            })
                           
                            

                            
                        }else{
                            db.rollback();
                            db.release();// 释放资源
                            conn.end(); // 结束当前数据库链接
                            return res.errorEnd(tx.error_msg, 200);
                        }
                            

                         

                    })



                
                    

                }
                
                    
             

            });

        });


        	
        

        

           


            
      

           


    
 
    
    
    });
}
