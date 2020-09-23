import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux'
import { Layout, Button, Tooltip, notification, Input, Modal } from 'antd'
import _ from 'underscore'
import './SiderComponent.css'
import { getCountUsersConnected } from '../../../endpoints';
import { MessageOutlined, WechatOutlined, PhoneOutlined, PlayCircleFilled } from '@ant-design/icons';
import { setEnterPrivateTchat } from '../../../action/tchat/tchat_actions';
import { store } from '../../../index'

const SiderComponent = ({ user, tchat, ...props }) => {
    const [onlineUsers, setOnlineUsers] = useState(0)
    const [users, setUsers] = useState([{}])
    const [filterUser, setFilterUser] = useState([])
    const [listen, setListen] = useState(false)
    const [visible, setVisible] = useState(false)
    const [userCaller, setUserCaller] = useState('')
    const [mobileMenu, setMobileMenu] = useState(false)
    let src = `${process.env.PUBLIC_URL}/sound/notif.mp3`
    let audio = new Audio(src);

    const goToPrivate = (id) => {
        props.dispatch(setEnterPrivateTchat({ userConversation: id }))
        document.title = `tchatez - ${user.data?.name}`
        props.history.push(`/conversation/${id}`)
    }

    useEffect(() => {
        getCountUsersConnected().then(data => {
            data.countUsersConnected && setOnlineUsers(data.countUsersConnected);
            data.users && setUsers(data.users)
        })

        window.socket.on('users-status', data => {
            setUsers(data)
            setFilterUser(data)
        })
    }, [])

    useEffect(() => {
        !listen && window.socket.on('receive-message', data => {
            const { tchat, user } = store.getState()
            if (data.data?.type === 'videoCallRequest') { setVisible(true); setUserCaller(data.data.pseudo) }
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
            data.usersCount && setOnlineUsers(data.usersCount)
            if (data.users) {
                setUsers(data.users)
            }
        })

        setListen(true)
        // eslint-disable-next-line
    }, [tchat, listen, filterUser])

    const handleSearch = value => {
        let __users = [];

        users.forEach((el, index) => {
            if (el.data?.pseudo.match(`${value}`) !== null) {
                if (users.find(u => u.data.pseudo === el.data?.pseudo.match(`${value}`)['input'])) {
                    __users.push(el)
                }
            }

            if (users.length === index + 1) {
                setFilterUser(__users)
            }

            if (!value.length) setFilterUser([])
        })
    }

    const toggleMobileMenu = () => {
        setMobileMenu(!mobileMenu)
        const btnMobile = document.getElementById('button-mobile')
        const iconBtnMobile = document.getElementsByClassName('button-opened-menu')
        btnMobile.style.marginLeft = mobileMenu ? "-175px" : 0
        iconBtnMobile[0].style.transform = !mobileMenu ? "rotate(180deg)" : "rotate(0deg)"
    }

    return (<Layout>
        <Modal visible={visible} footer={false} centered closable={false}>
            <div className="incoming-call">
                <div className="incoming-call-name">
                    Appel entrant de {userCaller}
                </div>
                <div className="buttons-call">
                    <div className="on"><PhoneOutlined /></div>
                    <div className="off"><PhoneOutlined /></div>
                </div>
            </div>
        </Modal>
        <Layout.Sider className="sider-users-connected" id="button-mobile">
            <PlayCircleFilled className="button-opened-menu" onClick={() => toggleMobileMenu()} />
            <div style={{ borderBottom: "1px solid #f0f2f585", paddingBottom: 8 }}>Connectés : {onlineUsers <= 0 ? 0 : onlineUsers - 1}</div>
            <div className="flex-container">
                <ul className="list-users-connected">
                    <Input.Search placeholder="Rechercher un utilisateur"
                        className="search-users"
                        onSearch={handleSearch}
                    ></Input.Search>
                    <div className="item__user">
                        {typeof users !== 'undefined' && (filterUser.length > 0 ? filterUser : users).map((el, index) => (
                            <>{
                                el.id !== user.data?.id && (
                                    <li key={index} className={`item-user ${el.id === tchat.data?.userConversation ? 'selected' : ''}`}>
                                        <Tooltip title={`${el.data?.pseudo} - ${el.data?.statusOnline === 'busy' ? 'occupé' : 'en ligne'}`} placement={el.data?.pseudo.length < 8 ? 'topRight' : 'top'}>
                                            <div className="info-user">
                                                <div className={`status__online__${el.data?.statusOnline === 'online' ? 'online' : 'busy'}`} />
                                            &nbsp;
                                            {el.data?.pseudo.length >= 15 ? `${el.data?.pseudo.substring(0, 15)}...` : el.data?.pseudo}
                                            </div>
                                        </Tooltip>
                                        {el.id !== user.data?.id && <Button size="small" disabled={el.id === tchat.data?.userConversation} onClick={() => goToPrivate(el.id)}><MessageOutlined /></Button>}
                                    </li>
                                )
                            }</>
                        ))}
                    </div>
                </ul>
                <div className="credit">
                    <span>Développé avec </span><br /><b style={{
                        color: "red",
                        fontSize: 18
                    }} className="hearth-icon-animate">♥</b><span> par Domingues Jonathan</span>
                </div>
            </div>

        </Layout.Sider>
    </Layout>)
}

const mapStateToProps = ({ user, tchat }) => ({ user, tchat })
const mapDispatchToProps = dispatch => ({ dispatch })

export default _.compose(connect(mapStateToProps, mapDispatchToProps), withRouter)(SiderComponent)