/**
 * Created by Administrator on 2017/8/16.
 * 所有活动的获取 视图
 */
const request = require('request');

'use strict';
exports.ready = (req, res, that) => {

    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query; // 当前请求传递过来的 GET 数据,
    const body = req.body; // 当前请求传递过来的 POST 数据
    if(req.session.user_rows = null){
            return res.errorEnd('当前请求不存在 Token 或 Token 不可用', 300);
        }
    if(req.session.user_token != body.token){
        return res.errorEnd('当前请求不存在 Token 或 Token 不可用', 300);
    }
    that.connect(( err , db , conn ) => {



       
        db.beginTransaction(function(err){
            if(  that.isEmpty(body) ){
                db.rollback();
                db.release(); // 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd('无质保单数据', 200);
            }
    
            var shopowner = req.session.user_shopowner;
            body.appsecret = shopowner.policy_key;
            if(shopowner.policy_key==null||shopowner.policy_key==""){
                db.rollback();
                db.release(); // 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd('质保单授权码为空，请去店铺信息里完善！', 200);
            }

            var openid = body.openid;
            var policy_key = body.appsecret;
            var shopowner_id = body.shopowner_id;
            var cid = body.cid;
            var mid = body.mid;
            var pid = body.pid;
            var order_title = body.order_title;
            var order_price = body.order_price;
            var order_num = body.order_num;
            var shop_address= body.shop_address;
            var shop_name= body.shop_name;
            var original_price =body.original_price;
            var autograph =body.autograph;
            var gd_image = body.gd_image;
            var head_url = body.head_url;

            if(body.gd_image!=null&&body.gd_image!=""&&body.head_url!=null&&body.head_url!=""){
		        body.gd_image = body.head_url + body.gd_image;
		    }
            
             





        request.post({url:'http://weixin.echao.com/app/index.php?i=4&c=entry&do=policy_create_api&m=simp_warranty', form:body}, function(error, response, body) {
            if (error ) {
                db.rollback();
                db.release(); // 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd(error, 200);
            }
     


            body =JSON.parse(body);

 
            

            if(body.error_code==0){
                 var data = {


                    cid:cid,
                    mid:mid,
                    pid : pid,
                    openid:openid,
                    policy_key:policy_key,
                    uniacid : body.data.uniacid,
                    shop_id : shopowner_id,
                    member_id : body.data.member_id,
                    policy_number : body.data.policy_number,
                    selling_time:body.data.selling_time,
                    branch_title:body.data.branch_title,
                    card_no:body.data.card_no,
                    order_no:body.data.order_no,
                    standard:body.data.standard,
                    other:body.data.other,
                    remark:body.data.remark,
                    status:body.data.status,
                    real_name:body.data.real_name,
                    mobile:body.data.mobile,
                    amount:body.data.amount,
                    order_title:order_title,
                    order_price:order_price,
                    order_num:order_num,
                    weight:body.data.weight,
                    original_price:original_price,
                    gd_no:body.data.gd_no,
                    autograph:autograph,
                    gd_image:gd_image,
                    amount_capital:body.data.amount_capital,
                    shop_address:shop_address,
                    shop_name:shop_name,
                    shop:JSON.stringify(body.data.shops)

     
                 
                }; 


                db.query("INSERT INTO `db_policy` SET ? ",data, function(err, result, fields) {
                // 数据获取失败
                 if( err ){
                    // 数据插入失败, 回滚
                    db.rollback();
                    db.release();// 释放资源
                    return res.errorEnd('质保单数据保存失败!!', 200);
                 }

                db.commit();
                db.release(); // 释放资源
                conn.end(); // 结束当前数据库链接
                return res.successEnd('质保单数据保存成功！', 0);
            
           
                })
            }else{
                db.rollback();
                db.commit();
                db.release(); // 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd('质保单数据保存失败', 200);
            }

             

        })

           


            
      

           


    
        });
    
    
    });
}
