import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { getPrivateTchat } from '../../../endpoints';
import './Tchat.css';
import MessageContent from '../MessageContent';
import { Input, Form, Row, Col, Button, Card } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import _ from 'underscore'
import Dots from './Components/dots';
import { store } from '../../..';
import { withRouter } from 'react-router-dom';
import Emoji from './Components/Emoji/Emoji';
import { setOpenMenu, setEnterPrivateTchat, setQuitGroupDiscussion } from '../../../action/tchat/tchat_actions';

const Tchat = ({ user, tchat, viewTchat, ...props }) => {
    const [_user, setUser] = useState({})
    const [sendMessage, setSendMessage] = useState({})
    const [messageTyping, setMessageTyping] = useState(false)
    const [isTyping, setIsTyping] = useState(false)
    const [listen, setListen] = useState(false)
    const [form] = Form.useForm();

    useEffect(() => {
        if (typeof props.privateId !== 'undefined') {
            getPrivateTchat({ userOneId: props.privateId, userTwoId: user.data.id })
                .then(data => {
                    setUser(data);
                })
                .catch(err => console.log(err))
        }
    }, [props.privateId, user.data.id])

    useEffect(() => {
        !listen && window.socket.on('receive-message', data => {
            const { tchat } = store.getState()
            if (data.usersContaints.split(':')[0] === window.socket.id || data.usersContaints.split(':')[1] === window.socket.id) {
                if (tchat.data?.userConversation === data.data.sender) {
                    setIsTyping(false);
                }
            }
        })

        window.socket.on('receive-message-typing', data => {
            const { tchat } = store.getState()
            if (data.usersContaints.split(':')[0] === window.socket.id || data.usersContaints.split(':')[1] === window.socket.id) {
                if (tchat.data?.userConversation === data.data.sender) {
                    setIsTyping(data)
                }
            }
        })

        setListen(true)
        //eslint-disable-next-line
    }, [user.data.id, tchat])

    const handleTyping = () => {
        if (!messageTyping) {
            const tmpValues = {
                usersContaints: `${props.privateId}:${user.data.id}`,
                data: {
                    pseudo: user.data.name,
                    sender: window.socket.id,
                    timestamp: new Date().getTime(),
                    destination: store.getState().tchat?.data?.userConversation,
                    type: 'string'
                }
            }
            setMessageTyping(true)
            window.socket.emit('message-typing', tmpValues)
        }
    }

    const handleSubmit = values => {
        setMessageTyping(false)
        const tmpValues = {
            usersContaints: `${props.privateId}:${user.data.id}`,
            data: {
                defaultColor: user.data.defaultColor,
                pseudo: user.data.name,
                sender: user.data.id,
                timestamp: new Date().getTime(),
                message: values.message,
                destination: props.privateId || 'all',
                type: 'string'
            }
        }
        setSendMessage(tmpValues)
        form.resetFields()
        return window.socket.emit(props?.match?.params?.groupId ? props?.match?.params?.groupId : props.privateId ? 'send-message' : 'send-message-global', tmpValues);
    }

    const addEmojiOnField = emoji => {
        let prev = form.getFieldValue('message') || '';
        form.setFieldsValue({ message: prev += emoji })
    }

    const toggleMobileMenu = () => {
        props.dispatch(setOpenMenu({ menuOpened: false }))
        const btnMobile = document.getElementById('button-mobile')
        const iconBtnMobile = document.getElementsByClassName('button-opened-menu')
        btnMobile.style.marginLeft = "-165px"
        iconBtnMobile[0].style.transform = "rotate(0deg)"
    }

    const handleExit = () => {
        if (props.history.location.pathname.match('group') !== null) {
            let prevGroupSubscribed = tchat?.data?.groupeSubscribed;
            props.dispatch(setQuitGroupDiscussion({ currentGroupDiscussion: undefined, groupeSubscribed: prevGroupSubscribed }))
            props.history.push('/global');
        } else {
            props.dispatch(setEnterPrivateTchat({ ...tchat, userConversation: undefined }));
            props.history.push('/global');
        }
    }

    return <>
        {props.privateId ? <div className="container-header-tchat">
            <Card title={<><span>{typeof tchat?.data?.currentGroupDiscussion !== 'undefined' ? `Discussion groupé : ${tchat?.data?.currentGroupDiscussion?.name}` : 'Vous disctuez avec '} {_user?.user?.data?.pseudo}</span><br /><div style={{ ...(!isTyping ? { visibility: 'hidden' } : { visibility: 'visible' }) }}><small style={{ display: 'flex' }}>En train d'écrire un message <Dots /></small></div></>} id="card-tchat-content" className="card-container-header-tchat" extra={<Button type="primary" danger onClick={() => handleExit()}>{typeof tchat?.data?.currentGroupDiscussion !== 'undefined' ? 'Quitter le groupe' : 'Fermer la conversation'}</Button>} >
                <MessageContent sendMessage={sendMessage} usersMatch={`${props.privateId}:${user.data.id}`} myRefs={ref => console.log(ref)} viewTchat={e => viewTchat(e)} />
                <div>
                    <Form form={form} name="form" onFinish={handleSubmit}>
                        <Row gutter={4} style={{ display: 'flex', margin: 0 }}>
                            <Emoji onEmojiChoose={({ emoji }) => addEmojiOnField(emoji)} />
                            <Col className="form-col">
                                <Form.Item name="message" rules={[{ required: true, message: 'Le message ne peux pas être vide' }]}>
                                    <Input type="text" autoFocus placeholder="Ecrire un message ..." onChange={handleTyping} onClick={() => toggleMobileMenu()} />
                                </Form.Item>
                            </Col>
                            <Button htmlType="submit" type="primary" icon={<SendOutlined />} />
                        </Row>
                    </Form>
                </div>
            </Card>
        </div> :
            <div className="container-header-tchat">
                {/* eslint-disable-next-line */}
                <Card title={<><span>Vous discutez avec tout le monde</span><br /><div><small style={{ display: 'flex' }}>N'oubliez pas que vous êtes sur un channel général, restez courtois ! 😀</small></div></>} id="card-tchat-content-global" className="card-container-header-tchat">
                    <MessageContent sendMessage={sendMessage} myRefs={ref => console.log(ref)} viewTchat={e => viewTchat(e)} />
                    <div>
                        <Form form={form} name="form" onFinish={handleSubmit}>
                            <Row gutter={4} style={{ display: 'flex', margin: 0 }}>
                                <Emoji onEmojiChoose={({ emoji }) => addEmojiOnField(emoji)} />
                                <Col className="form-col">
                                    <Form.Item name="message" rules={[{ required: true, message: 'Le message ne peux pas être vide' }]}>
                                        <Input type="text" autoFocus placeholder="Ecrire un message ..." onClick={() => toggleMobileMenu()} />
                                    </Form.Item>
                                </Col>
                                <Button htmlType="submit" type="primary" icon={<SendOutlined />} />
                            </Row>
                        </Form>
                    </div>
                </Card>
            </div>
        }
    </>
}

const mapStateToProps = ({ user, tchat }) => ({ user, tchat });
const mapDispatchToProps = dispatch => ({ dispatch })

export default _.compose(connect(mapStateToProps, mapDispatchToProps), withRouter)(Tchat)