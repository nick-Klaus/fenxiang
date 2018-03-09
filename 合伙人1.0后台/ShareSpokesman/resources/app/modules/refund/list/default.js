

'use strict';
exports.ready = (req, res, that) => {

    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query; // 当前请求传递过来的 GET 数据,
    const body = req.body; // 当前请求传递过来的 POST 数据

    console.log(body);
    if(req.session.user_rows = null){
         return res.errorEnd('当前请求不存在 Token 或 Token 不可用', 300);
    }
    if(req.session.user_token != body.token){
         return res.errorEnd('当前请求不存在 Token 或 Token 不可用', 300);
    }
    if(that.isEmpty(body.manager_id)){
        return res.errorEnd('老板不能为空', 200);
    }
 
    if(!(body.status==0||body.status==1) ){
        return res.errorEnd('审批状态错误', 200);
    }
   

    // 链接数据库
    // 链接 / 操作数据库
    that.connect((err, db,conn) => {

        //记录查询日志
            
            var add_sql ="";
            if(!that.isEmpty(body.user_id) ){
                add_sql ="  and  b.id= "+body.user_id +"   ";
            }
            if(body.status == 0){

                db.query("select count(1) num from db_manager_refund a left join db_order b on a.order_id=b.id where a.status=0 and a.manager_id=? "+add_sql+"   order by a.id desc ", [body.manager_id], function(err, row, fields) {
  
                    if (err) {
                        db.release();// 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd("没有找到可用数据", 200);
                    }
                    var _totalrecord = row[0].num; //总共有多少条数据
                    var _totalpage  = Math.ceil(Number(row[0].num)/Number(body.pagesize)); // 总共有多少页
                    var _pagesize    = Number(body.pagesize); // 每页有多少数据
                    var _currentpage = Number(body.currentpage); // 当前页
                    
                    var sql = "select  a.id refund_id,a.*,b.* ,c.*,a.real_pay real_back_pay  from db_manager_refund a left join db_order b on a.order_id=b.id left join db_people c on a.user_id = c.id  where a.status=0 and a.manager_id=?  "+add_sql+"   order by a.id desc limit "+ _currentpage + "," + _pagesize;
                    db.query(sql,[body.manager_id], function(err, row, fields) {
                        // 数据获取失败
                        if (err) {
                            db.release();// 释放资源
                            conn.end(); // 结束当前数据库链接
                            return res.errorEnd("没有找到可用数据", 200);
                        }
                        var back = {"totalrecord":_totalrecord,"totalpage":_totalpage,"pagesize":_pagesize,"currentpage":_currentpage}
                        back.list = row;
                        db.release(); // 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.successEnd(back);
                    })
                })
            }else if(body.status == 1){
                db.query("select count(1) num from db_manager_refund a left join db_order b on a.order_id=b.id where a.status=1 and a.manager_id=?  "+add_sql+"  order by a.id desc", [body.manager_id], function(err, row, fields) {
                    console.log(err);
                    if (err) {
                        db.release();// 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd("没有找到可用数据", 200);
                    }
                    var _totalrecord = row[0].num; //总共有多少条数据
                    var _totalpage  = Math.ceil(Number(row[0].num)/Number(body.pagesize)); // 总共有多少页
                    var _pagesize    = Number(body.pagesize); // 每页有多少数据
                    var _currentpage = Number(body.currentpage); // 当前页
     
                    var sql = "select  a.id refund_id,a.*,b.*,c.* ,a.real_pay real_back_pay from db_manager_refund a left join db_order b on a.order_id=b.id left join db_people c on a.user_id = c.id  where a.status=1 and a.manager_id=?    "+add_sql+"   order by a.id desc limit "+ _currentpage + "," + _pagesize;
                    db.query(sql,[body.manager_id], function(err, row, fields) {
                        // 数据获取失败
                        if (err) {
                            db.release();// 释放资源
                            conn.end(); // 结束当前数据库链接
                            return res.errorEnd("没有找到可用数据", 200);
                        }
                        var back = {"totalrecord":_totalrecord,"totalpage":_totalpage,"pagesize":_pagesize,"currentpage":_currentpage}
                        back.list = row;
                        db.release(); // 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.successEnd(back);
                    })
                })
            }else{
                        db.release(); // 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd("没有找到可用数据", 200);
            }
        
    });


}