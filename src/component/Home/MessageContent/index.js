import React, { useEffect, useState } from 'react';
import { Layout, Avatar, Tooltip } from 'antd';
import { connect } from 'react-redux';
import { getPrivateTchat } from '../../../endpoints';
import moment from 'moment';
import './MessageContent.css'
import { store } from '../../..';
const MessageContent = ({ sendMessage, usersMatch, user }) => {
    const [_tchat, setTchat] = useState([]);
    const [listen, setListen] = useState(false)

    useEffect(() => {
        setTchat(t => [...t, { data: sendMessage }])
    }, [sendMessage])

    useEffect(() => {
        getPrivateTchat({ userOneId: usersMatch.split(':')[0], userTwoId: usersMatch.split(':')[1] })
            .then(data => {
                console.log(data)
                setTchat(data.tchat.filter(el => el.data.data.type === 'string'));
            })
            .catch(err => console.log(err))
        //eslint-disable-next-line 
    }, [usersMatch])

    useEffect(() => {
        !listen && window.socket.on('receive-message', data => {
            if ((data.usersContaints.split(':')[0] === window.socket.id || data.usersContaints.split(':')[1] === window.socket.id) && data.data?.type === 'string') {
                if (store.getState().tchat?.data?.userConversation === data.data.sender) {
                    setTchat(t => [...t, { data: data }])
                }
            }
            !listen && setListen(true)
        })
        //eslint-disable-next-line
    }, [])

    return <div className="container-flex-with__camera">
        <Layout.Content className="layout-tchat">
            <div className="tchat-container">
                {_tchat.map((el, index) => (<div key={index} className={`item-message ${user.data.id === el?.data?.data?.sender ? 'sender' : 'receiver'}`}>
                    {el?.data?.data?.sender && user.data.id !== el?.data?.data?.sender && (
                        <>
                            {_tchat[index]?.data?.data?.sender !== _tchat[index + 1]?.data?.data?.sender &&
                                <div className="content-avatar">
                                    <Avatar size="small" className="avatar-icon">
                                        {el?.data?.data?.pseudo.length > 1 ? el?.data?.data?.pseudo.substring(0, el?.data?.data?.pseudo.length - (el?.data?.data?.pseudo.length - 1)) : el?.data?.data?.pseudo}
                                    </Avatar>
                                </div>
                            }
                        </>)}
                    <Tooltip title={moment(el?.data?.data?.timestamp).format('HH:mm')} placement="top">
                        <div className={`content-box-message 
                            ${_tchat[index]?.data?.data?.sender === _tchat[index + 1]?.data?.data?.sender ? 'continue' : 'stop'} 
                            ${_tchat[index - 1]?.data?.data?.sender === _tchat[index + 1]?.data?.data?.sender ? 'continue-normalize' : 'stop-normalize'}`}>
                            {el?.data?.data?.message}
                        </div>
                    </Tooltip>
                </div>))}
            </div>
        </Layout.Content>
    </div>
}

const mapStateToProps = ({ user }) => ({ user })

export default connect(mapStateToProps)(MessageContent)