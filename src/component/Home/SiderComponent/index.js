import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux'
import { Layout, Button, Tooltip, notification, Input, Popover, Drawer, Menu } from 'antd'
import _ from 'underscore'
import './SiderComponent.css'
import './SiderComponentMobile.css'
import swal from 'sweetalert';
import { doLoginOnTchatGroup, getCountUsersConnected, getListeGroupe, getParticipantsFromGroup } from '../../../endpoints';
import { MessageOutlined, WechatOutlined, UserOutlined, TeamOutlined, LoginOutlined, UsergroupAddOutlined, EditOutlined, EyeOutlined, LockOutlined, UnlockOutlined, MenuOutlined } from '@ant-design/icons';
import { setEnterGroupDiscussion, setEnterPrivateTchat, setOpenMenu, setQuitGroupDiscussion } from '../../../action/tchat/tchat_actions';
import { store } from '../../../index'
import CreateNewGroupeModal from './Modal/CreateNewGroupeModal';
import DetailGroupeModal from './Modal/DetailGroupeModal';
import Footer from './Footer/Footer';

const SiderComponent = ({ user, tchat, viewTchat, isMobile, ...props }) => {
    const [users, setUsers] = useState([{}])
    const [groupes, setGroupes] = useState([{}])
    const [filterUser, setFilterUser] = useState([])
    const [listen, setListen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [listenStatus, setListenStatus] = useState(false)
    const [listGroupes, setListenGroupes] = useState(false)
    const [listGroupesUpdate, setListenGroupesUpdate] = useState(false)
    const [choicePopover, setChoicePopover] = useState('clients');
    const [visibleCreateGroupe, setVisibleCreateGroupe] = useState(false);
    const [visibleDetailGroupe, setVisibleDetailGroupe] = useState(false);
    const [currentGroup, setCurrentGroup] = useState({});
    let src = `${process.env.PUBLIC_URL}/sound/notif3.mp3`;
    const audio = new Audio(src);

    const goToPrivate = (id, e) => {
        const getUserElement = document.getElementById(id);
        getUserElement && getUserElement.classList.remove('incomming-message')
        props.dispatch(setEnterPrivateTchat({ userConversation: id }))
        document.title = `tchatez - ${user.data?.name}`
        props.history.push(`/conversation/${e?.data?.id}`, { socketId: id })
    }

    useEffect(() => {
        viewTchat && setChoicePopover(viewTchat)
    }, [viewTchat])

    useEffect(() => {
        getCountUsersConnected({ socketId: user?.data?.id }).then(data => {
            if (data) {
                setUsers(data.users.filter(e => e.id !== window.socket.id))
            }
        })

        getListeGroupe().then(data => {
            if (data) {
                setGroupes(data.groupe)
            }
        })
        // eslint-disable-next-line
    }, [])

    useEffect(() => {
        !listGroupes && window.socket.on('receive-user-add-groupe', data => {
            setListenGroupes(true)
            setGroupes(g => [...g, { data: { ...data, id: data?.id } }])
        })

        !listGroupesUpdate && window.socket.on('receive-user-update-groupe', data => {
            setListenGroupesUpdate(true);
            setTimeout(() => setGroupes(data), 100)
        })
        // eslint-disable-next-line
    }, [])

    useEffect(() => {
        !listenStatus && window.socket.on('users-status', data => {
            setUsers(data)
            setFilterUser(data)
            setListenStatus(true)
        })
    }, [listenStatus])

    useEffect(() => {
        !listen && window.socket.on('users-online', (data) => {
            if (data) {
                setUsers(user => data.type === 'add' ? user ? [...user, { ...data }] : [users] : users.filter(e => e.id !== window.socket.id && e.id !== user.id))
                setFilterUser(user => data.type === 'add' ? user ? [...user, { ...data }] : [users] : users.filter(e => e.id !== window.socket.id && e.id !== user.id))
            }
        })

        !listen && window.socket.on('receive-message', data => {
            const { tchat, user } = store.getState()
            if (user.data?.statusOnline === "online"
                && (data?.socketId === window.socket.id)
                && data?.type === 'string') {
                if (tchat.data.userConversation !== data.socketIdDestination) {
                    const getUserElement = document.getElementById(data?.socketIdDestination);
                    getUserElement && getUserElement.classList.add('incomming-message')
                    const key = `open${Date.now()}`;
                    const btn = (
                        <Button size="middle" onClick={() => { notification.close(key); goToPrivate(data.socketIdDestination || data?.socketId, { data: { id: data?.sender, socketId: data?.socketIdDestination || data?.socketId }, id: data.sender }); document.title = `tchatez - ${user.data?.name}` }} icon={<WechatOutlined />}>
                            Ouvrir la conversation
                        </Button>
                    );
                    notification.open({
                        message: `Nouveau message de ${data.pseudo}`,
                        description:
                            data.message.length > 30 ? `${data.message.substring(0, 30)}...` : data.message,
                        btn,
                        key,
                        className: "notification-handle-receive"
                    });
                    audio.play();
                    return document.title = `Nouveau message - ${data.pseudo}`
                }
            }
        })

        setListen(true)
        // eslint-disable-next-line
    }, [tchat, listen, filterUser])

    const handleSearch = value => {
        setSearchQuery(value?.currentTarget?.value.toLowerCase())
    }

    const handleChange = ({ key }) => {
        switch (key) {
            case 'clients':
                setChoicePopover('clients')
                break;

            case 'groupes':
                setChoicePopover('groupes')
                break;

            default: break
        }
    }

    const onChangeGroupe = data => {
        setVisibleCreateGroupe(data?.visible)
        if (!data?.create) return;
        setGroupes(g => [...g, { data: { dataGroupe: { ...data?.data?.dataGroupe, id: data?.data?.dataGroupe?.id } } }])
        handleJoinGroup({ ...data?.data?.dataGroupe, context: 'create' }, true)
    }

    const handleEditGroupe = group => {
        console.log(group)
    }

    const handleDetailGroupe = group => {
        const { participants } = group;
        setVisibleDetailGroupe(true)
        getParticipantsFromGroup(Array.from(participants))
            .then(data => setCurrentGroup({ ...group, ...data }))
            .catch(err => console.log(err))
    }

    const handleJoinGroup = (group, create) => {
        if (!group.id) return;
        if (group.context === 'create' && create) {
            let prevGroupSubscribed = tchat?.data?.groupeSubscribed || [];
            prevGroupSubscribed.push(group?.id)
            group.currentParticipants++
            props.dispatch(setEnterGroupDiscussion({ currentGroupDiscussion: group, groupeSubscribed: prevGroupSubscribed }))
            props.history.push(`/group/${group?.id}`)
            return window.socket.emit('send-user-update-groupe', { cibleGroupe: group.id, id: user?.data?.id, name: user?.data?.name, type: 'join' });
        }
        if (group.protected && !tchat?.data?.groupeSubscribed.includes(group.id)) {
            if (group.currentParticipants + 1 <= group.maxParticipants) {
                return swal({
                    title: 'Protection du groupe',
                    icon: 'warning',
                    text: 'Saisir le mot de passe',
                    buttons: ['Annuler', 'Ok'],
                    content: 'input'
                }).then(async password => {
                    if (password === null) return;
                    doLoginOnTchatGroup({ group: { groupId: group.id, passwordTyped: password } })
                        .then(status => {
                            if (status === 'OK') {
                                let prevGroupSubscribed = tchat?.data?.groupeSubscribed || [];
                                prevGroupSubscribed.push(group?.id)
                                group.currentParticipants++
                                props.dispatch(setEnterGroupDiscussion({ currentGroupDiscussion: group, groupeSubscribed: prevGroupSubscribed }))
                                props.history.push(`/group/${group?.id}`)
                                window.socket.emit('send-user-update-groupe', { cibleGroupe: group.id, id: user?.data?.id, name: user?.data?.name, type: 'join' });
                            } else {
                                swal({
                                    icon: 'error',
                                    text: 'Mot de passe incorrect !',
                                    timer: 3000
                                }).then(() => handleJoinGroup(group, create))
                            }
                        })
                })
            } else {
                swal({
                    title: `Groupe complet`,
                    icon: 'warning',
                    text: `Vous ne pouvez pas rejoindre ce groupe car il est complet.`,
                    closeOnClickOutside: false,
                    closeOnEsc: false
                })
            }
        }
        if (create) {
            if (group.currentParticipants + 1 <= group.maxParticipants) {
                swal({
                    title: `Rejoindre un groupe`,
                    text: `Souhaitez-vous vraiment rejoindre le groupe : ${group?.name} ?`,
                    buttons: ['Annuler', 'Continuer'],
                    closeOnClickOutside: false,
                    closeOnEsc: false
                }).then(choice => {
                    if (choice) {
                        let prevGroupSubscribed = tchat?.data?.groupeSubscribed || [];
                        prevGroupSubscribed.push(group?.id)
                        group.currentParticipants++
                        props.dispatch(setEnterGroupDiscussion({ currentGroupDiscussion: group, groupeSubscribed: prevGroupSubscribed }))
                        props.history.push(`/group/${group?.id}`)
                        window.socket.emit('send-user-update-groupe', { cibleGroupe: group.id, id: user?.data?.id, name: user?.data?.name, type: 'join' });
                    }
                })
            } else {
                swal({
                    title: `Groupe complet`,
                    icon: 'warning',
                    text: `Vous ne pouvez pas rejoindre ce groupe car il est complet.`,
                    closeOnClickOutside: false,
                    closeOnEsc: false
                })
            }

        } else {
            props.dispatch(setEnterGroupDiscussion({ currentGroupDiscussion: group, groupeSubscribed: tchat?.data?.groupeSubscribed || [] }))
            props.history.push(`/group/${group?.id}`)
        }

    }

    const handleLeftGroup = group => {
        if (!group.id) return;
        swal({
            title: `Quitter un groupe`,
            text: `Souhaitez-vous vraiment quitter le groupe ?`,
            buttons: ['Annuler', 'Continuer'],
            closeOnClickOutside: false,
            closeOnEsc: false
        }).then(choice => {
            if (choice) {
                let prevGroupSubscribed = tchat?.data?.groupeSubscribed;
                group.currentParticipants--;
                props.dispatch(setQuitGroupDiscussion({ currentGroupDiscussion: undefined, groupeSubscribed: prevGroupSubscribed.filter(e => e !== group.id) }))
                props.history.push(`/global`)
                window.socket.emit('send-user-update-groupe', { cibleGroupe: group.id, id: user?.data?.id, name: user?.data?.name, type: 'left' });
            }
        })
    }

    return (
        <Layout>
            <Layout.Sider className="sider-users-connected" id="button-mobile">
                {isMobile ? <Drawer className="sider-mobile" title="WeWorldChat" placement="left" closable key="1" visible={tchat?.data?.menuOpened} onClose={() => props.dispatch(setOpenMenu({ menuOpened: false }))}>
                    <div className="flex-container">
                        <ul className="list-users-connected">
                            <div className="search-containter">
                                <Input placeholder={`${choicePopover === 'clients' ? 'Rechercher un utilisateur' : 'Rechercher un groupe'}`}
                                    className="search-users"
                                    onChange={handleSearch}
                                    type="text"
                                ></Input>
                                <Menu mode="horizontal" onClick={handleChange} selectedKeys={choicePopover} className="search-container-selectable">
                                    <Menu.Item key="clients">
                                        Conversation
                                    </Menu.Item>
                                    <Menu.Item key="groupes">
                                        Utilisateur
                                    </Menu.Item>
                                </Menu>
                            </div>
                            {choicePopover === 'clients' ? <div className="item__user">
                                {typeof users !== 'undefined' && (searchQuery.length > 0 ? users.filter(el => typeof el?.data?.pseudo.toLowerCase().match(searchQuery) !== 'undefined' && typeof el?.data?.pseudo.toLowerCase().match(searchQuery)?.input !== 'undefined' && el?.data?.pseudo.toLowerCase() === el?.data?.pseudo.toLowerCase().match(searchQuery).input) : users).map((el, index) => (
                                    <>{
                                        el.id !== user.data?.id && (
                                            <li key={index} id={el.id} className={`item-user ${el.id === tchat.data?.userConversation ? 'selected' : ''}`}>
                                                <Tooltip title={`${el.data?.pseudo} - ${el.data?.statusOnline === 'busy' ? 'occupé' : 'en ligne'}`} placement={el.data?.pseudo.length < 8 ? 'topRight' : 'top'}>
                                                    <div className="info-user">
                                                        <div className={`status__online__${el.data?.statusOnline === 'online' ? 'online' : 'busy'}`} />
                                            &nbsp;
                                            <span>{el.data?.pseudo}</span>
                                                    </div>
                                                </Tooltip>
                                                {el.id !== user.data?.id && <Button size="small" disabled={el.id === tchat.data?.userConversation} onClick={() => goToPrivate(el.id, el)}><MessageOutlined /></Button>}
                                            </li>
                                        )
                                    }</>
                                ))}
                            </div> : <div className="item__groupe">
                                <Button className="button-create-groupe" icon={<UsergroupAddOutlined />} onClick={() => setVisibleCreateGroupe(true)}>Créer un groupe</Button>
                                <CreateNewGroupeModal visible={visibleCreateGroupe} onChange={onChangeGroupe} onCreate={e => handleJoinGroup(e, true)} owner={{ name: user.data?.name, id: user?.data?.id }} />
                                <DetailGroupeModal visible={visibleDetailGroupe} current={currentGroup} onChange={e => setVisibleDetailGroupe(e)} />
                                {typeof groupes !== 'undefined' && (searchQuery.length > 0 ? groupes.filter(el => typeof el?.data?.dataGroupe.name.toLowerCase().match(searchQuery) !== 'undefined' && typeof el?.data?.dataGroupe.name.toLowerCase().match(searchQuery)?.input !== 'undefined' && el?.data?.dataGroupe.name.toLowerCase() === el?.data?.dataGroupe.name.toLowerCase().match(searchQuery).input) : groupes).map((groupe, index) => (
                                    <li className={`item-groupe groupe-${index}`} key={index} >
                                        <div className="groupe-container">
                                            <div className="groupe-title">
                                                <span>{groupe?.data?.dataGroupe?.name}</span>
                                                <div className="button-action">
                                                    <Button icon={tchat?.data?.groupeSubscribed && tchat?.data?.groupeSubscribed.includes(groupe?.data?.dataGroupe?.id) ? <MessageOutlined /> : groupe?.data?.dataGroupe?.owner === user?.data?.id ? <EditOutlined /> : <EyeOutlined />} onClick={() => tchat?.data?.groupeSubscribed.includes(groupe?.data?.dataGroupe?.id) ? handleJoinGroup(groupe?.data?.dataGroupe, false) : groupe?.data?.dataGroupe?.owner === user?.data?.id ? handleEditGroupe(groupe?.data?.dataGroupe) : handleDetailGroupe(groupe?.data?.dataGroupe)} size="small" />
                                                    <Button className={groupe?.data?.dataGroupe?.protected ? "group-secure" : "group-open"} icon={groupe?.data?.dataGroupe?.protected ? <LockOutlined /> : <UnlockOutlined />} size="small" />
                                                </div>
                                            </div>
                                            <div className="groupe-available-space">
                                                <Button size="small" icon={<LoginOutlined />} onClick={() => !tchat?.data?.groupeSubscribed || !tchat?.data?.groupeSubscribed.includes(groupe?.data?.dataGroupe?.id) ? handleJoinGroup(groupe?.data?.dataGroupe, true) : handleLeftGroup(groupe?.data?.dataGroupe)}>{tchat?.data?.groupeSubscribed && tchat?.data?.groupeSubscribed.includes(groupe?.data?.dataGroupe?.id) ? 'Sortir du groupe' : 'Rejoindre le groupe'}</Button>
                                                <div><TeamOutlined />{' '}{groupe?.data?.dataGroupe?.currentParticipants}/{groupe?.data?.dataGroupe?.maxParticipants}</div>
                                            </div>
                                        </div>
                                    </li>))}
                            </div>}
                        </ul>
                        <Footer />
                    </div></Drawer> : <div className="flex-container">
                    <ul className="list-users-connected">
                        <div className="search-containter">
                            <Input placeholder={`${choicePopover === 'clients' ? 'Rechercher un utilisateur' : 'Rechercher un groupe'}`}
                                className="search-users"
                                onChange={handleSearch}
                                type="text"
                            ></Input>
                            <Menu mode="horizontal" onClick={handleChange} selectedKeys={choicePopover} className="search-container-selectable">
                                <Menu.Item key="clients">
                                    Conversation
                                    </Menu.Item>
                                <Menu.Item key="groupes">
                                    Utilisateur
                                    </Menu.Item>
                            </Menu>
                        </div>
                        {choicePopover === 'clients' ? <div className="item__user">
                            {typeof users !== 'undefined' && (searchQuery.length > 0 ? users.filter(el => typeof el?.data?.pseudo.toLowerCase().match(searchQuery) !== 'undefined' && typeof el?.data?.pseudo.toLowerCase().match(searchQuery)?.input !== 'undefined' && el?.data?.pseudo.toLowerCase() === el?.data?.pseudo.toLowerCase().match(searchQuery).input) : users).map((el, index) => (
                                <>{
                                    el.id !== user.data?.id && (
                                        <li key={index} id={el.id} className={`item-user ${el.id === tchat.data?.userConversation ? 'selected' : ''}`}>
                                            <Tooltip title={`${el.data?.pseudo} - ${el.data?.statusOnline === 'busy' ? 'occupé' : 'en ligne'}`} placement={el.data?.pseudo.length < 8 ? 'topRight' : 'top'}>
                                                <div className="info-user">
                                                    <div className={`status__online__${el.data?.statusOnline === 'online' ? 'online' : 'busy'}`} />
                                            &nbsp;
                                            <span onClick={() => goToPrivate(el.id, el)}>{el.data?.pseudo}</span>
                                                </div>
                                            </Tooltip>
                                            {el.id !== user.data?.id && <Button size="small" disabled={el.id === tchat.data?.userConversation} onClick={() => goToPrivate(el.id, el)}><MessageOutlined /></Button>}
                                        </li>
                                    )
                                }</>
                            ))}
                        </div> : <div className="item__groupe">
                            <Button className="button-create-groupe" icon={<UsergroupAddOutlined />} onClick={() => setVisibleCreateGroupe(true)}>Créer un groupe</Button>
                            <CreateNewGroupeModal visible={visibleCreateGroupe} onChange={onChangeGroupe} onCreate={e => handleJoinGroup(e, true)} owner={{ name: user.data?.name, id: user?.data?.id }} />
                            <DetailGroupeModal visible={visibleDetailGroupe} current={currentGroup} onChange={e => setVisibleDetailGroupe(e)} />
                            {typeof groupes !== 'undefined' && (searchQuery.length > 0 ? groupes.filter(el => typeof el?.data?.dataGroupe.name.toLowerCase().match(searchQuery) !== 'undefined' && typeof el?.data?.dataGroupe.name.toLowerCase().match(searchQuery)?.input !== 'undefined' && el?.data?.dataGroupe.name.toLowerCase() === el?.data?.dataGroupe.name.toLowerCase().match(searchQuery).input) : groupes).map((groupe, index) => (
                                <li className={`item-groupe groupe-${index}`} key={index} >
                                    <div className="groupe-container">
                                        <div className="groupe-title">
                                            <span>{groupe?.data?.dataGroupe?.name}</span>
                                            <div className="button-action">
                                                <Button icon={tchat?.data?.groupeSubscribed && tchat?.data?.groupeSubscribed.includes(groupe?.data?.dataGroupe?.id) ? <MessageOutlined /> : groupe?.data?.dataGroupe?.owner === user?.data?.id ? <EditOutlined /> : <EyeOutlined />} onClick={() => tchat?.data?.groupeSubscribed.includes(groupe?.data?.dataGroupe?.id) ? handleJoinGroup(groupe?.data?.dataGroupe, false) : groupe?.data?.dataGroupe?.owner === user?.data?.id ? handleEditGroupe(groupe?.data?.dataGroupe) : handleDetailGroupe(groupe?.data?.dataGroupe)} size="small" />
                                                <Button className={groupe?.data?.dataGroupe?.protected ? "group-secure" : "group-open"} icon={groupe?.data?.dataGroupe?.protected ? <LockOutlined /> : <UnlockOutlined />} size="small" />
                                            </div>
                                        </div>
                                        <div className="groupe-available-space">
                                            <Button size="small" icon={<LoginOutlined />} onClick={() => !tchat?.data?.groupeSubscribed || !tchat?.data?.groupeSubscribed.includes(groupe?.data?.dataGroupe?.id) ? handleJoinGroup(groupe?.data?.dataGroupe, true) : handleLeftGroup(groupe?.data?.dataGroupe)}>{tchat?.data?.groupeSubscribed && tchat?.data?.groupeSubscribed.includes(groupe?.data?.dataGroupe?.id) ? 'Sortir du groupe' : 'Rejoindre le groupe'}</Button>
                                            <div><TeamOutlined />{' '}{groupe?.data?.dataGroupe?.currentParticipants}/{groupe?.data?.dataGroupe?.maxParticipants}</div>
                                        </div>
                                    </div>
                                </li>))}
                        </div>}
                    </ul>
                    <Footer />
                </div>}
            </Layout.Sider>
        </Layout >)
}

const mapStateToProps = ({ user, tchat }) => ({ user, tchat })
const mapDispatchToProps = dispatch => ({ dispatch })

export default _.compose(connect(mapStateToProps, mapDispatchToProps), withRouter)(SiderComponent)