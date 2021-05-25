import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'react-redux';
import './Tchat.css';
import MessageContent from '../MessageContent';
import { Input, Form, Row, Col, Button, Card, Upload, notification } from 'antd';
import { FileImageOutlined, MenuOutlined, SendOutlined } from '@ant-design/icons';
import _ from 'underscore'
import Dots from './Components/dots';
import { store } from '../../..';
import { withRouter } from 'react-router-dom';
import Emoji from './Components/Emoji/Emoji';
import { setOpenMenu, setEnterPrivateTchat, setQuitGroupDiscussion } from '../../../action/tchat/tchat_actions';
import imageCompression from 'browser-image-compression';

const Tchat = ({ user, tchat, viewTchat, isMobile, currentInterlocUser, ...props }) => {
    const [sendMessage, setSendMessage] = useState({})
    const [messageTyping, setMessageTyping] = useState(false)
    const [isTyping, setIsTyping] = useState(false)
    const [listen, setListen] = useState(false)
    const [form] = Form.useForm();
    const inputElement = useRef()
    const [openEmoji, setOpenEmoji] = useState(false);
    const [_uploadImage, setUploadImage] = useState(undefined);

    useEffect(() => {
        inputElement.current.focus()
    }, [props.privateId, currentInterlocUser])

    useEffect(() => {
        if (typeof _uploadImage !== 'undefined') {
            if (_uploadImage === 'upload') {
                notification.info({
                    message: 'Envoi en cours',
                    description:
                        `Votre image est en cours d'upload. Veuillez patienter.`,
                    duration: 5
                })
            } else {
                notification.success({
                    message: 'Envoi réussi',
                    description:
                        `Votre image a bien été uploadé.`,
                    duration: 5
                })
                setUploadImage(undefined)
            }
        }
    }, [_uploadImage])

    useEffect(() => {
        !listen && window.socket.on('receive-message', data => {
            setIsTyping(false);
        })

        window.socket.on('receive-message-typing', data => {
            setIsTyping(data)
        })

        setListen(true)
        //eslint-disable-next-line
    }, [user.data.id, tchat])

    const handleTyping = () => {
        if (!messageTyping) {
            const tmpValues = {
                ...((!props?.match?.url === "/group" || !props?.match?.url === "/global") && { usersContaints: `${props.privateId}:${user.data.id}` }),
                pseudo: user.data.name,
                sender: window.socket.id,
                timestamp: new Date().getTime(),
                destination: store.getState().tchat?.data?.userConversation,
                type: 'string'
            }
            setMessageTyping(true)
            window.socket.emit('message-typing', tmpValues)
        }
    }

    const handleSubmit = (values, imageBase64) => {
        setMessageTyping(false)
        const tmpValues = {
            ...((!props?.match?.url === "/group" || !props?.match?.url === "/global") && { usersContaints: `${props.privateId}:${user.data.id}` }),
            defaultColor: user.data.defaultColor,
            pseudo: user.data.name,
            sender: user.data.id,
            timestamp: new Date().getTime(),
            message: imageBase64 ? imageBase64 : values?.message,
            destination: props.privateId || 'all',
            socketId: props.socketId,
            type: imageBase64 ? 'image' : 'string'
        }
        setSendMessage(tmpValues)
        form.resetFields()
        inputElement.current.focus()
        setOpenEmoji(false)
        return window.socket.emit(props?.match?.url?.match('group') !== null ? props?.match?.params?.id : props.privateId ? 'send-message' : 'send-message-global', tmpValues);
    }

    const addEmojiOnField = emoji => {
        let prev = form.getFieldValue('message') || '';
        form.setFieldsValue({ message: prev += emoji })
    }

    const handleExit = () => {
        if (props.history.location.pathname.match('group') !== null) {
            let prevGroupSubscribed = tchat?.data?.groupeSubscribed;
            props.dispatch(setQuitGroupDiscussion({ currentGroupDiscussion: undefined, groupeSubscribed: prevGroupSubscribed }))
            props.history.push('/global');
            window.socket.off(props.match.params.id);
        } else {
            props.dispatch(setEnterPrivateTchat({ ...tchat, userConversation: undefined }));
            props.history.push('/global');
        }
    }

    const openDrawer = () => {
        props.dispatch(setOpenMenu({ menuOpened: true }))
    }

    let sizeOfImage = 99999999999999;

    const uploadImage = async data => {
        if (data.type === 'image/png' || data.type === 'image/jpeg' || data.type === 'image/webp' || data.type === 'image/gif') {
            const reader = new FileReader();
            reader.onloadend = () => {
                handleSubmit(null, reader.result)
                setOpenEmoji(false)
                return Upload.LIST_IGNORE;
            }
            await imageCompression(data, { maxSizeMB: 1, useWebWorker: true }).then(res => {
                if ((res.size / 1024).toFixed(0) === sizeOfImage && sizeOfImage > 400) {
                    return notification.error({
                        description: `L'image (${res.name}) est trop grande (${(res.size / 1024).toFixed(0)} Kb).`,
                        duration: 5
                    })
                }
                if (sizeOfImage >= 400) {
                    setUploadImage('upload')
                    uploadImage(res);
                } else {
                    setUploadImage('done')
                    reader.readAsDataURL(res)
                }
                sizeOfImage = (res.size / 1024).toFixed(0);
            })
        }
        return Upload.LIST_IGNORE;
    }

    return <>
        {props.privateId ? <div className="container-header-tchat">
            <Card title={<div className="flex-content">{isMobile && <div className="btn-drawer"><MenuOutlined onClick={() => openDrawer()} /></div>}<div><span>{typeof tchat?.data?.currentGroupDiscussion !== 'undefined' ? `Discussion groupé : ${tchat?.data?.currentGroupDiscussion?.name}` : ''}{currentInterlocUser}</span><br /><div style={{ ...(!isTyping ? { visibility: 'hidden' } : { visibility: 'visible' }) }}><small style={{ display: 'flex' }}>En train d'écrire un message <Dots /></small></div></div></div>} id="card-tchat-content" className="card-container-header-tchat" extra={<Button type="primary" danger onClick={() => handleExit()}>{typeof tchat?.data?.currentGroupDiscussion !== 'undefined' ? 'Fermer' : 'Fermer'}</Button>} >
                <MessageContent sendMessage={sendMessage} usersMatch={`${props.privateId}:${user.data.id}`} myRefs={ref => console.log(ref)} viewTchat={e => viewTchat(e)} />
                <div>
                    <Form form={form} name="form" onFinish={handleSubmit}>
                        <Row gutter={4} style={{ display: 'flex', margin: 0 }}>
                            <Emoji onEmojiChoose={({ emoji }) => addEmojiOnField(emoji)} setOpen={setOpenEmoji} open={openEmoji} />
                            <Upload className="upload-image" beforeUpload={uploadImage} accept="image/png, image/jpeg, image/webp">
                                <Button icon={<FileImageOutlined />} title="Envoyer une image"></Button>
                            </Upload>
                            <Col className="form-col">
                                <Form.Item name="message" rules={[{ required: true, message: 'Le message ne peux pas être vide' }]}>
                                    <Input type="text" ref={inputElement} placeholder="Ecrire un message ..." onChange={handleTyping} onClick={() => setOpenEmoji(false)} />
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
                <Card title={<div className="flex-content">{isMobile && <div className="btn-drawer"><MenuOutlined onClick={() => openDrawer()} /></div>}<div><span>Vous discutez avec tout le monde</span><br /><div><small style={{ display: 'flex' }}>N'oubliez pas que vous êtes sur un channel général, restez courtois ! 😀</small></div></div></div>} id="card-tchat-content-global" className="card-container-header-tchat">
                    <MessageContent sendMessage={sendMessage} myRefs={ref => console.log(ref)} viewTchat={e => viewTchat(e)} />
                    <div>
                        <Form form={form} name="form" onFinish={handleSubmit}>
                            <Row gutter={4} style={{ display: 'flex', margin: 0 }}>
                                <Emoji onEmojiChoose={({ emoji }) => addEmojiOnField(emoji)} setOpen={setOpenEmoji} open={openEmoji} />
                                <Upload className="upload-image" beforeUpload={uploadImage} accept="image/png, image/jpeg, image/webp">
                                    <Button icon={<FileImageOutlined />} title="Envoyer une image"></Button>
                                </Upload>
                                <Col className="form-col">
                                    <Form.Item name="message" rules={[{ required: true, message: 'Le message ne peux pas être vide' }]} >
                                        <Input type="text" ref={inputElement} placeholder="Ecrire un message ..." onClick={() => setOpenEmoji(false)} />
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