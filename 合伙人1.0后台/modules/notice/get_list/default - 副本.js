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
        // 查询数据
        if(  that.isEmpty(body.manager_id) ){
            return res.errorEnd('老板不能为空', 200);
        }
        if(  that.isEmpty(body.pid) ){
            return res.errorEnd('个人不能为空', 200);
        }
        db.query("SELECT a.*, IFNULL(b.status,0)  record_status FROM `db_notice` a left join `db_noticet_record`  b on a.id = b.notice_id    where ( a.notice_type=1  and manager_id=? and b.pid =? and b.status=1 ) or ( a.notice_type=1  and manager_id=? and (b.status is null or b.status=1) ) union all   SELECT a.*, IFNULL(b.status,0)  record_status FROM `db_notice` a left join `db_noticet_record`  b on a.id = b.notice_id    where ( a.notice_type=2    and manager_id=? and a.pid=b.pid and b.pid =? and b.status=1) or ( a.notice_type=2  and manager_id=? and a.pid=? and (b.status is null or b.status=1)) order by create_time desc",[body.manager_id,body.pid,body.manager_id,body.manager_id,body.pid,body.manager_id,body.pid], function(err, row, fields) {
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
