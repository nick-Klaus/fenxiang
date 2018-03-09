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
            if(body.status == 1){
                var data = {};
                if(body.nickname){
                    data.nickname = body.nickname;
                }
                if(body.headimgurl){
                    data.headimgurl = body.headimgurl;
                }
                if(body.realname){
                    data.realname = body.realname;
                }
                if(body.mobile){
                    data.mobile = body.mobile;
                }
                db.query(" update db_people set ? where token=? ",[data,body.token], function(err, result, fields) {
                    // 数据获取失败
                    if (err) {
                        return res.errorEnd('修改店铺信息失败', 200);
                    }
                    db.commit();
                    db.release(); // 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.successEnd('修改店铺信息成功！', 0);
                })
            }else if(body.status == 2){
                var data = {};
                if(body.company){
                    data.company = body.company;
                    db.query("select manager_id from `db_people`  where token = ?", body.token  , function(err, row, fields) {
                    // 数据获取失败
                        if (err) {
                            return res.errorEnd('没有找到可用数据1', 200);
                        }
                        db.query(" update db_manager set ? where id=? ",[data,row[0].manager_id], function(err, result, fields) {
                            // 数据获取失败
                            if (err) {
                                return res.errorEnd('修改店铺信息失败', 200);
                            }
                            db.commit();
                            db.release(); // 释放资源
                            conn.end(); // 结束当前数据库链接
                        
                            return res.successEnd('修改店铺信息成功！', 0);
                        })
                       
                    });
                    
                }
            }
        });
    });
}
