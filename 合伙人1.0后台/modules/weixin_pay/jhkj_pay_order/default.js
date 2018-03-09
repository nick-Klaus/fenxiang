
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
            if(  that.isEmpty(body.id) ){
            	return res.errorEnd('订单ID不能为空', 200);
        	}
        	if(  that.isEmpty(body.pid) ){
            	return res.errorEnd('用户ID不能为空', 200);
        	}
            
			if(  that.isEmpty(body.order_no) ){
            	return res.errorEnd('订单号不能为空', 200);
        	}

			if(  that.isEmpty(body.need_pay) ){
            	return res.errorEnd('需要支付的金额不能为空', 200);
        	}

			
        console.log(body);
        var back={};
      	db.query("SELECT * from  `db_order` where    id=? and order_no =?  and cid =?  and  need_pay=?  and pay_status=1 ",[body.id,body.order_no,body.pid,body.need_pay], function(err, order, fields) {

        // 数据获取失败
            if (err) {
            	db.release(); // 释放资源
		        conn.end(); // 结束当前数据库链接
                return res.errorEnd('没有找到订单数据', 200);
            }
            

            if(order.length>0){



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

                    db.release();// 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd('此活动类型不能补充资金!!', 200);
                }
                //商品数量验证
                db.query(" select * from "+activity_table+"    where id=? ",[order[0].aid], function(err, activity, fields) {

                    // 数据获取失败
                    if (err) {

                        db.release();// 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd('查询活动失败', 200);
                    }

                    if(activity.length>0&&activity[0].product_quantity>0){

                        var time_sign=parseInt(new Date().getTime()/1000);
                        //moment(moment.unix(date)).format(""):

                        
                        var sign=(body.need_pay)+body.order_no.toUpperCase()+time_sign;
                        
                        sign=crypto.createHash('md5').update( sign ).digest('hex');
                        
                        sign=crypto.createHash('md5').update( time_sign + sign ).digest('hex');
                        

                        // console.log(time_sign);
                        // var sign=(body.need_pay)+body.order_no+"w*2*b^dHWo1_";
                        // console.log(sign);
                        // sign=crypto.createHash('md5').update( sign ).digest('hex');
                        // console.log(sign);
                        // sign=crypto.createHash('md5').update( time_sign + sign ).digest('hex');
                        // console.log(sign);

                        var url ="http://weixin.echao.com/app/index.php?i=4&c=entry&do=PaymentStrict&deduction_rate=1&m=t_we_payment&fee="+(body.need_pay)+"&order_no="+body.order_no+"&modify=0&time="+time_sign+"&token="+sign+"&tenant=合伙人系统&notify=http%3A%2F%2Fssm.echao.com%3A8081%2Fweixin_pay%2Fjhkj_pay_back_order&jump_notify="+body.jump_notify;

                        back.url=url;
                        db.release(); // 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.successEnd(back);

                    }else{
                        db.release();// 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd('产品数量不足！', 200);
                    }
                


                })
                
                
            }else{
                db.release(); // 释放资源
                conn.end(); // 结束当前数据库链接
                return res.successEnd(back);
            }
   
    	})

        

           


            
      

           


    
 
    
    
    });
}
