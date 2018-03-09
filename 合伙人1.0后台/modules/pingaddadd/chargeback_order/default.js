/**
 * Created by Administrator on 2017/8/16.
 * 所有活动的获取 视图
 */
'use strict';
exports.ready = (req, res, that) => {

    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query; // 当前请求传递过来的 GET 数据,
    const body = req.body; // 当前请求传递过来的 POST 数据
    that.connect(( err , db , conn ) => {
        db.beginTransaction(function(err){
            if(  that.isEmpty(body) ){
                return res.errorEnd('无内容', 200);
            }
    

           
           


            var data = {



                    order_no : body.data.object.order_no,
                    type : body.type,
                    object : body.data.object.object,
                    app : body.data.object.app,
                    channel:body.data.object.channel,
                    client_ip:body.data.object.client_ip,
                    amount:body.data.object.amount,
                    currency:body.data.object.currency,
                    subject:body.data.object.subject,
                    body:body.data.object.body,
                    time_paid:body.data.object.time_paid,
                    transaction_no:body.data.object.transaction_no,
                    out_order_id:body.data.object.id,
     
                 
                }; 
      

            db.query("INSERT INTO `db_pingaddadd_webhooks` SET ? ",data, function(err, result, fields) {
                // 数据获取失败
                 if( err ){
                    // 数据插入失败, 回滚
                    db.rollback();
                    db.release();// 释放资源
                    return res.errorEnd('创建ing++支付通知数据失败!!', 200);
                }


                if(result){

                     db.query(" update db_people set shopowner_id =? ,is_shopowner = '1' ,is_prolocutor='1',is_clerk='1',prolocutor_id=?,clerk_id=0 where id=? ",[result.insertId,body.pid,body.pid], function(err, result, fields) {
                        // 数据获取失败
                        if (err) {
                            return res.errorEnd('ping++支付通知失败', 200);
                        }
                        db.commit();
                        db.release(); // 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.successEnd('ping++支付通知成功！', 0);
                    })
              
                }
            
           
            })


    
        });
    
    
    });
}
