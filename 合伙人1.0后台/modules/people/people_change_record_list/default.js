/**
 * Created by Administrator on 2017/8/16.
 * 所有活动的获取 视图
 */
'use strict';
exports.ready = (req, res, that) => {

    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query; // 当前请求传递过来的 GET 数据,
    const body = req.body; // 当前请求传递过来的 POST 数据
    var user = req.session.user_rows;

    // 查询数据
    if(req.session.user_rows = null){
     return res.errorEnd('当前请求不存在 Token 或 Token 不可用', 300);
    }
    if(req.session.user_token != body.token){
         return res.errorEnd('当前请求不存在 Token 或 Token 不可用', 300);
    }
    if(that.isEmpty(body.manager_id) ){
            return res.errorEnd('老板不能为空', 200);
    }


    var time_sql ="";
    if(!that.isEmpty(body.date_start) ){
        time_sql ="  AND create_time >=UNIX_TIMESTAMP('"+body.date_start+"')";
    }
    if(!that.isEmpty(body.date_end) ){
       
        time_sql =time_sql+" AND  create_time <UNIX_TIMESTAMP(date_sub('"+body.date_end+"',interval -1 day))";  
        
        
    }
    var type_sql ="";
    if(!that.isEmpty(body.type) ){
        type_sql ="  AND type ="+body.type;
    }

    
    that.connect(( err , db , conn ) => {

     
       db.query("SELECT count(1) as num FROM `db_people_change_record` WHERE  manager_id=?  "+time_sql+type_sql+"  order by create_time desc ",[body.manager_id], function(err, row1, fields) {
         
                    // 数据获取失败
                    if (err) {                  
                        db.release();// 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd("没有找到可用数据1", 200);
                    }
                    var _totalrecord = row1[0].num; //总共有多少条数据
                    var _totalpage  = Math.ceil(Number(row1[0].num)/Number(body.pagesize)); // 总共有多少页
                    var _pagesize    = Number(body.pagesize); // 每页有多少数据
                    var _currentpage = Number(body.currentpage); // 当前页
                    
                    var sql = "SELECT * FROM `db_people_change_record` WHERE  manager_id=?  "+time_sql+type_sql+"  order by create_time desc limit "+ _currentpage + "," + _pagesize;
                    db.query(sql,[body.manager_id], function(err, row, fields) {
                        // 数据获取失败
                        if (err) {                          
                            db.release();// 释放资源
                            conn.end(); // 结束当前数据库链接
                            return res.errorEnd("没有找到可用数据2", 200);
                        }
                        var back = {"totalrecord":_totalrecord,"totalpage":_totalpage,"pagesize":_pagesize,"currentpage":_currentpage}
                        back.list = row;
                        db.release(); // 释放资源
                        conn.end(); // 结束当前数据库链接

                        return res.successEnd(back);
                    })
        })
    });
}
