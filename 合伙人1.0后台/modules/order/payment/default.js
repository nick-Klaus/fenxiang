const crypto = require('crypto');// ����ģ��
'use strict';
exports.ready = (req, res, that) => {

    const method = req.method; // ��ǰ���ӵ���������, GET / POST / PUT
    const query = req.query; // ��ǰ���󴫵ݹ����� GET ����,
    const body = req.body; // ��ǰ���󴫵ݹ����� POST ����

    // �������ݿ�
    // ���� / �������ݿ�
    // �в���, ����� http://blog.csdn.net/zxsrendong/article/details/17006185
    that.connect(( err , db , conn ) => {
        // ��������ĵ���
        // ��������
        db.query("select * from `db_order` where order_no = ?", body.order_no, function(err, row, fields) {
            // ���ݻ�ȡʧ��
            if (err) {
                return res.errorEnd('û���ҵ���������', 200);
            }
            if(row.length = 0 ){
                return res.errorEnd('û���ҵ����ö���', 200);
            }
            var data = new Date();
            var time = data.getTime();
            var md5=crypto.createHash("md5"); 
            var key = 'JHKJ'+body.order_no + time +"999";

            md5.update(key); 
            var sign = md5.digest('hex');
            var md51=crypto.createHash("md5");

            var key1 = 'JHKJ'+sign+time+"666";
            md51.update(key1); 
            var sign1 = md51.digest('hex');
            var data = {'key' : sign1,'time' : time ,'row' : row[0]};

            db.release(); // �ͷ���Դ
            conn.end();
           
            if(row){
                return res.successEnd(data);
            }
            // ����ʧ�� ����ʧ����Ϣ, ͬʱ���� http ״̬��Ϊ 200
            return res.errorEnd( 'û���ҵ�����' , 200 );
        })
    });
}