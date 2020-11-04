import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import _ from 'underscore';
import { Form, Button, Input } from 'antd';
import { Helmet } from "react-helmet";
import Footer from '../Footer'
import './Login.css'
import { setLogin } from '../../action/authentication/authentication_actions';
import { doLogin } from '../../endpoints';

const Login = ({ user, ...props }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        window.socket.open()
    }, [])

    const onFinish = values => {
        setIsLoading(true)
        doLogin({ pseudo: values.pseudo })
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
                    props.dispatch(setLogin({ pseudo: values.pseudo, statusOnline: 'online', id: window.socket.id }))
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

    return (<>
        <Helmet>
            <meta charSet="utf-8" />
            <title>Connexion</title>
        </Helmet>
        <div className="layout-login">
            <div className="layout-content">
                <div class="picture-form">
                    <img src={`${process.env.PUBLIC_URL}/home-logo.png`} alt=""/>
                </div>
                <Form className="layout-login-form" onFinish={onFinish} form={form} style={{ display: 'flex' }}>
                    <Form.Item name="pseudo" rules={[{ required: true, message: "Le pseudo n'est pas valide" }]} >
                        <Input type="text" autoFocus placeholder="Entrez un pseudo" allowClear={true} />
                    </Form.Item>
                    <Button htmlType="submit" loading={isLoading} type="primary">Connexion</Button>
                </Form>
            </div>
        </div>

        <Footer />
    </>)
}

const mapStateToProps = ({ user }) => ({ user });
const mapDispatchToProps = dispatch => ({ dispatch })

export default _.compose(connect(mapStateToProps, mapDispatchToProps), withRouter)(Login);