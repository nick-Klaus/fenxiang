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

    if(that.isEmpty(body.openid) ){
        db.release();// 释放资源
        conn.end(); // 结束当前数据库链接
        return res.errorEnd('openid不能为空', 200);
    }
    if(that.isEmpty(body.policy_key) ){
        db.release();// 释放资源
        conn.end(); // 结束当前数据库链接
        return res.errorEnd('policy_key不能为空', 200);
    }
    that.connect(( err , db , conn ) => {



       
        db.beginTransaction(function(err){


            if(that.isEmpty(body.list) ){
                db.rollback();
                db.release(); // 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd('无质保单数据', 200);
            }
    
           
            db.query("select a.* from db_people a left join db_shopowner b on a.shopowner_id=b.id where a.openid=? and  b.policy_key=?  ", [body.openid,body.policy_key] , function(err1, shopowner_people, fields1) {
            // 数据获取失败
                    if (err) {
                        db.release();// 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd('没有找到可用数据', 200);
                    }
                    if(shopowner_people.length==0){
                        db.rollback();
                        db.release(); // 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd('人员信息查询失败!', 200);
                    }else{
                        var  len = body.list.length;
                        var  in_num=0;
                        function forEach(index) {
                            if( index >= len  ){

                                var back={};
                                back.in_num=in_num;
                                db.commit();
                                db.release(); // 释放资源
                                conn.end(); // 结束当前数据库链接
                                return res.successEnd(back);
                                
                            }
                            
                            //删除团员拼团用户数据
                            db.query(" select * from db_policy  where cid=? and out_policy_id=? ",[shopowner_people[0].id,body.list[index].id], function(err, db_policy, fields) {
                                // 数据获取失败
                                if (err) {
                                    db.rollback();
                                    db.release();// 释放资源
                                    conn.end(); // 结束当前数据库链接
                                    return res.errorEnd("查询历史质保单失败!!", 200);
                                }
                                if(db_policy.length==0){

                                        var data = {


                                            cid:shopowner_people[0].id,
                                            mid:shopowner_people[0].manager_id,
                                            pid : shopowner_people[0].prolocutor_id,
                                            openid:shopowner_people[0].openid,
                                            policy_key:body.policy_key,
                                            uniacid : body.list[index].uniacid,
                                            shop_id : body.list[index].shopowner_id,
                                            member_id : body.list[index].member_id,
                                            policy_number : body.list[index].policy_number,
                                            selling_time:body.list[index].selling_time,
                                            branch_title:body.list[index].branch_title,
                                            card_no:body.list[index].card_no,
                                            order_no:body.list[index].order_no,
                                            standard:body.list[index].standard,
                                            other:body.list[index].other,
                                            remark:body.list[index].remark,
                                            status:body.list[index].status,
                                            real_name:body.list[index].real_name,
                                            mobile:body.list[index].mobile,
                                            amount:body.list[index].amount,
                                            order_title:body.list[index].order_title,
                                            order_price:body.list[index].order_price,
                                            order_num:body.list[index].order_num,
                                            weight:body.list[index].weight,
                                            original_price:body.list[index].original_price,
                                            gd_no:body.list[index].gd_no,
                                            autograph:body.list[index].autograph,
                                            gd_image:body.list[index].gd_image,
                                            amount_capital:body.list[index].amount_capital,
                                            shop_address:body.list[index].shop_address,
                                            shop_name:body.list[index].shop_name,
                                            shop:JSON.stringify(body.shops),
                                            out_policy_type:1,
                                            out_policy_id:body.list[index].id

                             
                                         
                                        }; 


                                        db.query("INSERT INTO `db_policy` SET ? ",data, function(err, result, fields) {
                                            // 数据获取失败
                                            if( err ){
                                                // 数据插入失败, 回滚
                                                db.rollback();
                                                db.release();// 释放资源
                                                return res.errorEnd('质保单数据保存失败!!', 200);
                                            }
                                            in_num++;
                                            forEach(index+1);
                                    
                                   
                                        })

                                }else{
                                    forEach(index+1);
                                }
                                    
                                        


                             

                               
                                
                            });
                            
                            
                        }
                        forEach(0);

                    }
                   
                                      
                });  
             





   

           


            
      

           


    
        });
    
    
    });
}
