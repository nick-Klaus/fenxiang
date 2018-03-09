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
            var data = {};
            data.address = body.address;
            data.image = body.image;
            data.shop_name = body.shop_name;
            data.phone = body.phone;
            data.text_information = body.text_information;
            data.province = body.province;
            data.city = body.city;
            data.area = body.area;
            data.invite_image = body.invite_image;
            data.shop_pic = body.shop_pic;
            db.query(" update db_shop set ? where id=? ",[data,body.id], function(err, result, fields) {
                // 数据获取失败
                if (err) {
                    return res.errorEnd('没有找到可用数据1', 200);
                }
                if( body.policy_key ){
                    var data1 = {};
                    data1.policy_key = body.policy_key;
                    db.query(" update db_shopowner set ? where id=? ",[data1,body.shopowner_id], function(err1, result1, fields1) {
                        // 数据获取失败
                        if (err1) {
                            return res.errorEnd('没有找到可用数据1', 200);
                        }
                        db.commit();
                        db.release(); // 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.successEnd('修改店铺信息成功！', 0);
                    })
                } else {
                    db.commit();
                    db.release(); // 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.successEnd('修改店铺信息成功！', 0);
                }

            })

        });
    });
}
