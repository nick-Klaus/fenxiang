/**
 * Created by Administrator on 2017/8/11.
 * 单品活动用户获取
 */
'use strict';
exports.ready = (req, res, that) => {

    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query; // 当前请求传递过来的 GET 数据,
    const body = req.body; // 当前请求传递过来的 POST 数据
    if(that.isEmpty(req.session.user_token)){
        return res.errorEnd('当前请求不存在 Token 或 Token 不可用', 300);
    }
    var user = req.session.user_rows;
    that.connect(( err , db , conn ) => {
        // 查询数据
        if( that.isEmpty(body.single_product_id) || that.isEmpty(body.id) ){
            return res.errorEnd('条件不能为空', 200);
        }
        db.query("select * from `db_single_product_user` where id=? and single_product_id=?",[body.id,body.single_product_id], function(err, row, fields) {
            // 数据获取失败
            if (err) {
                return res.errorEnd('没有找到可用数据', 200);
            }
            // 这个打印, 只会出现在主程序的控制台中
            db.release(); // 释放资源
            conn.end(); // 结束当前数据库链接
            return res.successEnd(row);
        })
    });
}
