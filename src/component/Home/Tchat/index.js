import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { getPrivateTchat } from '../../../endpoints';
import './Tchat.css';
import MessageContent from '../MessageContent';
import { Input, Form, Row, Col, Button } from 'antd';
import { UserOutlined, SendOutlined } from '@ant-design/icons';
import _ from 'underscore'
import Dots from './Components/dots';
import { store } from '../../..';
import { withRouter } from 'react-router-dom';

const Tchat = ({ user, tchat, ...props }) => {
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
                pseudo: user.data.name,
                sender: user.data.id,
                timestamp: new Date().getTime(),
                message: values.message,
                destination: props.privateId,
                type: 'string'
            }
        }
        setSendMessage(tmpValues)
        form.resetFields()
        return window.socket.emit('send-message', tmpValues);
    }

    return <>
        {props.privateId && <div className="title-user-private-tchat">
            <div className="container-header-tchat">
                <div><p><UserOutlined />{' '}{_user?.user?.data?.pseudo}</p>{isTyping && <Dots />}</div>
            </div>
            <MessageContent sendMessage={sendMessage} usersMatch={`${props.privateId}:${user.data.id}`} myRefs={ref => console.log(ref)} />
            <div>
                <Form form={form} name="form" onFinish={handleSubmit}>
                    <Row gutter={4} style={{ display: 'flex', margin: 0, padding: "0 20px" }}>
                        <Col className="form-col">
                            <Form.Item name="message" rules={[{ required: true, message: 'Le message ne peux pas être vide' }]}>
                                <Input type="text" autoFocus placeholder="Ecrire un message ..." onChange={handleTyping} />
                            </Form.Item>
                        </Col>
                        <Button htmlType="submit" icon={<SendOutlined />} />
                    </Row>
                </Form>
            </div>
        </div>}
    </>
}

const mapStateToProps = ({ user, tchat }) => ({ user, tchat });
const mapDispatchToProps = dispatch => ({ dispatch })

export default _.compose(connect(mapStateToProps, mapDispatchToProps), withRouter)(Tchat)