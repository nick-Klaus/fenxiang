'use strict';
exports.ready = (req, res, that) => {

    const method = req.method; // ��ǰ���ӵ���������, GET / POST / PUT
    const query = req.query; // ��ǰ���󴫵ݹ����� GET ����,
    const body = req.body; // ��ǰ���󴫵ݹ����� POST ����

    // �������ݿ�
    // ���� / �������ݿ�
    // �в���, ����� http://blog.csdn.net/zxsrendong/article/details/17006185
    that.connect(( err , db , conn ) => {
        var data = {
            down_pay : body.down_pay,
            have_pay : body.have_pay,
            real_pay : bdoy.real_pay,
            pay_time : '',
            channel : body.channel,
            user_uid : body.user_uid,
            status : 1,
            content : body.content,
            payment_no : body.payment_no,
            out_order_no : body.out_order_no,
            out_order_id : body.out_order_id,
        };
        var where = {
            order_no : body.order_no,
            sid : body.sid,
            mid : body.mid
        };
        // ��������ĵ���
        // ��������
        db.query( "UPDATE ?? SET ? WHERE ? " , [ 'db_order' , data , where ] , function( err, result , fields ){

            var total = result.changedRows ; // ��Ӱ�����������, ( ��ɾ������������ )

            if( err ){
                db.release();// �ͷ���Դ
                return res.errorEnd('��������ʧ��!!', 200);
            }

            if( !total ){
                db.release(); // �ͷ���Դ
                return res.errorEnd('û���ҵ��ɲ���������!!', 200);
            }

            // ������滹�����ݿ� ��ɾ�Ĳ�Ĳ���, ��ô�Ͳ�Ҫ���� db.release() ���ͷ���Դ!!
            // ���������������, �ͱ���Ҫ���� db.release() ���ͷŵ�ǰռ�õ���Դ
            // ͬʱ ���� db.end() ��������ǰ���ݿ����� (�÷�������query����֮��Ŵ���)    2017��8��9�� 11:09:23 ����
            db.release(); // �ͷ���Դ
            conn.end(); // ������ǰ���ݿ�����

            return res.successEnd( '�ɹ��������� : '+ total +' [ order_no = '+ rand +' ]' );
        });
    });
}