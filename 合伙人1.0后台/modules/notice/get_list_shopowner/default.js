/**
 * Created by Administrator on 2017/8/16.
 * 所有活动的获取 视图
 */
'use strict';
exports.ready = (req, res, that) => {

    const method = req.method; // 当前链接的请求类型, GET / POST / PUT
    const query = req.query; // 当前请求传递过来的 GET 数据,
    const body = req.body; // 当前请求传递过来的 POST 数据

    // 查询数据
    if(  that.isEmpty(body.manager_id) ){
        return res.errorEnd('老板不能为空', 200);
    }
    if(  that.isEmpty(body.shopowner_id) ){
        return res.errorEnd('个人不能为空', 200);
    }

    that.connect(( err , db , conn ) => {


            db.query("SELECT count(1) as num from db_notice_shopowner where (notice_type=1 or  shopowner_id =?) and   id  not in (select notice_id from db_noticet_record_shopowner where shopowner_id =?  and  status=999)  and manager_id=?  order by create_time desc  ",[body.shopowner_id,body.shopowner_id,body.manager_id], function(err, row1, fields) {
                // 数据获取失败
                if (err) {
                    db.release();// 释放资源
                    conn.end(); // 结束当前数据库链接
                    return res.errorEnd("没有找到可用数据", 200);
                }
                var _totalrecord = row1[0].num; //总共有多少条数据
                var _totalpage  = Math.ceil(Number(row1[0].num)/Number(body.pagesize)); // 总共有多少页
                var _pagesize    = Number(body.pagesize); // 每页有多少数据
                var _currentpage = Number(body.currentpage); // 当前页
                db.query("select * ,0 record_status  from db_notice_shopowner where (notice_type=1 or  shopowner_id =?) and   id  not in (select notice_id from db_noticet_record_shopowner where shopowner_id =?  and  status=999)  and manager_id=?  order by create_time desc   limit "+ _currentpage + "," + _pagesize,[body.shopowner_id,body.shopowner_id,body.manager_id], function(err, row, fields) {
                    
                    // 数据获取失败
                    if (err) {
                        db.release();// 释放资源
                        conn.end(); // 结束当前数据库链接
                        return res.errorEnd('没有找到可用数据', 200);
                    }
                    
                    function forEach_get_list( index , callback ){
                        var notice = row[index];
                        


                    if( "object" === typeof notice ){
                        db.query("select * from db_noticet_record_shopowner where shopowner_id=? and notice_id=?  ",[body.shopowner_id,notice.id], function(err, row_db_noticet_record, fields) {
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
                        var back = {"totalrecord":_totalrecord,"totalpage":_totalpage,"pagesize":_pagesize,"currentpage":_currentpage}
                        back.list=row;
                        return res.successEnd(back);           
                     });

                  
                })
            })

 

    });
}
