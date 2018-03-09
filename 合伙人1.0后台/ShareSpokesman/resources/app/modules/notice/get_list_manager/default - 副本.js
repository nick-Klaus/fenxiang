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
    // 查询数据
    if(  that.isEmpty(body.manager_id) ){
        return res.errorEnd('老板不能为空', 200);
    }
    that.connect(( err , db , conn ) => {

        
 
        db.query("select * ,0 record_status  from db_notice_manager where (notice_type=1 or  manager_id =?) and   id  not in (select notice_id from db_noticet_record_manager where manager_id =?  and  status=999)    ",[body.manager_id,body.manager_id], function(err, row, fields) {
            
            // 数据获取失败
            if (err) {
                db.release();// 释放资源
                conn.end(); // 结束当前数据库链接
                return res.errorEnd('没有找到可用数据', 200);
            }
            
            function forEach_get_list( index , callback ){
                var notice = row[index];
                


            if( "object" === typeof notice ){
            	db.query("select * from db_noticet_record_manager where manager_id=? and notice_id=?  ",[body.manager_id,notice.id], function(err, row_db_noticet_record, fields) {
	            	if(row_db_noticet_record.length>0){	            	
						row[index].record_status=1;
	            	}
	       
					forEach_get_list(index +1,callback);

	            	
        	    })
            }else{
                callback( index );
            }
                  
            }


            forEach_get_list( 0 , function( succeed ){
	            // 这个打印, 只会出现在主程序的控制台中
	            db.release(); // 释放资源
	            conn.end(); // 结束当前数据库链接
	            if(row.length>0){
	            	row.sort(function(a,b){ return a.record_status>b.record_status;})
	            }
	            
	            return res.successEnd(row);           
             });

          
        })
    });
}
