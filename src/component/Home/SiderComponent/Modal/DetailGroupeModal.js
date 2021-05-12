import React from 'react';
import { Modal, List, Button } from 'antd';
import { connect } from 'react-redux';
import { setEnterPrivateTchat } from '../../../../action/tchat/tchat_actions';
import _ from 'underscore';
import { withRouter } from 'react-router-dom'

const DetailGroupeModal = ({ current, visible, onSelectUser, ...props }) => {
    const goToPrivate = ({ id, ...e }) => {
        if (!id || !e?.data?.sid) return;
        props.dispatch(setEnterPrivateTchat({ userConversation: id }));
        props.history.push(`/conversation/${id}`, { socketId: e.data.sid });
        onSelectUser(e.data?.name);
        props.onChange(false)
    }

    return <Modal centered visible={visible} title={`Groupe : ${current?.name}`} onCancel={() => props.onChange(false)} footer={false}>
        {current?.currentParticipants <= 0 ? <h3>Le groupe est actuellement vide</h3> : <List
            itemLayout="horizontal"
            dataSource={current?.participants}
            renderItem={item => (
                <List.Item
                    actions={[<Button onClick={() => goToPrivate(current?.owner === item?._id ? ({ id: item?._id, data: { ...item } }) : false)} type="primary">{current?.owner === item?._id ? "Message privé" : ""}</Button>]
                    }
                >
                    <List.Item.Meta
                        title={`${item?.name} ${current?.owner === item?._id ? "(administrateur)" : ""}`}
                    />
                </List.Item >
            )}
        />}
    </Modal >
}

const mapDispatchToProps = dispatch => ({ dispatch })

export default _.compose(connect(mapDispatchToProps), withRouter)(DetailGroupeModal);