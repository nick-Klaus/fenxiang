'use strict';



const moment = require('moment');


exports.ready = (req, res, that) => {

    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query; // 当前请求传递过来的 GET 数据,
    const body = req.body; // 当前请求传递过来的 POST 数据

    // 链接数据库
    // 链接 / 操作数据库
    // 有不懂, 看这个 http://blog.csdn.net/zxsrendong/article/details/17006185
    
    if(req.session.user_rows == null){
         return res.errorEnd('当前请求不存在 Token 或 Token 不可用', 300);
     }
    if(req.session.user_token != body.token){
         return res.errorEnd('当前请求不存在 Token 或 Token 不可用', 300);
    }
    if(  that.isEmpty(body.nickname) ){
        return res.errorEnd('个人不能为空', 200);
    }
    if(  that.isEmpty(body.mobile) ){
        return res.errorEnd('电话不能为空', 200);
    }
    var user = req.session.user_rows;
    that.connect((err, db,conn) => {
        db.beginTransaction(function(err){


            var a = /^1(3|4|5|7|8)\d{9}$/.test(body.mobile);
            if(a == false ){
                db.release(); // 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd('手机号码格式不正确', 200);
            }
            console.log(user);
            db.query("select * from `db_people` where id=? ", [user.id], function(err, people, fields) {
                    // 数据获取失败
                if (err) {
                    db.release(); // 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd('没有找到个人可用数据', 200);
                }
     
                db.query("select * from `db_people` where mobile = ? and manager_id = ?  and  is_prolocutor='1'  ", [body.mobile,people[0].manager_id], function(err, row, fields) {
                    // 数据获取失败
                    if (err) {
                        db.release(); // 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd('没有找到可用数据', 200);
                    }
        
                    if(row.length > 0){
                        db.release(); // 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd('该手机号码已经被绑定', 200);
                    }

                    var data = null;
                    var is_first = false;
                    var time=null;
                    if(people[0].prolocutor_time==null){
                        is_first = true;
                        var date = new Date();
                        time = date.getTime();
                        time = parseInt(time / 1000);
                        data = {
                            nickname : body.nickname,
                            mobile : body.mobile,
                            is_prolocutor : '1' , 
                            prolocutor_time:time
                        };
                    }else{
                        data = {
                            nickname : body.nickname,
                            mobile : body.mobile,
                            is_prolocutor : '1' 
                        };
                    }

                    console.log(data);

                    // 更新数据
                    db.query( "UPDATE ?? SET  ? WHERE id = ? " , [ 'db_people' , data ,people[0].id ] , function( err1, result1 , fields1 ){
                        if( err1 ){
                            console.log(this.sql);
                            db.rollback();
                            db.release(); // 释放资源
                            conn.end(); // 结束当前数据库链接
                            return res.errorEnd('更新数据失败!!', 200);
                        }

                        if(!is_first){
                            db.commit();
                            db.release(); // 释放资源
                            conn.end(); // 结束当前数据库链接
                            return res.successEnd( '成为代言人成功!' ,0);
                        }else{
                            //发第一次邀请的钱

                            db.query("select * from `db_people_day_rule` where  manager_id = ?", [people[0].manager_id], function(err, rule, fields) {
                                // 数据获取失败
                                if (err) {
                                    db.rollback();
                                    db.release(); // 释放资源
                                    conn.end(); // 结束当前数据库链接
                                    return res.errorEnd('没有找到规则数据', 200);
                                }

                                db.query("select * from `db_manager` where  id = ?", [people[0].manager_id], function(err, manager, fields) {
                                    // 数据获取失败
                                    if (err) {
                                        db.rollback();
                                        db.release(); // 释放资源
                                        conn.end(); // 结束当前数据库链接
                                        return res.errorEnd('没有找到老板数据', 200);
                                    }


                                    //老板端有余额，规则表配置金额大于0，老板余额大于或等于规则表配置金额才能发钱
                                    if(manager[0].amount>0&&rule[0].add_prolocutor_time>0&&manager[0].amount-rule[0].add_prolocutor_time>=0){

                                        var _date = moment().format('YYYY-MM-DD HH:mm:ss');
                                        var _date_log = moment().format('YYYY-MM-DD');
                                        var now_time = moment( moment().format('YYYY-MM-DD') ).format('X');
                                        db.query("select * from `db_people` where  id = ?",[people[0].prolocutor_id], function(err, prolocutor, fields) {
                                            // 数据获取失败
                                            if (err) {
                                                db.rollback();
                                                db.release(); // 释放资源
                                                conn.end(); // 结束当前数据库链接
                                                return res.errorEnd('没有找到上级代言人数据', 200);
                                            }


                                            var enchashment = {
                                                openid :manager[0].openid,
                                                manager_id :manager[0].id,
                                                shopowner_id:prolocutor[0].shopowner_id,
                                                clerk_id:0,
                                                prolocutor_id:0,
                                                spokesman_id:0,
                                                MONEY:rule[0].add_prolocutor_time,
                                                types:"发展代言人支出",
                                                type:7,
                                                record:"发展代言人支出",
                                                create_days:_date,
                                                create_date:_date,
                                                activity_id:0,
                                                activity_type:0,
                                                order_id:0
                                            };


                                            db.query(" INSERT INTO db_manager_enchashment set ?  ",enchashment, function(err, manager_enchashment, fields) {
                                                // 数据获取失败
                                                if (err) {
                                                    db.rollback();
                                                    db.release();// 释放资源
                                                    conn.end(); // 结束当前数据库链接
                                                    return res.errorEnd('老板端支付记录生成失败', 200);
                                                }

                                                //发展代言人收入
                                                var income = {
                                                    openid :prolocutor[0].openid,
                                                    manager_id :manager[0].id,
                                                    shopowner_id:prolocutor[0].shopowner_id,
                                                    clerk_id:prolocutor[0].clerk_id,
                                                    prolocutor_id:prolocutor[0].prolocutor_id,
                                                    spokesman_id:prolocutor[0].id,
                                                    MONEY:rule[0].add_prolocutor_time,
                                                    types:"发展代言人收入",
                                                    type:9,
                                                    record:"发展代言人收入",
                                                    create_days:_date,
                                                    create_date:_date,
                                                    activity_id:0,
                                                    activity_type:0,
                                                    order_id:0
                                                };
                                                
                                                db.query(" INSERT INTO db_manager_income set ?  ",income, function(err, prolocutor_income, fields) {
                                                // 数据获取失败
                                                    if (err) {
                                                        db.rollback();
                                                        db.release();// 释放资源
                                                        conn.end(); // 结束当前数据库链接
                                                        return res.errorEnd('代言人收入生成失败', 200);
                                                    }
                                                    //发展代言人的记录
                                                    var people_record = {
                                                        openid :people[0].openid,
                                                        manager_id :manager[0].id,
                                                        people_id:people[0].id,
                                                        prolocutor_id:people[0].prolocutor_id,
                                                        commission:"发展代言人"+body.nickname+"获得奖励金："+rule[0].add_prolocutor_time,
                                                        ip:req.ip.split(':')[3],
                                                        reward_type:1,
                                                        reward_money:rule[0].add_prolocutor_time,
                                                        addtime:(new Date()).getTime()/1000
                                                    };
                                                    db.query(" INSERT INTO db_people_record set ?  ",people_record, function(err, prolocutor_income, fields) {
                                                        // 数据获取失败
                                                        if (err) {
                                                            db.rollback();
                                                            db.release();// 释放资源
                                                            conn.end(); // 结束当前数据库链接
                                                            return res.errorEnd('代言人收入生成失败', 200);
                                                        }
                                                        db.commit();
                                                        db.release(); // 释放资源
                                                        conn.end(); // 结束当前数据库链接
                                                        return res.successEnd( '成为代言人成功!' ,0);

                                                    });

                                                });
                                            });

                                        });
                                            
                                    }else{
                                        //发展代言人的记录
                                        var people_record = {
                                            openid :people[0].openid,
                                            manager_id :manager[0].id,
                                            people_id:people[0].id,
                                            prolocutor_id:people[0].prolocutor_id,
                                            commission:"发展代言人"+body.nickname+"获得奖励金：0",
                                            ip:req.ip.split(':')[3],
                                            reward_type:2,
                                            reward_money:0,
                                            addtime:(new Date()).getTime()/1000
                                        };
                                        db.query(" INSERT INTO db_people_record set ?  ",people_record, function(err, prolocutor_income, fields) {
                                            // 数据获取失败
                                            if (err) {
                                                db.rollback();
                                                db.release();// 释放资源
                                                conn.end(); // 结束当前数据库链接
                                                return res.errorEnd('代言人收入生成失败', 200);
                                            }
                                            db.commit();
                                            db.release(); // 释放资源
                                            conn.end(); // 结束当前数据库链接
                                            return res.successEnd( '成为代言人成功!' ,0);

                                        });


                                    }



                                });


                            });



                        }

               
                    }); 
                    

                   
                })

                   
            })



 

        });



    });
}