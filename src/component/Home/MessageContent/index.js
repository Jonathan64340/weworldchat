import React, { useEffect, useState, useRef } from 'react';
import { Layout, Avatar, Tooltip, Button } from 'antd';
import { connect } from 'react-redux';
import { getGlobalTchat, getPrivateTchat, getUserAvatar } from '../../../endpoints';
import { withRouter } from 'react-router-dom';
import _ from 'underscore';
import moment from 'moment';
import './MessageContent.css'
import { store } from '../../..';
import CustomRenderElement from './CustomRenderElement';
import Lightbox from "react-awesome-lightbox";
// You need to import the CSS only once
import "react-awesome-lightbox/build/style.css";

const MessageContent = ({ sendMessage, usersMatch, user, tchat, viewTchat, ...props }) => {
    const [_tchat, setTchat] = useState([]);
    const [listen, setListen] = useState(false)
    const [listenGlobal, setListenGlobal] = useState(false);
    const [listenTchatGroupe, setListenTchatGroupe] = useState(false);
    const [listenListTchatGroup, setListenListTchatGroup] = useState([]);
    const [reloadPagination, setReloadPagination] = useState(false);
    const [openedPicture, setOpenedPicture] = useState({});
    const [userAvatar, setUserAvatar] = useState({});
    const messages = useRef();
    const tchatHeight = useRef();
    useEffect(() => {
        setTchat(t => [...t, { ...sendMessage }])
        setTimeout(() => messages.current.scrollIntoView({ block: "end", inline: "nearest" }), 0);
    }, [sendMessage])

    useEffect(() => {
        let videoCustom = document.getElementsByClassName('video-wrapper');
        for (let video of videoCustom) {
            video.parentNode.parentNode.style.background = 'transparent'
        }

        let tmpUser = [];

        _tchat.forEach(async t => {
            if (typeof userAvatar[t.sender] === 'undefined' && t.sender !== 'SERVER' && t.sender !== user?.data?.id) {
                if (!tmpUser.includes(t.sender)) {
                    await getUserAvatar(t.sender)
                        .then(res => {
                            setUserAvatar(u => ({ ...u, ...{ [t.sender]: res.avatar } }));
                            tmpUser.push(t.sender);
                        })
                }
            }
        })
        // eslint-disable-next-line
    }, [_tchat])

    const pagination = (num, global, privateId) => {
        setReloadPagination(true)
        if (global) {
            return getGlobalTchat({
                skipNumber: num,
                channel: 'globalChats'
            }).then(data => {
                setReloadPagination(false)
                setTchat(p => [...p, ...data.tchat].sort((a, b) => a.timestamp > b.timestamp ? 1 : -1))
            })
        }

        if (props.history.location.pathname.match('group')) {
            return getGlobalTchat({
                skipNumber: num,
                channel: 'groupChats',
                groupId: props?.match?.params?.id
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
            getGlobalTchat({ groupId: props?.match?.params?.id, channel: 'groupChats' }).then(data => setTchat(data.tchat)).catch(() => setTchat([]))
        } else {
            usersMatch ? getPrivateTchat({ userOneId: usersMatch.split(':')[0], userTwoId: usersMatch.split(':')[1] })
                .then(data => {
                    setTchat(data.tchat);
                    messages.current && messages.current.scrollIntoView({ block: "end", inline: "nearest" });
                })
                .catch(err => console.log(err))
                : getGlobalTchat({ channel: 'globalChats' })
                    .then(data => {
                        setTchat(data.tchat)
                        messages.current && messages.current.scrollIntoView({ block: "end", inline: "nearest" });
                    })
        }
        //eslint-disable-next-line 
        if (listen && usersMatch) {
            window.socket.off('receive-message-global');
            setListenGlobal(false);
        }

        if (!listen && usersMatch) {
            window.socket.on('receive-message', data => {
                props.history.location.pathname !== '/global' && setTchat(t => [...t, { ...data }])
                messages.current && messages.current.scrollIntoView({ block: "end", inline: "nearest" });
            })
            window.socket.off('receive-message-global');
            setListen(true)
            setListenGlobal(false);
        } else {
            if (!listenGlobal && !usersMatch) {
                window.socket.on('receive-message-global', data => {
                    setTchat(t => [...t, { ...data }])
                    messages.current && messages.current.scrollIntoView({ block: "end", inline: "nearest" });
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
                messages.current && messages.current.scrollIntoView({ block: "end", inline: "nearest" });
            })
            setListenTchatGroupe(true)
        }
        if (props?.match?.params?.id && !listenListTchatGroup.includes(props?.match?.params?.id)) {
            window.socket.on(props?.match?.params?.id, data => {
                const url = window.location.href.split('/group');
                if (url) {
                    if (url[1]) {
                        if (url[1].substring(1) === data?.destination) {
                            props.history.location.pathname.match('group') && setTchat(t => [...t, { ...data }])
                        }
                    }
                }
            })
            setListenListTchatGroup(prev => [...prev, props?.match?.params?.id]);
        }
        // eslint-disable-next-line
    }, [props?.match?.params])

    return <div className="container-flex-with__camera">
        <Layout.Content className="layout-tchat" onScroll={e => {
            if (e.currentTarget.scrollTop === 0) {
                e.currentTarget.scrollTop = 1
                if (!reloadPagination && _tchat.length >= 25) {
                    if (usersMatch) {
                        return pagination(_tchat.length, false, true)
                    } else {
                        return pagination(_tchat.length, true, false)
                    }
                }
            }
        }}>
            <div className="tchat-container" ref={tchatHeight}>
                {_tchat.map((el, index) => (<div key={el?._id} className="content-item-tchat" senderinfo={_tchat[index]?.sender === _tchat[index + 1]?.sender ? '' : `${_tchat[index]?.sender === user?.data?.id ? '' : _tchat[index]?.pseudo !== "Serveur : " ? `${_tchat[index]?.pseudo} • ${moment(_tchat[index]?.timestamp).format('HH:mm')}` : `message automatique (serveur) • ${moment(_tchat[index]?.timestamp).format('HH:mm')}`}`}>
                    {moment(_tchat[index - 1]?.timestamp).format('DD') !== moment(_tchat[index]?.timestamp).format('DD') ? <div className="content-item-tchat-date"><span>{moment(_tchat[index]?.timestamp).format('DD/MM/YYYY')}</span></div> : <></>}
                    <div key={el?._id} className={`item-message ${user?.data?.id === el?.sender ? 'sender' : 'receiver'}`} >
                        {el?.sender && user?.data?.id !== el?.sender && (
                            <>
                                {_tchat[index]?.sender !== _tchat[index + 1]?.sender &&
                                    <div className="content-avatar">
                                        <Avatar size="small" src={userAvatar[el?.sender] ? userAvatar[el?.sender] : ""} style={{ background: el?.defaultColor ? 'rgba(' + el?.defaultColor + ')' : 'rgb(0, 21, 41)', textTransform: "uppercase" }}>
                                            {el?.pseudo.length > 1 ? el?.pseudo.substring(0, el?.pseudo.length - (el?.pseudo.length - 1)) : el?.pseudo}
                                        </Avatar>
                                    </div>
                                }
                            </>)}
                        {el?.type === 'string' ? <Tooltip title={moment(el?.timestamp).format('HH:mm')} placement="top">
                            <div style={{ ...(_tchat[index]?.sender === 'SERVER' && { background: '#e4e6eb', color: 'black' }) }} className={`content-box-message 
                            ${_tchat[index]?.sender === _tchat[index + 1]?.sender ? 'continue' : 'stop'} 
                            ${_tchat[index - 1]?.sender === _tchat[index + 1]?.sender ? 'continue-normalize' : 'stop-normalize'}`}>
                                <p><CustomRenderElement string={el?.message} /></p>{' '}{_tchat[index]?.type === 'action_groupe' && (<Button type="primary" size="small" onClick={() => viewTchat('groupes')}>Voir les groupes</Button>)}
                            </div>
                        </Tooltip> : <>
                            {!!openedPicture && <Lightbox image={openedPicture?.src} title={openedPicture?.title} onClose={() => setOpenedPicture({})} />}
                            <img onClick={e => setOpenedPicture({ src: e?.currentTarget.src, title: `Envoyé le ${new Date(el?.timestamp).toLocaleDateString('fr')} par ${el?.pseudo}` })} src={el?.message} alt="" className={`image-render-item ${_tchat[index]?.sender === _tchat[index + 1]?.sender ? 'continue' : 'stop'} 
                            ${_tchat[index - 1]?.sender === _tchat[index + 1]?.sender ? 'continue-normalize' : 'stop-normalize'}`} />
                        </>
                        }
                    </div>
                </div>))}
                <div ref={messages} />
            </div>
        </Layout.Content>
    </div >
}

const mapStateToProps = ({ user, tchat }) => ({ user, tchat })

export default _.compose(connect(mapStateToProps), withRouter)(MessageContent)