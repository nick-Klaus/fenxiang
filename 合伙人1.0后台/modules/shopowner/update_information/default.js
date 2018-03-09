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
            var user_shopowner = req.session.user_shopowner;
            var data = {};
            if(body.address){
                data.address = body.address;
            }
            if(body.image){
                data.image = body.image;
            }
            if(body.shop_name){
                data.shop_name = body.shop_name;
            }
            if(body.phone){
                data.phone = body.phone;
            }
            if(body.text_information){
                data.text_information = body.text_information;
            }
            db.query(" update db_shop set ? where id=? ",[data,body.id], function(err, result, fields) {
                // 数据获取失败
                if(body.policy_key){
                    var data1 = {};
                    data1.policy_key = body.policy_key;
                    db.query(" update db_shopowner set ? where id=? ",[data1,user_shopowner.id], function(err, result, fields) {
                        // 数据获取失败
                        db.commit();
                        db.release(); // 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.successEnd('修改店铺信息成功！', 0);
                    })
                }else{
                    db.commit();
                    db.release(); // 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.successEnd('修改店铺信息成功！', 0);
                }
                
            })

        });
    });
}
