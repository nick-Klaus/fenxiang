// Node ����ģ��
// const fs = require('fs'); // �ļ�����ģ��
// const url = require('url'); // ���Ӵ���ģ��
// const path = require('path'); // ·������ģ��
// const http = require('http'); // ��ҳ����ģ��
// const crypto = require('crypto');// ����ģ��
// const child_process = require('child_process');// ����ͨ��ģ��
// ������ģ��
// const ftp = require('ftp');// FTPģ��
// const moment = require('moment'); // ʱ�䴦����

'use strict';

exports.ready = (req, res, that) => {

    const method = req.method; // ��ǰ���ӵ���������, GET / POST / PUT
    const query = req.query; // ��ǰ���󴫵ݹ����� GET ����,
    const body = req.body; // ��ǰ���󴫵ݹ����� POST ����
    // �������ݿ�
    // ���� / �������ݿ�
    
    if(req.session.user_rows = null){
         return res.errorEnd('��ǰ���󲻴��� Token �� Token ������', 300);
     }
    if(req.session.user_token != body.token){
         return res.errorEnd('��ǰ���󲻴��� Token �� Token ������', 300);
    }
    var user = req.session.user_rows;
    that.connect((err, db) => {
        //��ѯ����
        db.query("select * from `db_people` where shopowner_id = ? and is_clerk = 1",body.sid, function(err, row, fields) {
            // ���ݻ�ȡʧ��
            if (err) {                             //�곤
                return res.errorEnd('û���ҵ���������', 200);
            }
            // ������滹�����ݿ� ��ɾ�Ĳ�Ĳ���, ��ô�Ͳ�Ҫ���� db.release() ���ͷ���Դ!!
            // ���������������, �ͱ���Ҫ���� db.release() ���ͷŵ�ǰռ�õ���Դ
            db.release(); // �ͷ���Դ

            // �����ļ������, ������� res.successEnd() �� res.errorEnd() �����ظ��ӿڵ��÷�, ���߶Է�, ��ǰ����Ĳ���״̬,
            // ������������������� �ص�, ��ô������ñ���������Ļص�����!!!
            // ������ȷ ����ȡ��������
            if(row){
                return res.successEnd(row);
            }
            // ����ʧ�� ����ʧ����Ϣ, ͬʱ���� http ״̬��Ϊ 200
            return res.errorEnd( 'û���ҵ�����' , 200 );
        })
    });


}