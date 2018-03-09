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
        if( that.isEmpty(user.manager_id) || that.isEmpty(user.shopowner_id) ){
            db.release();// 释放资源
            conn.end(); // 结束当前数据库链接
            return res.errorEnd('条件不能为空', 200);
        }
        var end_time = ' and  end_time > now() ';
        // 进行中的活动有多少条
        var sql = "select count(id) as id_num  from `activity_all_new` where  boss_id=? and (to_shopowner_id=? or action_area=1) "+end_time;
        db.query(sql,[user.manager_id,user.shopowner_id], function(err, row, fields) {
            // 数据获取失败
            if (err) {
                db.release();// 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd('没有找到可用数据', 200);
            }
            // 活动的分享 转发 查看总数统计
            db.query("select sum(user_fx) as fx ,sum(user_zf) as zf ,sum(user_ck) as ck ,sum(start_up_money_all) as money,sum(start_up_money_residue) as money_new,sum(return_money) as money_old from `activity_all_new` where  boss_id=? and (to_shopowner_id=? or action_area=1)",[user.manager_id,user.shopowner_id], function(err, row1, fields) {
                // 数据获取失败
                if (err) {
                    db.release();// 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd('没有找到可用数据1', 200);
                }
                db.query("SELECT sum(a.share_all) as fx,sum(a.forward_all) as zf ,sum(a.see_all) as ck  FROM `db_activity_log` a LEFT JOIN `db_people` b on a.user_id=b.id  WHERE manager_id=? and shopowner_id=?",[user.manager_id,user.shopowner_id], function(err, row2, fields) {
                    // 数据获取失败
                    if (err) {
                        db.release();// 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd('没有找到可用数据2', 200);
                    }
                    // conduct进行中的活动 fx_num 总的分享人数 ck_num 总的查看人数
                    var fx_all = row2[0].fx;
                    // var fx_all = Number(row1[0].fx) + Number(row1[0].zf)
                    var _consume = that.floatSub(parseFloat(row1[0].money),parseFloat(row1[0].money_old));
                    var consume = that.floatSub(parseFloat(_consume),parseFloat(row1[0].money_new));
                    var _activity = {"conduct":Number(row[0].id_num),"fx_num":fx_all,"ck_num":Number(row2[0].ck),"money":consume,"money_new":Number(row1[0].money_new) };
                    db.release(); // 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.successEnd(_activity);
                })
            })
        })
    });
}