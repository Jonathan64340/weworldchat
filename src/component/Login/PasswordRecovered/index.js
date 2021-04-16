import React, { useState } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import _ from 'underscore';
import { Form, Button, Input } from 'antd';
import { Helmet } from "react-helmet";
import Footer from '../../Footer'
import { UserOutlined } from '@ant-design/icons';

const PasswordRecovered = ({ user, ...props }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [form] = Form.useForm();

    const onFinish = values => {
        setIsLoading(true)
    }

    return (<>
        <Helmet>
            <meta charSet="utf-8" />
            <title>Mot de pass oublié</title>
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
                        <Input prefix={<UserOutlined />} type="text" autoFocus placeholder="Entrez votre email" allowClear={true} />
                    </Form.Item>
                    <Button htmlType="submit" loading={isLoading} type="primary">Réinitialiser</Button>
                    <div>
                        <span className="title-form"><small>Déjà membre ? <a href="" onClick={() => props.history.push('/login')}>Connexion</a></small></span>
                    </div>
                    <div>
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

export default _.compose(connect(mapStateToProps, mapDispatchToProps), withRouter)(PasswordRecovered);