import React from 'react';
import { Modal, List, Button } from 'antd';
import { connect } from 'react-redux';
import { setEnterPrivateTchat } from '../../../../action/tchat/tchat_actions';
import _ from 'underscore';
import { withRouter } from 'react-router-dom'

const DetailGroupeModal = ({ current, visible, ...props }) => {
    const goToPrivate = id => {
        props.dispatch(setEnterPrivateTchat({ userConversation: id}));
        props.history.push(`/conversation/${id}`)
        props.onChange(false)
    }

    console.log(current)

    return <Modal centered visible={visible} title={`Groupe : ${current?.name}`} onCancel={() => props.onChange(false)} footer={false}>
        {current?.currentParticipants <= 0 ? <h3>Le groupe est actuellement vide</h3> : <List
            itemLayout="horizontal"
            dataSource={current?.participantsDetails}
            renderItem={item => (
                <List.Item
                    actions={[<Button onClick={() => goToPrivate(item?.data?.id)}>Message privé</Button>]}
                >
                    <List.Item.Meta
                        title={`${item?.data?.pseudo} ${current?.owner === item?.data?.id ? "(administrateur)" : ""}`}
                    />
                </List.Item>
            )}
        />}
    </Modal>
}

const mapDispatchToProps = dispatch => ({ dispatch })

export default _.compose(connect(mapDispatchToProps), withRouter)(DetailGroupeModal);