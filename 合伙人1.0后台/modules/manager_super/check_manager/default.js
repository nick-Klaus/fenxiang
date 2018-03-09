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

 



            db.query("SELECT * from  `db_people` where     id =? ",[body.pid], function(err, people, fields) {
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
                            back.error_code="0";
                            back.error_msg="已经是老板了";
                            back.url='http://ssm.echao.com/ShareSpokesman/index.html?fans_id='+boss[0].id+'&source_fans_id='+boss[0].id+'&from=singlemessage&isappinstalled=0#!/join';
                            back.fans_id=boss[0].id;
                        return res.successEnd(back);
                    }else{
                        db.rollback();
                        db.release();// 释放资源
                        conn.end(); // 结束当前数据库链接
                        var back ={};
                            back.error_code="200";
                        return res.errorEnd(back);

                    }
                });
            });
           

        });
    
    
    });
}
