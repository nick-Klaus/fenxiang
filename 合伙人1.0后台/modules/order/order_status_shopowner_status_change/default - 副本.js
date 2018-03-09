/**
 * Created by Administrator on 2017/8/16.
 * 所有 视图
 */
const moment = require('moment');

'use strict';
exports.ready = (req, res, that) => {

    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query; // 当前请求传递过来的 GET 数据,
    const body = req.body; // 当前请求传递过来的 POST 数据



    if(req.session.user_rows = null){
         return res.errorEnd('当前请求不存在 Token 或 Token 不可用', 301);
    }
    if(req.session.user_token != body.token){
         return res.errorEnd('当前请求不存在 Token 或 Token 不可用', 300);
    }
    if(that.isEmpty(body.id) ){
         return res.errorEnd('订单ID不能为空', 300);
    }
    if(that.isEmpty(body.status) ){
         return res.errorEnd('状态不能为空', 300);
    }
    if(body.status!=1 ){
         return res.errorEnd('更新状态必须是审核成功', 300);
    }

    that.connect(( err , db , conn ) => {
        db.beginTransaction(function(err){
           
                var _date = moment().format('YYYY-MM-DD HH:mm:ss');
                var _date_log = moment().format('YYYY-MM-DD');
                var now_time = moment( moment().format('YYYY-MM-DD') ).format('X');
            
                //查对应订单数据
                db.query(" select  * from db_order     where id=? ",[body.id], function(err, order, fields) {
                    // 数据获取失败
                    if (err) {
                        db.rollback();
                        db.release();// 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd('查询订单失败', 200);
                    }

                    //需要发佣金的订单类型 1单品
                    if(order[0].activity_type==1&&order[0].status==0){
                        //不同类型不同sql
                        var activity_sql="";
                        if(order[0].activity_type==1){
                            activity_sql=" select  * from db_single_product     where id=? ";
                        }
                        
                        //查对应活动数据
                        db.query(activity_sql,[order[0].aid], function(err, activity, fields) {
                            // 数据获取失败
                            if (err) {
                                db.rollback();
                                db.release();// 释放资源
                                conn.end(); // 结束当前数据库链接
                                return res.errorEnd('查询对应活动失败', 200);
                            }
                            
                            //佣金
                            var direct_profit = activity[0].direct_profit;
                            var indirect_profit = activity[0].indirect_profit;
                            var sale_profit = activity[0].sale_profit;
                            //订单实付金额
                            var need_pay = order[0].need_pay;
                            //老板ID
                            var manager_id = order[0].mid;
                            //佣金-预收益
                            //佐卡伊延迟7天
                            //凌晨发佣金所以都要加1天
                            var ysy=1;
                            if(manager_id==60){
                                ysy=30+1;
                            //其他的次日生效
                            }else{
                                ysy=1;
                            }
                            var expect_finish_time = now_time;

                            expect_finish_time= parseInt(expect_finish_time)+parseInt(ysy*60*60*24) ;
                            //查老板数据判断是否够金额发放佣金
                            db.query(" select  * from db_manager  where id=? ",[manager_id], function(err, manager, fields) {
                                // 数据获取失败
                                if (err) {
                                    db.rollback();
                                    db.release();// 释放资源
                                    conn.end(); // 结束当前数据库链接
                                    return res.errorEnd('查询老板失败', 200);
                                }
                                var amount =  manager[0].amount;  
    
                                //是否够钱发佣金
                                if(amount+need_pay-sale_profit>=0){
                                    //开始计算佣金 老板支出表（佣金支出） 老板收入表（订单）直接代言人收入表（订单） 间接代言人收入表（订单）

                                    //直接销售人ID
                                    var direct_id = order[0].pid;

                                    db.query(" select  * from db_people  where id=? ",[direct_id], function(err, direct_people, fields) {
                                        // 数据获取失败
                                        if (err) {
                                            db.rollback();
                                            db.release();// 释放资源
                                            conn.end(); // 结束当前数据库链接
                                            return res.errorEnd('查询直接销售人失败', 200);
                                        }
                                        //间接销售人 直接销售人的上级代言人
                                        var indirect_id =  direct_people[0].prolocutor_id;

                                        db.query(" select  * from db_people  where id=? ",[indirect_id], function(err, indirect_people, fields) {
                                            // 数据获取失败
                                            if (err) {
                                                db.rollback();
                                                db.release();// 释放资源
                                                conn.end(); // 结束当前数据库链接
                                                return res.errorEnd('间接销售人失败', 200);
                                            }
                                            //老板支出表（佣金支出）
                                            var enchashment = {
                                                    openid :manager[0].openid,
                                                    manager_id :manager_id,
                                                    shopowner_id:direct_people[0].shopowner_id,
                                                    clerk_id:0,
                                                    prolocutor_id:0,
                                                    spokesman_id:0,
                                                    MONEY:sale_profit,
                                                    types:"老板端佣金支出",
                                                    type:2,
                                                    record:order[0].payment_no,
                                                    create_days:_date,
                                                    create_date:_date,
                                                    activity_id:order[0].aid,
                                                    activity_type:order[0].activity_type,
                                                    order_id:order[0].id
                                                };

                                            
                                            db.query(" INSERT INTO db_manager_enchashment set ?  ",enchashment, function(err, manager_enchashment, fields) {
                                            // 数据获取失败
                                                if (err) {
                                                    db.rollback();
                                                    db.release();// 释放资源
                                                    conn.end(); // 结束当前数据库链接
                                                    return res.errorEnd('老板端支付记录生成失败', 200);
                                                }
                                                //老板收入表（订单）
                                                var income = {
                                                    openid :manager[0].openid,
                                                    manager_id :manager_id,
                                                    shopowner_id:direct_people[0].shopowner_id,
                                                    clerk_id:0,
                                                    prolocutor_id:0,
                                                    spokesman_id:0,
                                                    MONEY:need_pay,
                                                    types:"老板订单收入",
                                                    type:5,
                                                    record:order[0].payment_no,
                                                    create_days:_date,
                                                    create_date:_date,
                                                    activity_id:order[0].aid,
                                                    activity_type:order[0].activity_type,
                                                    order_id:order[0].id
                                                };
                                                
                                                db.query(" INSERT INTO db_manager_income set ?  ",income, function(err, manager_income, fields) {
                                                // 数据获取失败
                                                    if (err) {
                                                        db.rollback();
                                                        db.release();// 释放资源
                                                        conn.end(); // 结束当前数据库链接
                                                        return res.errorEnd('老板端订单收入生成失败', 200);
                                                    }

                                                    
                                                
                                                    //直接销售人收入表（订单）
                                                    var direct_income = {
                                                        openid :direct_people[0].openid,
                                                        manager_id :manager_id,
                                                        shopowner_id:direct_people[0].shopowner_id,
                                                        clerk_id:direct_people[0].clerk_id,
                                                        prolocutor_id:direct_people[0].prolocutor_id,
                                                        spokesman_id:direct_people[0].id,
                                                        MONEY:direct_profit,
                                                        types:"直接销售人佣金收入",
                                                        type:6,
                                                        record:order[0].payment_no,
                                                        create_days:_date,
                                                        create_date:_date,
                                                        activity_id:order[0].aid,
                                                        activity_type:order[0].activity_type,
                                                        order_id:order[0].id,
                                                        expect_finish_time:expect_finish_time
                                                    };
                                                    
                                                    db.query(" INSERT INTO db_manager_income set ?  ",direct_income, function(err, manager_income, fields) {
                                                    // 数据获取失败
                                                        if (err) {
                                                            db.rollback();
                                                            db.release();// 释放资源
                                                            conn.end(); // 结束当前数据库链接
                                                            return res.errorEnd('直接销售人佣金收入生成失败', 200);
                                                        }

                                                        
                                                    
                                                        //间接销售人收入表（订单）
                                                        var indirect_income = {
                                                            openid :indirect_people[0].openid,
                                                            manager_id :manager_id,
                                                            shopowner_id:indirect_people[0].shopowner_id,
                                                            clerk_id:indirect_people[0].clerk_id,
                                                            prolocutor_id:indirect_people[0].prolocutor_id,
                                                            spokesman_id:indirect_people[0].id,
                                                            MONEY:indirect_profit,
                                                            types:"间接销售人佣金收入",
                                                            type:6,
                                                            record:order[0].payment_no,
                                                            create_days:_date,
                                                            create_date:_date,
                                                            activity_id:order[0].aid,
                                                            activity_type:order[0].activity_type,
                                                            order_id:order[0].id,
                                                            expect_finish_time:expect_finish_time
                                                        };
                                                        
                                                        db.query(" INSERT INTO db_manager_income set ?  ",indirect_income, function(err, manager_income, fields) {
                                                        // 数据获取失败
                                                            if (err) {
                                                                db.rollback();
                                                                db.release();// 释放资源
                                                                conn.end(); // 结束当前数据库链接
                                                                return res.errorEnd('间接销售人佣金收入生成失败', 200);
                                                            }


                                                            //改订单状态
                                                            db.query(" update db_order set  status =? , complete_time=unix_timestamp(now())    where id=? ",[body.status,body.id], function(err, result, fields) {
                                                                // 数据获取失败
                                                                if (err) {
                                                                    db.rollback();
                                                                    db.release();// 释放资源
                                                                    conn.end(); // 结束当前数据库链接
                                                                    return res.errorEnd('修改失败', 200);
                                                                }
                                                                //修正任务表 完成订单加一
                                                                db.query(" update db_people_task set  complete_order =complete_order+1    where user_id=? and addtime=? ",[order[0].pid,now_time], function(err, result, fields) {
                                                                    // 数据获取失败
                                                                    if (err) {
                                                                        db.rollback();
                                                                        db.release();// 释放资源
                                                                        conn.end(); // 结束当前数据库链接
                                                                        return res.errorEnd('修改任务表失败', 200);
                                                                    }
                                                                    
                                                                    db.commit();
                                                                    db.release(); // 释放资源
                                                                    conn.end(); // 结束当前数据库链接
                                                                    return res.successEnd('审批成功，佣金已正常发放！', 0);
                                                                })
                                                            })
                                                        

                                                        })
                                                    

                                                    })
                                                

                                                })
                                            

                                            

                                            })
                                            

                                        })


                                    })









                                }else{

                                  
                                    db.rollback();
                                    db.release();// 释放资源
                                    conn.end(); // 结束当前数据库链接
                                    return res.successEnd('老板端可用金额不够佣金支付！', 1);
                                }          
                         
                            })
                     
                        })










































                    }else{
                        //不需要发佣金的订单类型 直接改订单状态
                        db.query(" update db_order set  status =?   where id=? ",[body.status,body.id], function(err, result, fields) {
                            // 数据获取失败
                            if (err) {
                                return res.errorEnd('修改失败', 200);
                            }
                            db.commit();
                            db.release(); // 释放资源
                            conn.end(); // 结束当前数据库链接
                            return res.successEnd('修改成功！', 0);
                        })

                    }
                })
       
    
        });
    
    
    });
}
