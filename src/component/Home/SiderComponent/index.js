import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux'
import { Layout, Button, Tooltip, Input, Drawer, Menu } from 'antd'
import _ from 'underscore'
import './SiderComponent.css'
import './SiderComponentMobile.css'
import swal from 'sweetalert';
import { doLoginOnTchatGroup, getCountUsersConnected, getListeGroupe, getParticipantsFromGroup } from '../../../endpoints';
import { MessageOutlined, TeamOutlined, LoginOutlined, UsergroupAddOutlined, EditOutlined, EyeOutlined, LockOutlined, UnlockOutlined } from '@ant-design/icons';
import { setEnterGroupDiscussion, setEnterPrivateTchat, setOpenMenu, setQuitGroupDiscussion } from '../../../action/tchat/tchat_actions';
import { store } from '../../../index'
import CreateNewGroupeModal from './Modal/CreateNewGroupeModal';
import DetailGroupeModal from './Modal/DetailGroupeModal';
import Footer from './Footer/Footer';
import { Notification } from '../../Notification';

const SiderComponent = ({ user, tchat, viewTchat, isMobile, onSelectUser, ...props }) => {
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

    const goToPrivate = (id, e) => {
        const getUserElement = document.getElementById(id);
        getUserElement && getUserElement.classList.remove('incomming-message')
        props.dispatch(setEnterPrivateTchat({ userConversation: id }))
        document.title = `tchatez - ${user.data?.name}`
        onSelectUser(e.data?.pseudo)
        props.history.push(`/conversation/${e?.data?.id}`, { socketId: id })
    }

    const goToPrivateGroup = (id) => {
        props.history.push(`/group/${id}`)
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
                console.log('fetch groupe', data.groupe)
                setGroupes(data.groupe)
            }
        })
        // eslint-disable-next-line
    }, [])

    useEffect(() => {
        // const { tchat, user } = store.getState()
        console.log(tchat)
    }, [tchat])

    useEffect(() => {
        !listGroupes && window.socket.on('receive-user-add-groupe', data => {
            setListenGroupes(true)
            console.log('socket data', data)
            setGroupes(g => [...g, { ...data }].sort((a, b) => a.timestamp > b.timestamp ? -1 : 1))
        })

        !listGroupesUpdate && window.socket.on('receive-user-update-groupe', data => {
            setListenGroupesUpdate(true);
            setTimeout(() => setGroupes(data.sort((a, b) => a.timestamp > b.timestamp ? -1 : 1)), 100)
        })
        // eslint-disable-next-line
    }, [])

    useEffect(() => {
        !listenStatus && window.socket.on('users-status', data => {
            setUsers(data.users.filter(e => e.id !== window.socket.id))
            setFilterUser(data.users.filter(e => e.id !== window.socket.id))
            setListenStatus(true)
        })
    }, [listenStatus])

    useEffect(() => {
        !listen && window.socket.on('users-online', (data) => {
            if (data?.users) {
                setUsers(data.users)
                setFilterUser(data.users)
            }
        })

        !listen && window.socket.on('receive-message', data => {
            const { tchat, user } = store.getState()
            if (user.data?.statusOnline === "online"
                && (data?.socketId === window.socket.id)) {
                if (tchat.data.userConversation !== data.socketIdDestination) {
                    const getUserElement = document.getElementById(data?.socketIdDestination);
                    getUserElement && getUserElement.classList.add('incomming-message')
                    return Notification(data, goToPrivate, user)                 
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
        handleJoinGroup({ ...data?.dataGroupe, context: 'create', _id: data?._id }, true)
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
        if (!group._id) return;
        if (group.context === 'create' && create) {
            let prevGroupSubscribed = tchat?.data?.groupeSubscribed || [];
            prevGroupSubscribed.push(group?._id)
            group.currentParticipants = group.participants.length + 1
            props.dispatch(setEnterGroupDiscussion({ currentGroupDiscussion: group, groupeSubscribed: prevGroupSubscribed }))
            props.history.push(`/group/${group?._id}`)
            return window.socket.emit('send-user-update-groupe', { cibleGroupe: group._id, _id: user?.data?.id, name: user?.data?.name, type: 'join' });
        }
        if (group.protected && !tchat?.data?.groupeSubscribed.includes(group._id)) {
            if (group.participants.length + 1 <= group.maxParticipants) {
                return swal({
                    title: 'Protection du groupe',
                    icon: 'warning',
                    text: 'Saisir le mot de passe',
                    buttons: ['Annuler', 'Ok'],
                    content: 'input'
                }).then(async password => {
                    if (password === null) return;
                    doLoginOnTchatGroup({ group: { groupId: group._id, passwordTyped: password } })
                        .then(status => {
                            if (status === 'OK') {
                                let prevGroupSubscribed = tchat?.data?.groupeSubscribed || [];
                                prevGroupSubscribed.push(group?._id)
                                group.currentParticipants = group.participants.length + 1
                                props.dispatch(setEnterGroupDiscussion({ currentGroupDiscussion: group, groupeSubscribed: prevGroupSubscribed }))
                                props.history.push(`/group/${group?._id}`)
                                window.socket.emit('send-user-update-groupe', { cibleGroupe: group._id, _id: user?.data?.id, name: user?.data?.name, type: 'join' });
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
            if (group.participants.length + 1 <= group.maxParticipants) {
                swal({
                    title: `Rejoindre un groupe`,
                    text: `Souhaitez-vous vraiment rejoindre le groupe : ${group?.name} ?`,
                    buttons: ['Annuler', 'Continuer'],
                    closeOnClickOutside: false,
                    closeOnEsc: false
                }).then(choice => {
                    if (choice) {
                        let prevGroupSubscribed = tchat?.data?.groupeSubscribed || [];
                        prevGroupSubscribed.push(group?._id)
                        group.currentParticipants = group.participants.length + 1
                        props.dispatch(setEnterGroupDiscussion({ currentGroupDiscussion: group, groupeSubscribed: prevGroupSubscribed }))
                        props.history.push(`/group/${group?._id}`)
                        window.socket.emit('send-user-update-groupe', { cibleGroupe: group._id, _id: user?.data?.id, name: user?.data?.name, type: 'join' });
                        window.socket.on(group._id, (data) => { data.groupId !== props?.match?.params?.id && Notification(data, goToPrivateGroup, user, 'group'); })
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
            props.history.push(`/group/${group?._id}`)
        }

    }

    const handleLeftGroup = group => {
        if (!group._id) return;
        swal({
            title: `Quitter un groupe`,
            text: `Souhaitez-vous vraiment quitter le groupe ?`,
            buttons: ['Annuler', 'Continuer'],
            closeOnClickOutside: false,
            closeOnEsc: false
        }).then(choice => {
            if (choice) {
                let prevGroupSubscribed = tchat?.data?.groupeSubscribed;
                group.currentParticipants = group.participants.length - 1;
                window.socket.off(group._id)
                props.dispatch(setQuitGroupDiscussion({ currentGroupDiscussion: undefined, groupeSubscribed: prevGroupSubscribed.filter(e => e !== group._id) }))
                props.history.push(`/global`)
                window.socket.emit('send-user-update-groupe', { cibleGroupe: group._id, _id: user?.data?.id, name: user?.data?.name, type: 'left' });
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
                                        Groupe
                                    </Menu.Item>
                                </Menu>
                            </div>
                            {choicePopover === 'clients' ? <div className="item__user">
                                {typeof users !== 'undefined' && (searchQuery.length > 0 ? users.filter(el => typeof el?.data?.pseudo.toLowerCase().match(searchQuery) !== 'undefined' && typeof el?.data?.pseudo.toLowerCase().match(searchQuery)?.input !== 'undefined' && el?.data?.pseudo.toLowerCase() === el?.data?.pseudo.toLowerCase().match(searchQuery).input) : users).map((el, index) => (
                                    <>{
                                        el?.data?.id !== user.data?.id && (
                                            <li key={index} id={el?.data?.id} className={`item-user ${el.id === tchat.data?.userConversation ? 'selected' : ''}`}>
                                                <Tooltip title={`${el.data?.pseudo} - ${el.data?.statusOnline === 'busy' ? 'occupé' : 'en ligne'}`} placement={el.data?.pseudo.length < 8 ? 'topRight' : 'top'}>
                                                    <div className="info-user">
                                                        <div className={`status__online__${el.data?.statusOnline === 'online' ? 'online' : 'busy'}`} />
                                                        &nbsp;
                                                        <span onClick={() => goToPrivate(el?.id, el)}>{el.data?.pseudo}</span>
                                                    </div>
                                                </Tooltip>
                                                {el?.data?.id !== user.data?.id && <Button size="small" disabled={el.id === tchat.data?.userConversation} onClick={() => goToPrivate(el.id, el)}><MessageOutlined /></Button>}
                                            </li>
                                        )
                                    }</>
                                ))}
                            </div> : <div className="item__groupe">
                                <Button className="button-create-groupe" icon={<UsergroupAddOutlined />} onClick={() => setVisibleCreateGroupe(true)}>Créer un groupe</Button>
                                <CreateNewGroupeModal visible={visibleCreateGroupe} onChange={onChangeGroupe} onCreate={e => handleJoinGroup(e, true)} owner={{ name: user.data?.name, id: user?.data?.id }} />
                                <DetailGroupeModal visible={visibleDetailGroupe} onSelectUser={onSelectUser} current={currentGroup} onChange={e => setVisibleDetailGroupe(e)} />
                                {typeof groupes !== 'undefined' && (searchQuery.length > 0 ? groupes.filter(el => typeof el?.dataGroupe.name.toLowerCase().match(searchQuery) !== 'undefined' && typeof el?.dataGroupe.name.toLowerCase().match(searchQuery)?.input !== 'undefined' && el?.dataGroupe.name.toLowerCase() === el?.dataGroupe.name.toLowerCase().match(searchQuery).input) : groupes).map((groupe, index) => (
                                    <li className={`item-groupe groupe-${index}`} key={index} >
                                        <div className="groupe-container">
                                            <div className="groupe-title">
                                                <span>{groupe?.dataGroupe?.name}</span>
                                                <div className="button-action">
                                                    <Button icon={tchat?.data?.groupeSubscribed && tchat?.data?.groupeSubscribed.includes(groupe?._id) ? <MessageOutlined /> : groupe?.dataGroupe?.owner === user?.data?.id ? <EditOutlined /> : <EyeOutlined />} onClick={() => tchat?.data?.groupeSubscribed.includes(groupe?._id) ? handleJoinGroup({ ...groupe?.dataGroupe, _id: groupe?._id }, false) : groupe?.dataGroupe?.owner === user?.data?.id ? handleEditGroupe({ ...groupe?.dataGroupe, _id: groupe?._id }) : handleDetailGroupe({ ...groupe?.dataGroupe, _id: groupe?._id })} size="small" />
                                                    <Button className={groupe?.dataGroupe?.protected ? "group-secure" : "group-open"} icon={groupe?.dataGroupe?.protected ? <LockOutlined /> : <UnlockOutlined />} size="small" />
                                                </div>
                                            </div>
                                            <div className="groupe-available-space">
                                                <Button size="small" icon={<LoginOutlined />} onClick={() => !tchat?.data?.groupeSubscribed || !tchat?.data?.groupeSubscribed.includes(groupe?._id) ? handleJoinGroup({ ...groupe?.dataGroupe, _id: groupe?._id }, true) : handleLeftGroup({ ...groupe?.dataGroupe, _id: groupe?._id })}>{tchat?.data?.groupeSubscribed && tchat?.data?.groupeSubscribed.includes(groupe?._id) ? 'Sortir du groupe' : 'Rejoindre le groupe'}</Button>
                                                <div><TeamOutlined />{' '}{groupe?.dataGroupe?.participants.length}/{groupe?.dataGroupe?.maxParticipants}</div>
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
                                    Groupe
                                </Menu.Item>
                            </Menu>
                        </div>
                        {choicePopover === 'clients' ? <div className="item__user">
                            {typeof users !== 'undefined' && (searchQuery.length > 0 ? users.filter(el => typeof el?.data?.pseudo.toLowerCase().match(searchQuery) !== 'undefined' && typeof el?.data?.pseudo.toLowerCase().match(searchQuery)?.input !== 'undefined' && el?.data?.pseudo.toLowerCase() === el?.data?.pseudo.toLowerCase().match(searchQuery).input) : users).map((el, index) => (
                                <>{
                                    el?.data?.id !== user.data?.id && (
                                        <li key={index} id={el?.data?.id} className={`item-user ${el?.id === tchat.data?.userConversation ? 'selected' : ''}`}>
                                            <Tooltip title={`${el.data?.pseudo} - ${el.data?.statusOnline === 'busy' ? 'occupé' : 'en ligne'}`} placement={el.data?.pseudo.length < 8 ? 'topRight' : 'top'}>
                                                <div className="info-user">
                                                    <div className={`status__online__${el.data?.statusOnline === 'online' ? 'online' : 'busy'}`} />
                                                    &nbsp;
                                                    <span onClick={() => goToPrivate(el?.id, el)}>{el.data?.pseudo}</span>
                                                </div>
                                            </Tooltip>
                                            {el?.data?.id !== user.data?.id && <Button size="small" disabled={el?.id === tchat.data?.userConversation} onClick={() => goToPrivate(el?.id, el)}><MessageOutlined /></Button>}
                                        </li>
                                    )
                                }</>
                            ))}
                        </div> : <div className="item__groupe">
                            <Button className="button-create-groupe" icon={<UsergroupAddOutlined />} onClick={() => setVisibleCreateGroupe(true)}>Créer un groupe</Button>
                            <CreateNewGroupeModal visible={visibleCreateGroupe} onChange={onChangeGroupe} onCreate={e => handleJoinGroup(e, true)} owner={{ name: user.data?.name, id: user?.data?.id }} />
                            <DetailGroupeModal visible={visibleDetailGroupe} onSelectUser={onSelectUser} current={currentGroup} onChange={e => setVisibleDetailGroupe(e)} />
                            {typeof groupes !== 'undefined' && (searchQuery.length > 0 ? groupes.filter(el => typeof el?.dataGroupe.name.toLowerCase().match(searchQuery) !== 'undefined' && typeof el?.dataGroupe.name.toLowerCase().match(searchQuery)?.input !== 'undefined' && el?.dataGroupe.name.toLowerCase() === el?.dataGroupe.name.toLowerCase().match(searchQuery).input) : groupes).map((groupe, index) => (
                                <li className={`item-groupe groupe-${index}`} key={index} >
                                    <div className="groupe-container">
                                        <div className="groupe-title">
                                            <span>{groupe?.dataGroupe?.name}</span>
                                            <div className="button-action">
                                                <Button icon={tchat?.data?.groupeSubscribed && tchat?.data?.groupeSubscribed.includes(groupe?._id) ? <MessageOutlined /> : groupe?.dataGroupe?.owner === user?.data?.id ? <EditOutlined /> : <EyeOutlined />} onClick={() => tchat?.data?.groupeSubscribed.includes(groupe?._id) ? handleJoinGroup({ ...groupe?.dataGroupe, _id: groupe?._id }, false) : groupe?.dataGroupe?.owner === user?.data?.id ? handleEditGroupe({ ...groupe?.dataGroupe, _id: groupe?._id }) : handleDetailGroupe({ ...groupe?.dataGroupe, _id: groupe?._id })} size="small" />
                                                <Button className={groupe?.dataGroupe?.protected ? "group-secure" : "group-open"} icon={groupe?.dataGroupe?.protected ? <LockOutlined /> : <UnlockOutlined />} size="small" />
                                            </div>
                                        </div>
                                        <div className="groupe-available-space">
                                            <Button size="small" icon={<LoginOutlined />} onClick={() => !tchat?.data?.groupeSubscribed || !tchat?.data?.groupeSubscribed.includes(groupe?._id) ? handleJoinGroup({ ...groupe?.dataGroupe, _id: groupe?._id }, true) : handleLeftGroup({ ...groupe?.dataGroupe, _id: groupe?._id })}>{tchat?.data?.groupeSubscribed && tchat?.data?.groupeSubscribed.includes(groupe?._id) ? 'Sortir du groupe' : 'Rejoindre le groupe'}</Button>
                                            <div><TeamOutlined />{' '}{groupe?.dataGroupe?.participants.length}/{groupe?.dataGroupe?.maxParticipants}</div>
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