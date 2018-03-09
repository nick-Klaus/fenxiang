
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

                if(that.isEmpty(body.manager_id) ){
                    db.rollback();
                    db.release();// 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd('老板不能为空', 200);
                }
                if(that.isEmpty(body.to_shopowner_id) ){
                    db.rollback();
                    db.release();// 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd('预约到哪家店的店长ID不能为空', 200);
                }
                if(that.isEmpty(body.from_clerk_id) ){
                    db.rollback();
                    db.release();// 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd('发券店员不能为空', 200);
                }
                if(that.isEmpty(body.people_id) ){
                    db.rollback();
                    db.release();// 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd('预约人不能为空', 200);
                }
                if(that.isEmpty(body.appointment_name) ){
                    db.rollback();
                    db.release();// 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd('预约姓名不能为空', 200);
                }
                if(that.isEmpty(body.mobile) ){
                    db.rollback();
                    db.release();// 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd('手机不能为空', 200);
                }
                if(that.isEmpty(body.coupons_record_id) ){
                    db.rollback();
                    db.release();// 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd('卡券发放记录ID不能为空', 200);
                }  

                var myDate = new Date();
                var now_time = myDate.getTime();
                var day = myDate.getDate();
                var month = myDate.getMonth()+1;
                var year = myDate.getFullYear();
            

                var appointment = {
            
                    manager_id : body.manager_id,
                    create_time: new Date()/1000,
                    to_shopowner_id: body.to_shopowner_id,
                    from_clerk_id: body.from_clerk_id,
                    people_id:body.people_id,
                    appointment_name:body.appointment_name,
                    mobile:body.mobile,
                    address:body.address,
                    status:1,
                    remark:body.remark,
                    coupons_record_id:body.coupons_record_id,
                    to_clerk_id:0,
                    is_set:1,
                    view_time:body.view_time
                    
                };

   

                db.query(" insert into  `db_appointment` set ?",[appointment], function(err, result, fields) {
                        // 数据获取失败
                        if (err) {
                            db.rollback();
                            db.release();// 释放资源
                            conn.end(); // 结束当前数据库链接
                            return res.errorEnd('插入预约记录失败', 200);
                        }
                         

                        var data1 = {
                            appointment_no : "AP"+year+month+day+result.insertId
                        };
                        db.query( "UPDATE ?? SET  ? WHERE id = ? " , [ 'db_appointment' , data1,result.insertId ] , function( err1, result1 , fields1 ){
                            if (err) {
                                db.rollback();
                                db.release();// 释放资源
                                conn.end(); // 结束当前数据库链接
                                return res.errorEnd('更新预约记录失败', 200);
                            }
                            db.commit();
                            db.release(); // 释放资源
                            conn.end(); // 结束当前数据库链接
                            return res.successEnd('预约成功', 0); 
                        });
                   
                })

                   

           
                
           
            })

                
                    
                
			
                

   

        

           


            
      

           


    
 
    
    
    });
}
