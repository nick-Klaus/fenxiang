/**
 * Created by Administrator on 2017/8/9.
 *  活动的开启和关闭
 */

 const moment = require('moment');
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
    if(  that.isEmpty(body.manager_id) ){
        return res.errorEnd('老板不能为空', 200);
    }
    if(  that.isEmpty(body.activity_type) ){
        return res.errorEnd('活动类型不能为空', 200);
    }
    if(  that.isEmpty(body.activity_id) ){
        return res.errorEnd('活动ID不能为空', 200);
    }
    if(  that.isEmpty(body.capital) ){
        return res.errorEnd('补充资金不能为空', 200);
    }
    console.log(body);
    var _date = moment().format('YYYY-MM-DD hh:mm:ss');
    var _date_log = moment().format('YYYY-MM-DD');

    var activity_table = "";
    if(body.activity_type==1){
        activity_table = " db_single_product ";
    }else if(body.activity_type==2){
        activity_table = " db_bargain ";
    }else if(body.activity_type==3){
        activity_table = " db_crowd_funding ";
    }else if(body.activity_type==4){
        activity_table = " db_fight_groups ";
    }else if(body.activity_type==6){
        activity_table = " db_leaflet ";
    }else{
        return res.errorEnd('此活动类型不能补充资金!!', 200);
    }

    that.connect(( err , db , conn ) => {
        db.beginTransaction(function(err){



  

            db.query( "select  * from "+activity_table+"     where id=?  and boss_id =? " , [body.activity_id,body.manager_id ] , function( err, activity , fields ){
                if( err ||activity.length==0){
                    db.release();// 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd('没有找到对应活动!!', 200);
                }
                db.query( "select  * from db_manager  where id=? " , [body.manager_id ] , function( err, manager , fields ){

                    if( err ||manager.length==0){
                        db.release();// 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd('查询老板失败', 200);
                    }

                    var amount =  manager[0].amount;  
        
                    //是否够补充资金
                    if(amount-body.capital>=0){
                        var enchashment = {
                                openid :manager[0].openid,
                                manager_id :body.manager_id,
                                shopowner_id:0,
                                clerk_id:0,
                                prolocutor_id:0,
                                spokesman_id:0,
                                MONEY:body.capital,
                                types:"活动分享金补充",
                                type:6,
                                record:"活动分享金补充(老板)",
                                create_days:_date,
                                create_date:_date,
                                activity_id:body.activity_id,
                                activity_type:body.activity_type,
                            };
                        db.query(" INSERT INTO db_manager_enchashment set ?  ",enchashment, function(err, enchashment, fields) {
                            // 数据获取失败
                                if (err) {
                                    db.release();// 释放资源
                                    conn.end(); // 结束当前数据库链接
                                    return res.errorEnd('老板端支付记录生成失败', 200);
                                }
                                db.query(" update "+activity_table+" set start_up_money_all=start_up_money_all+?,start_up_money_residue=start_up_money_residue+? where id=? and boss_id =? ",[body.capital,body.capital,body.activity_id,body.manager_id], function(err, start_up_money_all, fields) {
                                // 数据获取失败
                                    if (err) {
                                        db.release();// 释放资源
                                        conn.end(); // 结束当前数据库链接
                                        return res.errorEnd('更新活动启动资金失败', 200);
                                    }
                                    db.commit();
                                    db.release(); // 释放资源
                                    conn.end(); // 结束当前数据库链接
                                    return res.successEnd('启动资金补充成功！', 0);

                                });
                        });


                    }else{
                        db.release(); // 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.successEnd('老板端可用金额不够启动资金补充！', 1);

                    }
              
                });
              
            });

        });

    });
}
