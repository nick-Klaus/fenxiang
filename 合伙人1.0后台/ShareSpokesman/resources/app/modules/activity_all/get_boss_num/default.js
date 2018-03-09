/**
 * Created by Administrator on 2017/8/11.
 * 获取活动的 统计  进行中   转发 点击
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
        if( that.isEmpty(user.manager_id) ){
            db.release();// 释放资源
            conn.end(); // 结束当前数据库链接
            return res.errorEnd('条件不能为空', 200);
        }
        var end_time = ' and  end_time > now() ';
        var sql = "select count(id) as id_num  from `activity_all` where  boss_id=?  "+end_time;
        db.query(sql,[user.manager_id], function(err, row, fields) {
            // 数据获取失败
            if (err) {
                db.release();// 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd('没有找到可用数据', 200);
            }
            db.query("select sum(share_new) as fx ,sum(forward_new) as zf , sum(see_new) as ck from `db_activity_log` where  boss_id=? ",[user.manager_id], function(err, row1, fields) {
                // 数据获取失败
                if (err) {
                    db.release();// 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd('没有找到可用数据', 200);
                }
                // conduct进行中的活动 fx_num 总的分享人数 ck_num 总的查看人数
                var _activity = {"conduct":row[0].id_num,"fx_num":row1[0].fx,"zf_num":row1[0].zf,"ck_num":row1[0].ck };
                db.release(); // 释放资源
                conn.end(); // 结束当前数据库链接
                return res.successEnd(_activity);
            })
        })
    });
}