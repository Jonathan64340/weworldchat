import React, { useEffect, useState, useRef } from 'react';
import { Layout, Avatar, Tooltip } from 'antd';
import { connect } from 'react-redux';
import { getGlobalTchat, getPrivateTchat } from '../../../endpoints';
import moment from 'moment';
import './MessageContent.css'
import { store } from '../../..';
const MessageContent = ({ sendMessage, usersMatch, user }) => {
    const [_tchat, setTchat] = useState([]);
    const [listen, setListen] = useState(false)
    const [listenGlobal, setListenGlobal] = useState(false);
    const messages = useRef();

    useEffect(() => {
        setTchat(t => [...t, { data: sendMessage }])
    }, [sendMessage])

    useEffect(() => {
        messages.current.scrollIntoView({
            block: "nearest",
            inline: "end"
        });
    }, [_tchat])

    useEffect(() => {
        setTchat([]);
        usersMatch ? getPrivateTchat({ userOneId: usersMatch.split(':')[0], userTwoId: usersMatch.split(':')[1] })
            .then(data => {
                setTchat(data.tchat.filter(el => el.data.data.type === 'string'));
            })
            .catch(err => console.log(err))
            : getGlobalTchat()
                .then(data => {
                    setTchat(data.tchat)
                })
        //eslint-disable-next-line 
        if (listen && usersMatch) {
            window.socket.off('receive-message-global');
            setListenGlobal(false);
        }
        if (!listen && usersMatch) {
            window.socket.on('receive-message', data => {
                if ((data.usersContaints.split(':')[0] === window.socket.id || data.usersContaints.split(':')[1] === window.socket.id) && data.data?.type === 'string') {
                    if (store.getState().tchat?.data?.userConversation === data.data.sender && data.data.destination !== 'all') {
                        setTchat(t => [...t, { data: data }])
                    }
                }
            })
            window.socket.off('receive-message-global');
            setListen(true)
            setListenGlobal(false);
        } else {
            if (!listenGlobal && !usersMatch) {
                window.socket.on('receive-message-global', data => {
                    setTchat(t => [...t, { data: data }])
                })
                setListenGlobal(true);
            }
        }
        // eslint-disable-next-line 
    }, [usersMatch])

    return <div className="container-flex-with__camera">
        <Layout.Content className="layout-tchat">
            <div className="tchat-container">
                {_tchat.map((el, index) => (<div className="content-item-tchat" senderinfo={_tchat[index]?.data?.data?.sender === _tchat[index + 1]?.data?.data?.sender ? '' : `${_tchat[index]?.data?.data?.sender === user?.data?.id ? '' : _tchat[index]?.data?.data?.pseudo !== "Serveur : " ? `${_tchat[index]?.data?.data?.pseudo} • ${moment(_tchat[index]?.data?.data?.timestamp).format('HH:mm')}` : `message automatique (serveur) • ${moment(_tchat[index]?.data?.data?.timestamp).format('HH:mm')}`}`}>
                    <div key={index} className={`item-message ${user.data.id === el?.data?.data?.sender ? 'sender' : 'receiver'}`} >
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
                            <div style={{ ...(_tchat[index]?.data?.data?.sender === 'SERVER' && { background: '#001529' }) }} className={`content-box-message 
                            ${_tchat[index]?.data?.data?.sender === _tchat[index + 1]?.data?.data?.sender ? 'continue' : 'stop'} 
                            ${_tchat[index - 1]?.data?.data?.sender === _tchat[index + 1]?.data?.data?.sender ? 'continue-normalize' : 'stop-normalize'}`}>
                                {el?.data?.data?.message}
                            </div>
                        </Tooltip>
                    </div>
                </div>))}
                <div ref={messages} />
            </div>
        </Layout.Content>
    </div >
}

const mapStateToProps = ({ user }) => ({ user })

export default connect(mapStateToProps)(MessageContent)