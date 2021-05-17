import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import _ from 'underscore';
import { Form, Button, Input } from 'antd';
import { Helmet } from "react-helmet";
import Footer from '../Footer'
import './Login.css'
import { setLogin } from '../../action/authentication/authentication_actions';
import { doLogin, getSubscribedGroups, updateGroupSid } from '../../endpoints';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { setEnterGroupDiscussion } from '../../action/tchat/tchat_actions';

const Login = ({ user, ...props }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [socket, setSocket] = useState(null)
    const [form] = Form.useForm();

    useEffect(() => {
        setSocket(true);
        // eslint-disable-next-line
        typeof window.socket.id === 'undefined' && window.socket.connect()
    }, [window.socket.id])

    const onFinish = values => {
        setIsLoading(true);
        doLogin({ pseudo: values.pseudo, password: values.password, socketId: window.socket.id })
            .then((data) => {
                const { error_exception } = data;
                if (error_exception) {
                    setIsLoading(false);
                    form.setFields([
                        {
                            name: 'pseudo',
                            errors: [error_exception]
                        }
                    ])
                }
                if (!error_exception && !user?.data?.id) {
                    getSubscribedGroups({ _id: data?._id }).then(async subs => {
                        await props.dispatch(setEnterGroupDiscussion({ currentGroupDiscussion: null, groupeSubscribed: subs }))
                        await updateGroupSid({ sid: window.socket.id, _id: data?._id })
                        await props.dispatch(setLogin({
                            pseudo: values.pseudo,
                            statusOnline: data?.statusOnline,
                            id: data?._id,
                            socketId: window.socket.id,
                            defaultColor: `${data?.defaultColor?.r},${data?.defaultColor?.g},${data?.defaultColor.b},${data?.defaultColor?.a}`,
                            email: data?.email,
                            registerDate: data?.registerDate
                        }));
                        await window.socket.emit('users', {
                            pseudo: values.pseudo,
                            statusOnline: data?.statusOnline,
                            id: data?._id,
                            socketId: window.socket.id,
                        });
                        setIsLoading(false);
                        await props.history.push('/global')
                    })
                }
            })
            .catch(err => { setIsLoading(false) })
    }

    return (<>
        <Helmet>
            <meta charSet="utf-8" />
            <title>Connexion</title>
        </Helmet>
        <div className="layout-login">
            <div className="layout-content">
                <div className="picture-form">
                    <img src={`${process.env.PUBLIC_URL}/home-logo.png`} alt="" />
                </div>
                <span className="title-form">WE WORLD TCHAT</span>
                <small className="title-form">Discutez avec vos amis, et le monde</small>
                <Form className="layout-login-form" onFinish={onFinish} form={form} style={{ display: 'flex' }}>
                    <Form.Item name="pseudo" rules={[{ required: true, message: "Le pseudo n'est pas valide" }]} >
                        <Input prefix={<UserOutlined />} type="text" autoFocus placeholder="Entrez votre pseudo" allowClear={true} />
                    </Form.Item>
                    <Form.Item name="password" rules={[{ required: true, message: "Le mot de passe n'est pas valide" }]} >
                        <Input prefix={<LockOutlined />} type="password" autoFocus placeholder="Entrez votre mot de passe" allowClear={true} />
                    </Form.Item>
                    <Button htmlType="submit" disabled={!socket} loading={isLoading} type="primary">Connexion</Button>
                    <div>
                        {/* eslint-disable-next-line */}
                        <span className="title-form"><small>Problème de connexion ? <a href="" onClick={() => props.history.push('/recovered')}>Réinitialiser mot de passe</a></small></span>
                    </div>
                    <div>
                        {/* eslint-disable-next-line */}
                        <span className="title-form"><small>Pas encore membre ? <a href="" onClick={() => props.history.push('/register')}>Créer mon compte</a></small></span>
                    </div>
                </Form>
            </div>
        </div>
        <Footer />
    </>)
}

const mapStateToProps = ({ user }) => ({ user });
const mapDispatchToProps = dispatch => ({ dispatch })

export default _.compose(connect(mapStateToProps, mapDispatchToProps), withRouter)(Login);