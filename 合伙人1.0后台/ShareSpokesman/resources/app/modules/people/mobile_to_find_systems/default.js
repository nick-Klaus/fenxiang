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


    if(that.isEmpty(body.mobile) ){
            return res.errorEnd('手机不能为空', 200);
    }


    var time_sql ="";

 

    
    that.connect(( err , db , conn ) => {

     
       db.query("select manager_id from db_people   where mobile like ?  ",[body.mobile], function(err, row, fields) {
         
                    // 数据获取失败
                    if (err) {                  
                        db.release();// 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd("没有找到可用数据1", 200);
                    }
                    

                    if(row.length>0){
                    	var manager_ids="";

                    	for(var i=0;i<row.length;i++){
                    		manager_ids+=row[i].manager_id+",";
                    	}
                    	manager_ids= manager_ids.substring(0,manager_ids.length-1);
                    	

                    	db.query("select a.* ,b.id people_id from db_manager a left join db_people b on b.manager_id = a.id where a.id in  ( "+manager_ids+" ) and b.is_manager='1'  ",[], function(err, row1, fields) {
                    		  // 数据获取失败
		                    if (err) {                  
		                        db.release();// 释放资源
		                        conn.end(); // 结束当前数据库链接
		                        return res.errorEnd("没有找到可用数据2", 200);
		                    }
		                 
		                    var back = {}
		                    back.list = row1;
		                    db.release(); // 释放资源
		                    conn.end(); // 结束当前数据库链接

		                    return res.successEnd(back);
                    	})

                    }else{
                    	   db.query("select a.* ,b.id people_id from db_manager a left join db_people b on b.manager_id = a.id where a.id in  ( 8 ) and b.is_manager='1'  ",[], function(err, row1, fields) {
                              // 数据获取失败
                            if (err) {                  
                                db.release();// 释放资源
                                conn.end(); // 结束当前数据库链接
                                return res.errorEnd("没有找到可用数据3", 200);
                            }
                         
                            var back = {}
                            back.list = row1;
                            db.release(); // 释放资源
                            conn.end(); // 结束当前数据库链接

                            return res.successEnd(back);
                        })
                    }
                   	
        })
    });
}
