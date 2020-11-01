import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Button, Input, Layout } from 'antd';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { setLogin } from '../../action/authentication/authentication_actions';
import _ from 'underscore';
import { doLogin } from '../../endpoints';
import { Helmet } from "react-helmet";
import Footer from '../Footer'
import { LoadingOutlined } from '@ant-design/icons';
import './Login.css'

const Login = ({ user, ...props }) => {
    const [form] = Form.useForm();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        window.socket.open()
    }, [])

    const handleCheck = () => {
        form.validateFields()
            .then(values => {
                setIsLoading(true);
                onFinish(values)
            })
            .catch(err => setIsLoading(false))
    }

    const onFinish = values => {
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
        <Layout className="layout-login">
            <div className="logo">
                <img src={`${process.env.PUBLIC_URL}/logo.png`} alt="logo" />
            </div>
            <Form form={form} name="control-hooks" className="layout-login-form">
                <Row gutter={16} justify="center" className="layout-login-form-row">
                    <Col span={8} sm={10} xs={15} lg={8} flex="center">
                        <Form.Item name="pseudo" rules={[{ required: true, message: "Le pseudo n'est pas valide" }]} >
                            <Input type="text" autoFocus placeholder="Entrez un pseudo" allowClear={true} />
                        </Form.Item>
                    </Col>
                </Row>
                <Button disabled={isLoading} className="layout-login-button" type="primary" onClick={handleCheck}>{isLoading ? <LoadingOutlined /> : "Se connecter"}</Button>
            </Form>
            <Footer />
        </Layout>
    </>)
}

const mapStateToProps = ({ user }) => ({ user });
const mapDispatchToProps = dispatch => ({ dispatch })

export default _.compose(connect(mapStateToProps, mapDispatchToProps), withRouter)(Login);