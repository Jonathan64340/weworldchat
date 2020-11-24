import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux'
import { Layout, Button, Tooltip, notification, Input, Popover } from 'antd'
import _ from 'underscore'
import './SiderComponent.css'
import swal from 'sweetalert';
import { getCountUsersConnected, getListeGroupe } from '../../../endpoints';
import { MessageOutlined, WechatOutlined, PlayCircleFilled, SettingOutlined, UserOutlined, TeamOutlined, LoginOutlined, UsergroupAddOutlined, EditOutlined, EyeOutlined, LockOutlined, UnlockOutlined, LinkedinFilled, GithubFilled } from '@ant-design/icons';
import { setEnterGroupDiscussion, setEnterPrivateTchat, setOpenMenu, setQuitGroupDiscussion } from '../../../action/tchat/tchat_actions';
import { store } from '../../../index'
import CreateNewGroupeModal from './Modal/CreateNewGroupeModal';
import DetailGroupeModal from './Modal/DetailGroupeModal';
import { getVersion } from '../../../endpoints/app';

const SiderComponent = ({ user, tchat, viewTchat, ...props }) => {
    const [users, setUsers] = useState([{}])
    const [groupes, setGroupes] = useState([{}])
    const [filterUser, setFilterUser] = useState([])
    const [listen, setListen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [listenStatus, setListenStatus] = useState(false)
    const [listGroupes, setListenGroupes] = useState(false)
    const [listGroupesUpdate, setListenGroupesUpdate] = useState(false)
    const [mobileMenu, setMobileMenu] = useState(false)
    const [openPopover, setOpenPopover] = useState(false)
    const [choicePopover, setChoicePopover] = useState('clients');
    const [visibleCreateGroupe, setVisibleCreateGroupe] = useState(false);
    const [visibleDetailGroupe, setVisibleDetailGroupe] = useState(false);
    const [currentGroup, setCurrentGroup] = useState({});
    const [currentVersion, setCurrentVersion] = useState(undefined);
    let src = `${process.env.PUBLIC_URL}/sound/notif2.mp3`
    let audio = new Audio(src);

    const goToPrivate = (id) => {
        props.dispatch(setEnterPrivateTchat({ userConversation: id }))
        document.title = `tchatez - ${user.data?.name}`
        props.history.push(`/conversation/${id}`)
    }

    useEffect(() => {
        viewTchat && setChoicePopover(viewTchat)
    }, [viewTchat])

    useEffect(() => {
        getVersion().then(data => setCurrentVersion(data.version))
        getCountUsersConnected().then(data => {
            if (data) {
                setUsers(data.users)
            }
        })

        getListeGroupe().then(data => {
            if (data) {
                setGroupes(data.groupe)
            }
        })
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
        !listen && window.socket.on('receive-message', data => {
            const { tchat, user } = store.getState()
            if (user.data?.statusOnline === "online" && (data.usersContaints.split(':')[0] === window.socket.id || data.usersContaints.split(':')[1] === window.socket.id) && data.data?.type === 'string') {
                if (tchat.data?.userConversation !== data.data.sender) {
                    const key = `open${Date.now()}`;
                    const btn = (
                        <Button size="middle" onClick={() => { notification.close(key); goToPrivate(data.data.sender); document.title = `tchatez - ${user.data?.name}` }} icon={<WechatOutlined />}>
                            Ouvrir la conversation
                        </Button>
                    );
                    notification.open({
                        message: `Nouveau message de ${data.data.pseudo}`,
                        description:
                            data.data.message.length > 30 ? `${data.data.message.substring(0, 30)}...` : data.data.message,
                        btn,
                        key,
                        className: "notification-handle-receive"
                    });
                    audio.play();
                    return document.title = `Nouveau message - ${data.data.pseudo}`
                }
            }
        })

        !listen && window.socket.on('users-online', (data) => {
            if (data) {
                setUsers(data.users)
                setFilterUser(data.users)
            }
        })

        setListen(true)
        // eslint-disable-next-line
    }, [tchat, listen, filterUser])

    const handleSearch = value => {
        setSearchQuery(value?.currentTarget?.value)
    }

    const handleChange = type => {
        switch (type) {
            case 'clients':
                setOpenPopover(false)
                setChoicePopover('clients')
                break;

            case 'groupes':
                setOpenPopover(false)
                setChoicePopover('groupes')
                break;

            default: break
        }
    }


    const toggleMobileMenu = () => {
        setMobileMenu(!mobileMenu)
        props.dispatch(setOpenMenu({ menuOpened: !tchat?.data?.menuOpened }))
        const btnMobile = document.getElementById('button-mobile')
        const iconBtnMobile = document.getElementsByClassName('button-opened-menu')
        btnMobile.style.marginLeft = tchat?.data?.menuOpened ? "-165px" : 0
        iconBtnMobile[0].style.transform = !tchat?.data?.menuOpened ? "rotate(180deg)" : "rotate(0deg)"
    }

    const onChangeGroupe = data => {
        setVisibleCreateGroupe(data?.visible)
        if (!data?.create) return;
        setGroupes(g => [...g, { data: { dataGroupe: { ...data?.data?.dataGroupe, id: data?.data?.dataGroupe?.id } } }])
    }

    const content = (
        <div className="list-option-display">
            <div onClick={() => handleChange('clients')}>
                <span><UserOutlined />{' '}Clients</span>
            </div>
            <div onClick={() => handleChange('groupes')}>
                <span><TeamOutlined />{' '}Groupes</span>
            </div>
        </div>
    );

    const handleEditGroupe = group => {
        console.log(group)
    }

    const handleDetailGroupe = group => {
        setCurrentGroup(group)
        setVisibleDetailGroupe(true)
    }

    const handleJoinGroup = (group, create) => {
        if (!group.id) return;
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

    return (<Layout>
        <Layout.Sider className="sider-users-connected" id="button-mobile">
            <PlayCircleFilled className="button-opened-menu" onClick={() => toggleMobileMenu()} />
            <div className="flex-container">
                <ul className="list-users-connected">
                    <div className="search-containter">
                        <Input placeholder={`${choicePopover === 'clients' ? 'Rechercher un utilisateur' : 'Rechercher un groupe'}`}
                            className="search-users"
                            onChange={handleSearch}
                            type="text"
                        ></Input>
                        <Popover placement="bottomRight" title="Affichage" content={content} onClick={() => setOpenPopover(true)} visible={openPopover}>
                            <Button icon={<SettingOutlined />} />
                        </Popover>
                    </div>
                    {choicePopover === 'clients' ? <div className="item__user">
                        {typeof users !== 'undefined' && (searchQuery.length > 0 ? users.filter(el => typeof el?.data?.pseudo.match(searchQuery) !== 'undefined' && typeof el?.data?.pseudo.match(searchQuery)?.input !== 'undefined' && el?.data?.pseudo === el?.data?.pseudo.match(searchQuery).input) : users).map((el, index) => (
                            <>{
                                el.id !== user.data?.id && (
                                    <li key={index} className={`item-user ${el.id === tchat.data?.userConversation ? 'selected' : ''}`}>
                                        <Tooltip title={`${el.data?.pseudo} - ${el.data?.statusOnline === 'busy' ? 'occupé' : 'en ligne'}`} placement={el.data?.pseudo.length < 8 ? 'topRight' : 'top'}>
                                            <div className="info-user">
                                                <div className={`status__online__${el.data?.statusOnline === 'online' ? 'online' : 'busy'}`} />
                                            &nbsp;
                                            {el.data?.pseudo}
                                            </div>
                                        </Tooltip>
                                        {el.id !== user.data?.id && <Button size="small" disabled={el.id === tchat.data?.userConversation} onClick={() => goToPrivate(el.id)}><MessageOutlined /></Button>}
                                    </li>
                                )
                            }</>
                        ))}
                    </div> : <div className="item__groupe">
                            <Button className="button-create-groupe" icon={<UsergroupAddOutlined />} onClick={() => setVisibleCreateGroupe(true)}>Créer un groupe</Button>
                            <CreateNewGroupeModal visible={visibleCreateGroupe} onChange={onChangeGroupe} owner={{ name: user.data?.name, id: user?.data?.id }} />
                            <DetailGroupeModal visible={visibleDetailGroupe} current={currentGroup} onChange={e => setVisibleDetailGroupe(e)} />
                            {typeof groupes !== 'undefined' && (searchQuery.length > 0 ? groupes.filter(el => typeof el?.data?.dataGroupe.name.match(searchQuery) !== 'undefined' && typeof el?.data?.dataGroupe.name.match(searchQuery)?.input !== 'undefined' && el?.data?.dataGroupe.name === el?.data?.dataGroupe.name.match(searchQuery).input) : groupes).map((groupe, index) => (
                                <li className={`item-groupe groupe-${index}`} >
                                    <div className="groupe-container">
                                        <div className="groupe-title">
                                            <span>{groupe?.data?.dataGroupe?.name}</span>
                                            <div className="button-action">
                                                <Button icon={tchat?.data?.groupeSubscribed && tchat?.data?.groupeSubscribed.includes(groupe?.data?.dataGroupe?.id) ? <MessageOutlined /> : groupe?.data?.dataGroupe?.owner === user?.data?.id ? <EditOutlined /> : <EyeOutlined />} onClick={() => tchat?.data?.groupeSubscribed.includes(groupe?.data?.dataGroupe?.id) ? handleJoinGroup(groupe?.data?.dataGroupe, false) : groupe?.data?.dataGroupe?.owner === user?.data?.id ? handleEditGroupe(groupe?.data?.dataGroupe) : handleDetailGroupe(groupe?.data?.dataGroupe)} size="small" />
                                                <Button className={groupe?.data?.dataGroupe?.protected ? "group-secure" : "group-open"} icon={groupe?.data?.dataGroupe?.protected ? <LockOutlined /> : <UnlockOutlined />} size="small" />
                                            </div>
                                        </div>
                                        <div className="groupe-available-space">
                                            <Button size="small" icon={<LoginOutlined />} onClick={() => !tchat?.data?.groupeSubscribed || !tchat?.data?.groupeSubscribed.includes(groupe?.data?.dataGroupe?.id) ? handleJoinGroup(groupe?.data?.dataGroupe, true) : handleLeftGroup(groupe?.data?.dataGroupe)}>{tchat?.data?.groupeSubscribed && tchat?.data?.groupeSubscribed.includes(groupe?.data?.dataGroupe?.id) ? 'Quitter' : 'Rejoindre'}</Button>
                                            <div><TeamOutlined />{' '}{groupe?.data?.dataGroupe?.currentParticipants}/{groupe?.data?.dataGroupe?.maxParticipants}</div>
                                        </div>
                                    </div>
                                </li>))}
                        </div>}
                </ul>
                <div className="credit">
                    <div className="credit__social">
                        <a href="https://www.linkedin.com/in/jonathan-domingues/" target="_blank" rel="noopener noreferrer">
                            <LinkedinFilled className="credit__linkedin" />
                        </a>
                        <a href="https://github.com/Jonathan64340" target="_blank" rel="noopener noreferrer">
                            <GithubFilled className="credit__github" />
                        </a>
                    </div>
                    <small className="credit__developer">Domingues Jonathan</small>
                    <small>{currentVersion}</small>
                </div>
            </div>

        </Layout.Sider>
    </Layout >)
}

const mapStateToProps = ({ user, tchat }) => ({ user, tchat })
const mapDispatchToProps = dispatch => ({ dispatch })

export default _.compose(connect(mapStateToProps, mapDispatchToProps), withRouter)(SiderComponent)