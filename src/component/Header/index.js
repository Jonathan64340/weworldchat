import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Menu, Layout, Avatar, Dropdown, Button, Modal, Switch } from 'antd';
import { Link } from 'react-router-dom';
import { withRouter } from 'react-router-dom'
import _ from 'underscore'
import './Header.css';
import { SettingFilled } from '@ant-design/icons';
import { setEnterPrivateTchat } from '../../action/tchat/tchat_actions';
import { store } from '../../index';
import { onStopConnectionRematch } from '../../utils/manager';
import { setLogout, setUserUpdate } from '../../action/authentication/authentication_actions';

const { Header } = Layout;


const HeaderLayout = ({ user, ...props }) => {
    const [visible, setVisible] = useState(false)
    const [status, setStatus] = useState(user.data?.statusOnline)
    
    const handleLogout = () => {
        window.socket.emit('user-disconnect')
        props.dispatch(setLogout())
        props.dispatch(setEnterPrivateTchat({ userConversation: undefined }))
        window.socket.close()
        onStopConnectionRematch()
        // Supprimer tout les écouteurs à la déconnection
        window.socket.off('receive-message')
        window.socket.off('users-online')
        window.socket.off('users-status')
        window.socket.off('receive-message-typing')
        window.socket.off('receive-message-global')
        props.history.push('/login')
    }

    useEffect(() => {
        const backdrop = document.getElementsByClassName('global-layout');
        if (visible) {
            if (backdrop[0]) {
                backdrop[0].classList.add('blur')
            }
        } else {
            if (backdrop[0]) {
                backdrop[0].classList.remove('blur')
            }
        }
    }, [visible])

    useEffect(() => {
        setStatus(prev => !prev)
    }, [user])

    const menu = (
        <Menu className="dropdown-menu-title">
            <div className="option"><span>{user?.data?.name}</span>
                <Button size="small" onClick={() => setVisible(true)}><SettingFilled /></Button>
            </div>
            <Menu.Item>
                <Button onClick={handleLogout}>Se déconnecter</Button>
            </Menu.Item>
        </Menu>
    );

    const handleChangeStatus = () => {
        const statusOnline = store.getState().user?.data?.statusOnline === "online" ? "busy" : "online"
        props.dispatch(setUserUpdate({ statusOnline }))
        window.socket.emit('user-change-status', { id: window.socket.id, statusOnline })
    }

    return (<>
        <Modal
            visible={visible}
            onCancel={() => setVisible(false)}
            footer={false}
            className="modal__settings"
            mask={false}
            title="Paramètre"
        >
            <p>Vous pouvez à partir de ce menu modifier l'état de votre statut en ligne.</p>
            {status && <small style={{ color: "red" }}>En ayant le statut "Occupé" vous ne recevrez plus les notifications à l'affichage n'y les notifications sonores.</small>}
            <fieldset>
                <legend>
                    Statut
                </legend>
                <Switch checkedChildren="En ligne" onChange={handleChangeStatus} unCheckedChildren="Occupé" defaultChecked={store.getState().user?.data?.statusOnline === "online" ? true : false} />
            </fieldset>
        </Modal>
        <Header className="nav-bar-header">
            <Link to="#/"><img src={`${process.env.PUBLIC_URL}/home-logo.png`} alt="logo" style={{ width: 45, position: 'absolute', top: '11px' }} /></Link>
            {user?.data?.isLogged && <div className="user-action">
                <Dropdown overlay={menu} arrow trigger={['click']}>
                    <Avatar size="large" className="avatar-icon">
                        {user?.data?.name?.length > 1 ? user.data.name.substring(0, user.data.name.length - (user.data.name.length - 1)) : user.data.name}
                    </Avatar>
                </Dropdown>
            </div>}
        </Header>
    </>)
}

const mapStateToProps = ({ user }) => ({ user })
const mapDispatchToProps = dispatch => ({ dispatch })

export default _.compose(connect(mapStateToProps, mapDispatchToProps), withRouter)(HeaderLayout);