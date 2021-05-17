import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import _ from 'underscore';
import { Form, Button, Input } from 'antd';
import { Helmet } from "react-helmet";
import Footer from '../../Footer'
import '../Login.css'
import { setLogin } from '../../../action/authentication/authentication_actions';
import { doRegister } from '../../../endpoints';
import { GithubPicker } from 'react-color'
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';

const Registered = ({ user, ...props }) => {
    const [socket, setSocket] = useState(null)
    const [isLoading, setIsLoading] = useState(false);
    const [form] = Form.useForm();
    const [defaultColor, setDefaultColor] = useState({
        r: '241',
        g: '112',
        b: '19',
        a: '1',
    })
    const [displayColor, setDisplayColor] = useState(false);

    useEffect(() => {
        setSocket(true);
        // eslint-disable-next-line
        typeof window.socket.id === 'undefined' && window.socket.connect()
    }, [])

    const onFinish = values => {
        setIsLoading(true)
        doRegister({
            pseudo: values.pseudo,
            password: values.password,
            email: values.email,
            defaultColor: defaultColor,
            socketId: window.socket.id,
            statusOnline: 'online',
            registerDate: new Date().getTime()
        })
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
                    setIsLoading(false)
                    props.dispatch(setLogin({ 
                        pseudo: values.pseudo,
                         statusOnline: 'online', 
                         id: window.socket.id,
                          defaultColor: `${defaultColor.r},${defaultColor.g},${defaultColor.b},${defaultColor.a}`,
                          email: values.email,
                          registerDate: new Date().getTime()
                         }))
                    window.socket.emit('users', {
                        pseudo: values.pseudo,
                        statusOnline: 'online',
                        id: window.socket.id
                    })

                    props.history.push('/global')
                }
            })
            .catch(err => { setIsLoading(false) })
    }

    const onChange = e => {
        setDisplayColor(false)
        setDefaultColor(e.rgb)
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
                    <Form.Item name="email" rules={[{ required: true, message: "L'adresse email n'est pas valide" }]} >
                        <Input prefix={<MailOutlined />} type="email" autoFocus placeholder="Entrez votre adresse email" allowClear={true} />
                    </Form.Item>
                    <Form.Item name="pseudo" rules={[{ required: true, message: "Le pseudo n'est pas valide" }]} >
                        <Input prefix={<UserOutlined />} type="text" autoFocus placeholder="Entrez votre pseudo" allowClear={true} />
                    </Form.Item>
                    <Form.Item name="password" rules={[{ required: true, message: "Le mot de passe n'est pas valide" }]} >
                        <Input prefix={<LockOutlined />} type="password" autoFocus placeholder="Entrez votre mot de passe" allowClear={true} />
                    </Form.Item>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 24 }}>
                        <span style={{ color: "#f2f2f2f2" }}>Votre couleur préférée : </span><div className="color-preview" onClick={() => setDisplayColor(true)} style={{ background: `rgba(${defaultColor.r},${defaultColor.g},${defaultColor.b})`, border: `3px solid rgba(${defaultColor.r / 2}, ${defaultColor.g / 2}, ${defaultColor.b / 2})` }} />
                    </div>
                    {displayColor && <Form.Item name="color">
                        <GithubPicker triangle="top-right" onChange={onChange} />
                    </Form.Item>}
                    <Button htmlType="submit" loading={isLoading} disabled={!socket} type="primary">Connexion</Button>
                    <div>
                        {/* eslint-disable-next-line */}
                        <span className="title-form"><small>Déjà membre ? <a href="" onClick={() => props.history.push('/login')}>Connexion</a></small></span>
                    </div>
                </Form>
            </div>
        </div>
        <Footer />
    </>)
}

const mapStateToProps = ({ user }) => ({ user });
const mapDispatchToProps = dispatch => ({ dispatch })

export default _.compose(connect(mapStateToProps, mapDispatchToProps), withRouter)(Registered);