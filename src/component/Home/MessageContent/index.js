import React, { useEffect, useState, useRef } from 'react';
import { Layout, Avatar, Tooltip, Button } from 'antd';
import { connect } from 'react-redux';
import { getGlobalTchat, getGroupeTchat, getPrivateTchat } from '../../../endpoints';
import { withRouter } from 'react-router-dom';
import _ from 'underscore';
import moment from 'moment';
import './MessageContent.css'
import { store } from '../../..';
import CustomRenderElement from './CustomRenderElement';
const MessageContent = ({ sendMessage, usersMatch, user, tchat, viewTchat, userData, ...props }) => {
    const [_tchat, setTchat] = useState([]);
    const [listen, setListen] = useState(false)
    const [listenGlobal, setListenGlobal] = useState(false);
    const [listenTchatGroupe, setListenTchatGroupe] = useState(false);
    const [listenListTchatGroup, setListenListTchatGroup] = useState([]);
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
        if (props.history.location.pathname.match('group')) {
            getGroupeTchat({ groupId: props?.match?.params?.id }).then(data => setTchat(data.tchat.filter(el => el.data.data.type === 'string'))).catch(() => setTchat([]))
        } else {
            usersMatch ? getPrivateTchat({ userOneId: usersMatch.split(':')[0], userTwoId: usersMatch.split(':')[1] })
                .then(data => {
                    userData(data)
                    setTchat(data.tchat.filter(el => el.data.data.type === 'string'));
                })
                .catch(err => console.log(err))
                : getGlobalTchat()
                    .then(data => {
                        setTchat(data.tchat)
                    })
        }
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

    useEffect(() => {
        if (!listenTchatGroupe) {
            window.socket.on('receive-user-add-groupe', data => {
                typeof store.getState()?.tchat?.data?.userConversation === 'undefined' &&
                    typeof store.getState()?.tchat?.data?.currentGroupDiscussion === 'undefined' &&
                    setTchat(t => [...t, { data: data }])
            })
            setListenTchatGroupe(true)
        }
        if (props?.match?.params?.id && !listenListTchatGroup.includes(props?.match?.params?.id)) {
            window.socket.on(props?.match?.params?.id, data => {
                props.history.location.pathname.match('group') && setTchat(t => [...t, { data: data }])
            })
            setListenListTchatGroup(prev => [...prev, props?.match?.params?.id]);
        }
        // eslint-disable-next-line
    }, [tchat, props?.match?.params])

    return <div className="container-flex-with__camera">
        <Layout.Content className="layout-tchat">
            <div className="tchat-container">
                {_tchat.map((el, index) => (<div className="content-item-tchat" senderinfo={_tchat[index]?.data?.data?.sender === _tchat[index + 1]?.data?.data?.sender ? '' : `${_tchat[index]?.data?.data?.sender === user?.data?.id ? '' : _tchat[index]?.data?.data?.pseudo !== "Serveur : " ? `${_tchat[index]?.data?.data?.pseudo} • ${moment(_tchat[index]?.data?.data?.timestamp).format('HH:mm')}` : `message automatique (serveur) • ${moment(_tchat[index]?.data?.data?.timestamp).format('HH:mm')}`}`}>
                    <div key={index} className={`item-message ${user.data.id === el?.data?.data?.sender ? 'sender' : 'receiver'}`} >
                        {el?.data?.data?.sender && user.data.id !== el?.data?.data?.sender && (
                            <>
                                {_tchat[index]?.data?.data?.sender !== _tchat[index + 1]?.data?.data?.sender &&
                                    <div className="content-avatar">
                                        <Avatar size="small" style={{ background: el?.data?.data?.defaultColor ? 'rgba(' + el?.data?.data?.defaultColor + ')' : 'rgb(0, 21, 41)', textTransform: "uppercase" }}>
                                            {el?.data?.data?.pseudo.length > 1 ? el?.data?.data?.pseudo.substring(0, el?.data?.data?.pseudo.length - (el?.data?.data?.pseudo.length - 1)) : el?.data?.data?.pseudo}
                                        </Avatar>
                                    </div>
                                }
                            </>)}
                        <Tooltip title={moment(el?.data?.data?.timestamp).format('HH:mm')} placement="top">
                            <div style={{ ...(_tchat[index]?.data?.data?.sender === 'SERVER' && { background: '#001529' }) }} className={`content-box-message 
                            ${_tchat[index]?.data?.data?.sender === _tchat[index + 1]?.data?.data?.sender ? 'continue' : 'stop'} 
                            ${_tchat[index - 1]?.data?.data?.sender === _tchat[index + 1]?.data?.data?.sender ? 'continue-normalize' : 'stop-normalize'}`}>
                                <p><CustomRenderElement string={el?.data?.data?.message} /></p>{' '}{_tchat[index]?.data?.data?.type === 'action_groupe' && (<Button type="primary" size="small" onClick={() => viewTchat('groupes')}>Voir les groupes</Button>)}
                            </div>
                        </Tooltip>
                    </div>
                </div>))}
                <div ref={messages} />
            </div>
        </Layout.Content>
    </div >
}

const mapStateToProps = ({ user, tchat }) => ({ user, tchat })

export default _.compose(connect(mapStateToProps), withRouter)(MessageContent)