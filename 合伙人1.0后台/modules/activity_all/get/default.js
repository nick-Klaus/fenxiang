/**
 * Created by Administrator on 2017/8/16.
 * 所有活动的获取 视图
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
        // 查询数据历史，有有历史次数加1，没有的新增
        var search_text=body.param_text;
        if(!that.isEmpty(body.param_text)){

            db.query("select * from db_search_log where search_type = 2 and pid =? and content =?", [user.id,search_text], function(err, search_log, fields) {

                // 数据获取失败
                if (err) {
                    db.release(); // 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd("没有找到可用数据1", 200);
                }

                if(search_log.length>0){
                    db.query(" update db_search_log set search_times=search_times+1 ,search_date = unix_timestamp(now()) where id =? ", [search_log[0].id], function(err, row, fields) {
                        // 数据获取失败

                    })
                }else{
                    db.query("INSERT INTO db_search_log ( pid, search_type, search_date, content) VALUES (?,2, unix_timestamp(now()),?);", [user.id,search_text], function(err, row, fields) {
                        // 数据获取失败

                    })
                }

            })
        }
        if(that.isEmpty(body.param_text)){
            body.param_text = "%%";
        }else{
            body.param_text = "%"+body.param_text+"%";
        }
        // 按剩余奖品数量排序
        if( !that.isEmpty(body.quantity) ){
            if( !that.isEmpty(body.activity_type) ){
                db.query("SELECT * FROM `activity_all_new` WHERE activity_type in(?) and  boss_id=? and open_off=2 and status=1  and activity_title LIKE ? and (to_shopowner_id=? or action_area=1) order by quantity asc,addtime desc ",[user.manager_id,body.param_text,user.shopowner_id], function(err, row1, fields) {
                    // 数据获取失败
                    if (err) {
                        db.release();// 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd("没有找到可用数据2", 200);
                    }
                    var _totalrecord = row1[0].num; //总共有多少条数据
                    var _totalpage  = Math.ceil(Number(row1[0].num)/Number(body.pagesize)); // 总共有多少页
                    var _pagesize    = Number(body.pagesize); // 每页有多少数据
                    var _currentpage = Number(body.currentpage); // 当前页
                    var sql = "SELECT * FROM `activity_all_new` WHERE activity_type in(?) and boss_id=? and open_off=2 and status=1 and activity_title LIKE ? and (to_shopowner_id=? or action_area=1) order by quantity asc,addtime desc limit "+ _currentpage + "," + _pagesize;
                    db.query(sql,[body.activity_type,user.manager_id,body.param_text,user.shopowner_id], function(err, row, fields) {
                        // 数据获取失败
                        if (err) {
                            db.release();// 释放资源
                            conn.end(); // 结束当前数据库链接
                            return res.errorEnd("没有找到可用数据3", 200);
                        }
                        var back = {"totalrecord":_totalrecord,"totalpage":_totalpage,"pagesize":_pagesize,"currentpage":_currentpage}
                        back.list = row;
                        db.release(); // 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.successEnd(back);
                    })
                })
            }else{
                db.query("SELECT count(id) as num FROM `activity_all_new` WHERE  boss_id=? and open_off=2 and status=1  and activity_title LIKE ? and (to_shopowner_id=? or action_area=1) order by quantity asc,addtime desc ",[user.manager_id,body.param_text,user.shopowner_id], function(err, row1, fields) {
                    // 数据获取失败
                    if (err) {
                        db.release();// 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd("没有找到可用数据4", 200);
                    }
                    var _totalrecord = row1[0].num; //总共有多少条数据
                    var _totalpage  = Math.ceil(Number(row1[0].num)/Number(body.pagesize)); // 总共有多少页
                    var _pagesize    = Number(body.pagesize); // 每页有多少数据
                    var _currentpage = Number(body.currentpage); // 当前页
                    var sql = "SELECT * FROM `activity_all_new` WHERE   boss_id=? and open_off=2 and status=1 and activity_title LIKE ? and (to_shopowner_id=? or action_area=1) order by quantity asc,addtime desc limit "+ _currentpage + "," + _pagesize;
                    db.query(sql,[user.manager_id,body.param_text,user.shopowner_id], function(err, row, fields) {
                        // 数据获取失败
                        if (err) {
                            db.release();// 释放资源
                            conn.end(); // 结束当前数据库链接
                            return res.errorEnd("没有找到可用数据5", 200);
                        }
                        var back = {"totalrecord":_totalrecord,"totalpage":_totalpage,"pagesize":_pagesize,"currentpage":_currentpage}
                        back.list = row;
                        db.release(); // 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.successEnd(back);
                    })
                })
            }
        }
        // 按价格排序
        if( !that.isEmpty(body.original_price) ){
            if( !that.isEmpty(body.activity_type) ){
                db.query("SELECT count(id) as num FROM `activity_all_new` WHERE activity_type in (?) and boss_id=? and open_off=2 and status=1 and activity_title LIKE ? and (to_shopowner_id=? or action_area=1) order by  addtime desc ",[body.activity_type,user.manager_id,body.param_text,user.shopowner_id], function(err, row1, fields) {
                    // 数据获取失败
                    if (err) {
                        db.release();// 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd("没有找到可用数据6", 200);
                    }
                    var _totalrecord = row1[0].num; //总共有多少条数据
                    var _totalpage  = Math.ceil(Number(row1[0].num)/Number(body.pagesize)); // 总共有多少页
                    var _pagesize    = Number(body.pagesize); // 每页有多少数据
                    var _currentpage = Number(body.currentpage); // 当前页
                    var sql = "SELECT * FROM `activity_all_new` WHERE activity_type in (?) and boss_id=? and open_off=2 and status=1  and activity_title LIKE ? and (to_shopowner_id=? or action_area=1) order by floor_price asc,addtime desc limit "+ _currentpage + "," + _pagesize;
                    db.query(sql,[body.activity_type,user.manager_id,body.param_text,user.shopowner_id], function(err, row, fields) {
                        // 数据获取失败
                        if (err) {
                            db.release();// 释放资源
                            conn.end(); // 结束当前数据库链接
                            return res.errorEnd("没有找到可用数据7", 200);
                        }
                        var back = {"totalrecord":_totalrecord,"totalpage":_totalpage,"pagesize":_pagesize,"currentpage":_currentpage}
                        back.list = row;
                        db.release(); // 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.successEnd(back);
                    })
                })
            }else{
                db.query("SELECT count(id) as num FROM `activity_all_new` WHERE  boss_id=? and open_off=2 and status=1  and activity_title LIKE ? and (to_shopowner_id=? or action_area=1) order by floor_price asc,addtime desc ",[user.manager_id,body.param_text,user.shopowner_id], function(err, row1, fields) {
                    // 数据获取失败
                    if (err) {
                        db.release();// 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd("没有找到可用数据8", 200);
                    }
                    var _totalrecord = row1[0].num; //总共有多少条数据
                    var _totalpage  = Math.ceil(Number(row1[0].num)/Number(body.pagesize)); // 总共有多少页
                    var _pagesize    = Number(body.pagesize); // 每页有多少数据
                    var _currentpage = Number(body.currentpage); // 当前页
                    var sql = "SELECT * FROM `activity_all_new` WHERE  boss_id=? and open_off=2 and status=1  and activity_title LIKE ? and (to_shopowner_id=? or action_area=1) order by floor_price asc,addtime desc limit "+ _currentpage + "," + _pagesize;
                    db.query(sql,[user.manager_id,body.param_text,user.shopowner_id], function(err, row, fields) {
                        // 数据获取失败
                        if (err) {
                            db.release();// 释放资源
                            conn.end(); // 结束当前数据库链接
                            return res.errorEnd("没有找到可用数据9", 200);
                        }
                        var back = {"totalrecord":_totalrecord,"totalpage":_totalpage,"pagesize":_pagesize,"currentpage":_currentpage}
                        back.list = row;
                        db.release(); // 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.successEnd(back);
                    })
                })
            }
        }
        // 按活动类型排序
        if( !that.isEmpty(body.activity_type) ){
            db.query("SELECT count(id) as num FROM `activity_all_new` WHERE activity_type in (?) and boss_id=? and open_off=2 and status=1 and activity_title LIKE ? and (to_shopowner_id=? or action_area=1) order by  addtime desc ",[body.activity_type,user.manager_id,body.param_text,user.shopowner_id], function(err, row1, fields) {
                // 数据获取失败
                if (err) {
                    db.release();// 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd("没有找到可用数据12", 200);
                }
                var _totalrecord = row1[0].num; //总共有多少条数据
                var _totalpage  = Math.ceil(Number(row1[0].num)/Number(body.pagesize)); // 总共有多少页
                var _pagesize    = Number(body.pagesize); // 每页有多少数据
                var _currentpage = Number(body.currentpage); // 当前页
                var sql = "SELECT * FROM `activity_all_new` WHERE activity_type in (?) and boss_id=? and open_off=2 and status=1 and activity_title LIKE ? and (to_shopowner_id=? or action_area=1) order by  addtime desc  limit "+ _currentpage + "," + _pagesize;
                db.query(sql,[body.activity_type,user.manager_id,body.param_text,user.shopowner_id], function(err, row, fields) {
                    // 数据获取失败
                    if (err) {
                        db.release();// 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd("没有找到可用数据13", 200);
                    }
                    var back = {"totalrecord":_totalrecord,"totalpage":_totalpage,"pagesize":_pagesize,"currentpage":_currentpage}
                    back.list = row;
                    db.release(); // 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.successEnd(back);
                })
            })

        }else{
            db.query("SELECT count(id) as num FROM `activity_all_new` WHERE  boss_id=? and open_off=2 and status=1 and activity_title LIKE ? and (to_shopowner_id=? or action_area=1) order by  addtime desc",[user.manager_id,body.param_text,user.shopowner_id], function(err, row1, fields) {
                // 数据获取失败
                if (err) {
                    db.release();// 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd("没有找到可用数据14", 200);
                }
                var _totalrecord = row1[0].num; //总共有多少条数据
                var _totalpage  = Math.ceil(Number(row1[0].num)/Number(body.pagesize)); // 总共有多少页
                var _pagesize    = Number(body.pagesize); // 每页有多少数据
                var _currentpage = Number(body.currentpage); // 当前页
                var sql = "SELECT * FROM `activity_all_new` WHERE  boss_id=? and open_off=2 and status=1 and activity_title LIKE ? and (to_shopowner_id=? or action_area=1) order by  addtime desc limit "+ _currentpage + "," + _pagesize;
                db.query(sql,[user.manager_id,body.param_text,user.shopowner_id], function(err, row, fields) {
                    // 数据获取失败
                    if (err) {
                        db.release();// 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd("没有找到可用数据15", 200);
                    }
                    var back = {"totalrecord":_totalrecord,"totalpage":_totalpage,"pagesize":_pagesize,"currentpage":_currentpage}
                    back.list = row;
                    db.release(); // 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.successEnd(back);
                })
            })
        }
    });
}
