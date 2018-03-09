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
    if(req.session.user_rows = null){
         return res.errorEnd('当前请求不存在 Token 或 Token 不可用', 300);
    }
    if(req.session.user_token != body.token){
         return res.errorEnd('当前请求不存在 Token 或 Token 不可用', 300);
    }
    if(  that.isEmpty(body.pid) ){
        return res.errorEnd('个人不能为空', 200);
    }

    var is_extend =0;
    var extend_time=0;
    //是否推广
    if(  !that.isEmpty(body.is_extend)){
        is_extend=body.is_extend;
        if(body.is_extend==1){
 			if( !that.isEmpty(body.extend_time) ){
        		extend_time=body.extend_time;
    		}        
    	}
       
    }
    

    that.connect(( err , db , conn ) => {
        db.beginTransaction(function(err){

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
                        

                        // var back ={};
                        //     back.error_code="400";
                        //     back.error_msg="已经是老板了";
                        //     back.fans_id=boss[0].id;
                        return res.errorEnd("已经是老板了", 200);
                    }else{
                        db.query("SELECT * from  `db_manager_apply` where    openid =? ",[people[0].openid], function(err, apply, fields) {
                            // 数据获取失败
                            if (err) {
                                db.rollback();
                                db.release();// 释放资源
                                conn.end(); // 结束当前数据库链接
                                return res.errorEnd('已是老板或用户不存在', 200);
                            }

                            //这个openid已经有未审批数据
                            if(apply.length>0){
                                db.rollback();
                                db.release();// 释放资源
                                conn.end(); // 结束当前数据库链接
                                

                                // var back ={};
                                //     back.error_code="500";
                                //     back.error_msg="已有提交过的审批，请耐心等待！";
                                return res.errorEnd("已有提交过的审批，请耐心等待！", 200);
                            }else{

                                var manager_apply = {

                                    openid:people[0].openid,
                                    pid:body.pid,
                                    create_time:new Date()/1000,
                                    status:0,
                                    apply_remark:body.apply_remark,
                                    manager_id:people[0].manager_id,
                                    nickname:people[0].nickname,
                                    headimgurl:people[0].headimgurl,
                                    mobile:people[0].mobile,
                                    is_extend:is_extend,
                                    extend_time:extend_time

                                 
                                };
                                //生成老板记录 
                                db.query("insert into db_manager_apply set ? ",[manager_apply], function(err, manager_apply, fields) {
                                    // 数据获取失败
                                    if (err) {
                                        
                                        db.rollback();
                                        db.release();// 释放资源
                                        conn.end(); // 结束当前数据库链接
                                        return res.errorEnd('创建老板失败', 200);
                                    }
                                    db.commit();
                                    db.release(); // 释放资源
                                    conn.end(); // 结束当前数据库链接
                                    // var back ={};
                                    // back.error_code="0";
                                    // back.error_msg="提交审批成功！";                    
                                    return res.successEnd("提交审批成功！", 0);

                                }); 


                            }

                        }); 




                      
                    }

                });
            });

        });
    
    
    });
}
