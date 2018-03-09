/**
 * Created by Administrator on 2017/8/16.
 * 所有活动的获取 视图
 */
 const crypto = require('crypto');

'use strict';
exports.ready = (req, res, that) => {

    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query; // 当前请求传递过来的 GET 数据,
    const body = req.body; // 当前请求传递过来的 POST 数据
    if(  that.isEmpty(body.pid) ){
        return res.errorEnd('个人不能为空', 200);
    }

    that.connect(( err , db , conn ) => {
        db.beginTransaction(function(err){

            var is_extend =0;
            var extend_time=0;
            //是否推广
            if(!that.isEmpty(body.is_extend) ){
                is_extend=body.is_extend;
                if(body.is_extend==1){
                    if(!that.isEmpty(body.extend_time)){
                        extend_time=body.extend_time;
                    }        
                }
               
            }



            db.query("SELECT * from  `db_people` where is_manager='0' and    id =? ",[body.pid], function(err, people, fields) {
                // 数据获取失败
                if (err||people.length==0) {
                    db.rollback();
                    db.release();// 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd('已是老板或用户不存在', 200);
                }
                db.query("SELECT * from  `db_people` where is_manager='1' and    openid =? ",[people[0].openid], function(err, boss, fields) {
                    // 数据获取失败
                    if (err) {
                        db.rollback();
                        db.release();// 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd('已是老板或用户不存在', 200);
                    }
                    //这个openid已经有老板数据了
                    if(boss.length>0){
                        db.rollback();
                        db.release();// 释放资源
                        conn.end(); // 结束当前数据库链接
                        

                        var back ={};
                            back.error_code="400";
                            back.error_msg="已经是老板了";
                            back.url='http://ssm.echao.com/ShareSpokesman/index.html?fans_id='+boss[0].id+'&source_fans_id='+boss[0].id+'&from=singlemessage&isappinstalled=0#!/join';
                            back.fans_id=boss[0].id;
                        return res.errorEnd(back, 400);
                    }else{
                        var manager = {

                            openid:people[0].openid,
                            username:people[0].nickname,
                            realname:people[0].realname,
                            mobile:people[0].mobile,
                            amount:0,
                            consume:0,
                            cash:0,
                            coupon:0,
                            is_extend:is_extend,
                            extend_time:extend_time

                        };
                        //生成老板记录 
                        db.query("insert into db_manager set ? ",[manager], function(err, manager, fields) {
                            // 数据获取失败
                            if (err) {
                                
                                db.rollback();
                                db.release();// 释放资源
                                conn.end(); // 结束当前数据库链接
                                return res.errorEnd('创建老板失败', 200);
                            }
                            //生成店铺记录
                            var shop = {

                                manager_id : manager.insertId,
                                shop_name:people[0].nickname
                             
                            }; 
                            db.query("INSERT INTO `db_shop` SET ? ",shop, function(err, shop_back, fields) {
                                // 数据获取失败
                                if( err ){
                                    db.rollback();
                                    db.release();// 释放资源
                                    conn.end(); // 结束当前数据库链接

                                    return res.errorEnd('创建店铺失败!!', 200);
                                }
                                //生成店长记录
                                var shopowner = {

                                    manager_id : manager.insertId,
                                    shop_id:shop_back.insertId,
                                    openid:people[0].openid,
                                    status : 1,
                                    openid:people[0].openid,
                                    realname:people[0].nickname,
                                    password_hash:Math.random().toString(12).substr(0,16),

                                 
                                };

                                db.query("INSERT INTO `db_shopowner` SET ? ",shopowner, function(err, shopowner, fields) {
                                    // 数据获取失败
                                    if( err ){
                                        db.rollback();
                                        db.release();// 释放资源
                                        conn.end(); // 结束当前数据库链接

                                        return res.errorEnd('创建店长记录失败!!', 200);
                                    }



                                    //默认佣金比例,分享金,  配置表  直接销售人佣金比例+间接销售人佣金比例=100
                                    var commission_configure = {

                                        manager_id : manager.insertId,
                                        default_rate:0,
                                        default_rate_price:20,
                                        direct_profit_rate:80,
                                        indirect_profit_rate:20,
                                        share_money_time:0.01,
                                        forward_money_time:0.01,
                                        browse_money_time:0.01

                                     
                                    };
                                    db.query("INSERT INTO `db_commission_configure` SET ? ",commission_configure, function(err, commission_configure, fields) {
                                        // 数据获取失败
                                        if( err ){
                                            db.rollback();
                                            db.release();// 释放资源
                                            conn.end(); // 结束当前数据库链接

                                            return res.errorEnd('默认佣金比例,分享金规则失败!!', 200);
                                        }

                                        //每日任务规则/达到所有条件完成每日任务
                                        var people_day_rule = {

                                            manager_id : manager.insertId,
                                            openid:people[0].openid,
                                            forwardcount:5,
                                            sharecount:5,
                                            developcount:1,
                                            completecount:1,
                                            forward_time:1,
                                            share_time:1,
                                            see_time:1,
                                            add_prolocutor_time:0,
                                            finish_day_task_time:0,
                                            finish_day_month_time:0

                                         
                                        };
                                        db.query("INSERT INTO `db_people_day_rule` SET ? ",people_day_rule, function(err, people_day_rule, fields) {
                                            // 数据获取失败
                                            if( err ){
                                                db.rollback();
                                                db.release();// 释放资源
                                                conn.end(); // 结束当前数据库链接

                                                return res.errorEnd('创建每日任务规则/达到所有条件完成每日任务失败!!', 200);
                                            }
                                            var people_new = people[0];
                                            people_new.id=null;
                                            people_new.manager_id=manager.insertId;
                                            people_new.shopowner_id=shopowner.insertId;
                                            people_new.is_clerk='1';
                                            people_new.is_prolocutor='1';
                                            people_new.is_manager='1';
                                            people_new.is_shopowner='1';
                                            people_new.amount=0;
                                            people_new.cash=0;
                                            people_new.consume=0;
                                            people_new.password_hash=Math.random().toString(12).substr(0,16);
                                            people_new.task_days=null;

                                            people_new.token = crypto.createHash('md5').update( new Date() + Math.random().toString(36).substr(2) ).digest('hex');


                                            //创建新的db_people数据
                                            db.query("insert into db_people set ? ",[people_new], function(err, people_new, fields) {
                                                // 数据获取失败
                                                if( err ){
                                                    db.rollback();
                                                    db.release();// 释放资源
                                                    conn.end(); // 结束当前数据库链接

                                                    return res.errorEnd('创建新代言人失败', 200);
                                                }
                                                //更新店员，代言人为自己
                                                db.query("update  db_people set clerk_id=?,prolocutor_id=? where id =? ",[people_new.insertId,people_new.insertId,people_new.insertId], function(err, people_new_update, fields) {
                                                    // 数据获取失败
                                                    if( err ){
                                                        db.rollback();
                                                        db.release();// 释放资源
                                                        conn.end(); // 结束当前数据库链接

                                                        return res.errorEnd('更新代言人失败', 200);
                                                    }

                                                    db.commit();
                                                    db.release(); // 释放资源
                                                    conn.end(); // 结束当前数据库链接
                                                    var back ={};
                                                    back.error_code="0";
                                                    back.error_msg="";
                                                    back.url='http://ssm.echao.com/ShareSpokesman/index.html?fans_id='+people_new.insertId+'&source_fans_id='+people_new.insertId+'&from=singlemessage&isappinstalled=0#!/join';
                                                    back.fans_id=people_new.insertId;
                                            
    
                                                    return res.successEnd(back, 0);


                                                    
                                                });




                                                
                                            });




                                            
                                        });





                                    });





                                });
                            });
                        });
                    }
                });
            });
           

        });
    
    
    });
}
