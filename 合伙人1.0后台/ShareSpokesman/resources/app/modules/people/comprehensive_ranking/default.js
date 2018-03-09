/**
 * Created by Administrator on 2017/8/16.
 * 所有活动的获取 视图
 */
'use strict';
exports.ready = (req, res, that) => {

    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query; // 当前请求传递过来的 GET 数据,
    const body = req.body; // 当前请求传递过来的 POST 数据

    if(  that.isEmpty(body.pid) ){
        return res.errorEnd('个人不能为空', 200);
    }
    if(  that.isEmpty(body.guest_id) ){
        return res.errorEnd('个人不能为空', 200);
    }
    that.connect(( err , db , conn ) => {

        var back = {};
        db.query(" select a.id id ,(select count(*) from db_order where pid = a.id) order_number ,IFNULL(b.profit_all,0) profit_all from `db_people` a left join `db_activity_log` b  on a.openid = b.openid where a.prolocutor_id = ? or a.id = ? order by b.profit_all desc , order_number desc,a.id asc   ",[body.pid,body.pid], function(err, row, fields) {
            
            // 数据获取失败
            if (err) {
                db.release();// 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd('没有找到可用数据', 200);
            }
            if(row.lengh==1){
                back.rank_price =1 ;
            }else{
                for(var i=0;i<row.length;i++){
                    if(row[i].id ==body.guest_id){
                        back.rank_price =i+1 ;
                    }

                }
                
            }
         

            db.query(" select a.id id ,(select count(*) from db_order where pid = a.id) order_number ,IFNULL(b.profit_all,0) profit_all from `db_people` a left join `db_activity_log` b  on a.openid = b.openid where a.prolocutor_id = ? or a.id = ? order by order_number desc, b.profit_all desc  ,a.id asc   ",[body.pid,body.pid], function(err, row, fields) {
            
                // 数据获取失败
                if (err) {
                    db.release();// 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd('没有找到可用数据', 200);
                }
                if(row.lengh==1){
                    back.rank_order =1 ;
                }else{
                    for(var i=0;i<row.length;i++){
                        if(row[i].id ==body.guest_id){
                            back.rank_order =i+1 ;
                        }

                    }
                    
                }
             


              
                db.release(); // 释放资源
                conn.end(); // 结束当前数据库链接
                return res.successEnd(back); 
          
            })

          
       
          
        })
    });
}
