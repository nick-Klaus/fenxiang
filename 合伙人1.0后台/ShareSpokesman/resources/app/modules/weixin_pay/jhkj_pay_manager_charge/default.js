
const request = require('request');
const moment = require('moment');
const crypto = require('crypto');

'use strict';
exports.ready = (req, res, that) => {

    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query; // 当前请求传递过来的 GET 数据,
    const body = req.body; // 当前请求传递过来的 POST 数据
    that.connect(( err , db , conn ) => {



       



        	if(req.session.user_rows = null){
             	return res.errorEnd('当前请求不存在 Token 或 Token 不可用', 300);
         	}
        	if(req.session.user_token != body.token){
             	return res.errorEnd('当前请求不存在 Token 或 Token 不可用', 300);
        	}
            if(  that.isEmpty(body.manager_id) ){
            	return res.errorEnd('老板ID不能为空', 200);
        	}


			if(  that.isEmpty(body.real_pay) ){
            	return res.errorEnd('充值金额不能为空', 200);
        	}




            var myDate = new Date(); 
            var now_time = myDate.getTime(); 
            var day = myDate.getDate();
            var month = myDate.getMonth()+1;
            var year = myDate.getFullYear();
			

            
   


            var data = {
                    
                    manager_id : body.manager_id,
                    create_time: new Date()/1000,
                    channel: "JHKJ微信公账号支付",
                    status: 1,
                    body:"直接到账",
                    real_pay:body.real_pay,
                    all_pay:body.real_pay
                    
                }; 

            db.query( "INSERT INTO db_manager_recharge set ?" , data , function( err, result , fields ){
                    if( err ){
                        // 数据插入失败, 回滚
                        db.rollback();
                        db.release();
                        conn.end();// 释放资源
                        return res.errorEnd('创建数据失败!!', 200);
                    }
                    var data1 = {
                        order_no : "MC"+year+month+day+result.insertId
                    };
                    db.query( "UPDATE ?? SET  ? WHERE id = ? " , [ 'db_manager_recharge' , data1,result.insertId ] , function( err1, result1 , fields1 ){
                        if( err1 ){
                            db.release();
                            conn.end();// 释放资源
                            return res.errorEnd('更新数据失败!!', 200);
                        }

                        
                        db.commit();
                        db.release(); 
                        conn.end();// 释放资源





                        var back={};

                        var time_sign=parseInt(new Date().getTime()/1000);


                        var sign=(body.real_pay)+data1.order_no.toUpperCase()+time_sign;
     
                        sign=crypto.createHash('md5').update( sign ).digest('hex');
                        
                        sign=crypto.createHash('md5').update( time_sign + sign ).digest('hex');
                        

                        // console.log(time_sign);
                        // var sign=(body.need_pay)+body.order_no+"w*2*b^dHWo1_";
                        // console.log(sign);
                        // sign=crypto.createHash('md5').update( sign ).digest('hex');
                        // console.log(sign);
                        // sign=crypto.createHash('md5').update( time_sign + sign ).digest('hex');
                        // console.log(sign);

                        var url ="http://weixin.echao.com/app/index.php?i=4&c=entry&do=PaymentStrict&deduction_rate=1&m=t_we_payment&fee="+(body.real_pay)+"&order_no="+data1.order_no+"&modify=0&time="+time_sign+"&token="+sign+"&tenant=合伙人系统&notify=http%3A%2F%2Fssm.echao.com%3A8081%2Fweixin_pay%2Fjhkj_pay_back_manager_charge&jump_notify="+body.jump_notify;

                        back.url=url;

                        return res.successEnd(back);

                    }); 
                });
            
            
      	
   
    

        

           


            
      

           


    
 
    
    
    });
}
