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
    const [reloadPagination, setReloadPagination] = useState(false);
    const messages = useRef();
    const tchatHeight = useRef();
    useEffect(() => {
        setTchat(t => [...t, { ...sendMessage }])
        messages.current.scrollIntoView({ block: "end", inline: "nearest" });
    }, [sendMessage])

    useEffect(() => {
        let videoCustom = document.getElementsByClassName('video-wrapper');
        for (let video of videoCustom) {
            video.parentNode.parentNode.style.background = 'transparent'
        }
    }, [_tchat])

    const pagination = (num, global, privateId) => {
        setReloadPagination(true)
        if (global) {
            return getGlobalTchat({
                skipNumber: num
            }).then(data => {
                setReloadPagination(false)
                setTchat(p => [...p, ...data.tchat].sort((a, b) => a.timestamp > b.timestamp ? 1 : -1))
            })
        }

        if (privateId) {
            return getPrivateTchat({
                skipNumber: num,
                userOneId: usersMatch.split(':')[0], userTwoId: usersMatch.split(':')[1]
            }).then(data => {
                setReloadPagination(false)
                setTchat(p => [...p, ...data.tchat].sort((a, b) => a.timestamp > b.timestamp ? 1 : -1))
            })
        }

    }

    useEffect(() => {
        if (props.history.location.pathname.match('group')) {
            getGroupeTchat({ groupId: props?.match?.params?.id }).then(data => setTchat(data.tchat.filter(el => el.type === 'string'))).catch(() => setTchat([]))
        } else {
            usersMatch ? getPrivateTchat({ userOneId: usersMatch.split(':')[0], userTwoId: usersMatch.split(':')[1] })
                .then(data => {
                    setTchat(data.tchat);
                })
                .catch(err => console.log(err))
                : getGlobalTchat()
                    .then(data => {
                        setTchat(data.tchat)
                        messages.current.scrollIntoView({ block: "end", inline: "nearest" });
                    })
        }
        //eslint-disable-next-line 
        if (listen && usersMatch) {
            window.socket.off('receive-message-global');
            setListenGlobal(false);
        }
        if (!listen && usersMatch) {
            window.socket.on('receive-message', data => {
                setTchat(t => [...t, { ...data }])
                messages.current.scrollIntoView({ block: "end", inline: "nearest" });
            })
            window.socket.off('receive-message-global');
            setListen(true)
            setListenGlobal(false);
        } else {
            if (!listenGlobal && !usersMatch) {
                window.socket.on('receive-message-global', data => {
                    setTchat(t => [...t, { ...data }])
                    messages.current.scrollIntoView({ block: "end", inline: "nearest" });
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
                    setTchat(t => [...t, { ...data }])
            })
            setListenTchatGroupe(true)
        }
        if (props?.match?.params?.id && !listenListTchatGroup.includes(props?.match?.params?.id)) {
            window.socket.on(props?.match?.params?.id, data => {
                props.history.location.pathname.match('group') && setTchat(t => [...t, { ...data }])
            })
            setListenListTchatGroup(prev => [...prev, props?.match?.params?.id]);
        }
        // eslint-disable-next-line
    }, [props?.match?.params])

    return <div className="container-flex-with__camera">
        <Layout.Content className="layout-tchat" onScroll={e => {
            if (e.currentTarget.scrollTop === 0) {
                e.currentTarget.scrollTop = 1
                if(!reloadPagination && _tchat.length >= 25) {
                    if(usersMatch) {
                        return pagination(_tchat.length, false, true)
                    } else {
                        return pagination(_tchat.length, true, false)
                    }
                }
            }
        }}>
            <div className="tchat-container" ref={tchatHeight}>
                {_tchat.map((el, index) => (<div className="content-item-tchat" senderinfo={_tchat[index]?.sender === _tchat[index + 1]?.sender ? '' : `${_tchat[index]?.sender === user?.data?.id ? '' : _tchat[index]?.pseudo !== "Serveur : " ? `${_tchat[index]?.pseudo} • ${moment(_tchat[index]?.timestamp).format('HH:mm')}` : `message automatique (serveur) • ${moment(_tchat[index]?.timestamp).format('HH:mm')}`}`}>
                    <div key={index} className={`item-message ${user?.data?.id === el?.sender ? 'sender' : 'receiver'}`} >
                        {el?.sender && user?.data?.id !== el?.sender && (
                            <>
                                {_tchat[index]?.sender !== _tchat[index + 1]?.sender &&
                                    <div className="content-avatar">
                                        <Avatar size="small" style={{ background: el?.defaultColor ? 'rgba(' + el?.defaultColor + ')' : 'rgb(0, 21, 41)', textTransform: "uppercase" }}>
                                            {el?.pseudo.length > 1 ? el?.pseudo.substring(0, el?.pseudo.length - (el?.pseudo.length - 1)) : el?.pseudo}
                                        </Avatar>
                                    </div>
                                }
                            </>)}
                        <Tooltip title={moment(el?.timestamp).format('HH:mm')} placement="top">
                            <div style={{ ...(_tchat[index]?.sender === 'SERVER' && { background: '#096dd9', color: 'white' }) }} className={`content-box-message 
                            ${_tchat[index]?.sender === _tchat[index + 1]?.sender ? 'continue' : 'stop'} 
                            ${_tchat[index - 1]?.sender === _tchat[index + 1]?.sender ? 'continue-normalize' : 'stop-normalize'}`}>
                                <p><CustomRenderElement string={el?.message} /></p>{' '}{_tchat[index]?.type === 'action_groupe' && (<Button type="primary" size="small" onClick={() => viewTchat('groupes')}>Voir les groupes</Button>)}
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