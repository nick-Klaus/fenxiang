/**
 * Created by Administrator on 2017/8/16.
 * 所有活动的获取 视图
 */
'use strict';
exports.ready = (req, res, that) => {

    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query; // 当前请求传递过来的 GET 数据,
    const body = req.body; // 当前请求传递过来的 POST 数据

    if(req.session.user_rows = null){
         return res.errorEnd('当前请求不存在 Token 或 Token 不可用', 300);
     }
    if(req.session.user_token != body.token){
         return res.errorEnd('当前请求不存在 Token 或 Token 不可用', 300);
    }    
    if(that.isEmpty(body.type)){
         return res.errorEnd('查询类型不能为空：1.活动 2.订单', 300);
    } 
  

    that.connect(( err , db , conn ) => {
        // 查询数据
     
         var sql ="";
            var sql_id=null;
            if(!that.isEmpty(body.pid)){
                sql ="delete  from  `db_search_log`  where     pid =? and search_type = ?";
                sql_id = body.pid;
            }
            if(!that.isEmpty(body.shopowner_id)){
                sql ="delete  from  `db_search_log`  where     shopowner_id =? and search_type = ?";
                sql_id = body.shopowner_id;
            }
            if(!that.isEmpty(body.manager_id)){
                sql ="delete  from  `db_search_log`  where     manager_id =? and search_type = ?";
                sql_id = body.manager_id;
            }
   

         db.query(sql,[sql_id,body.type], function(err, row, fields) {
            // 数据获取失败
            if (err) {
                return res.errorEnd('没有找到可用数据', 200);
            }

            db.release(); // 释放资源
            conn.end(); // 结束当前数据库链接
            return res.successEnd('删除成功', 0);
       
        })
    
    });
}
