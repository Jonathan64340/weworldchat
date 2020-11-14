import React from 'react';
import { Modal } from 'antd';

const DetailGroupeModal = ({ current, visible, ...props }) => {
    return <Modal centered visible={visible} title={current?.name} onCancel={() => props.onChange(false)} footer={false}>
        {current?.currentParticipants <= 0 ? <h3>Le groupe est actuellement vide</h3> : 'ok'}
    </Modal>
}

export default DetailGroupeModal;