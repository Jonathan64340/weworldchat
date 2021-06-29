import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import _ from 'underscore';
import { Form, Button, Input, notification } from 'antd';
import { Helmet } from "react-helmet";
import Footer from '../../Footer'
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { requestResetPassword, resetPassword } from '../../../endpoints';

const PasswordRecovered = ({ user, ...props }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [form] = Form.useForm();
    const [token, setToken] = useState(null);

    useEffect(() => {
        if (props.location.search.split('?token=')) {
            return setToken(props.location.search.split('?token=')[1])
        }
    }, [props.location.search])

    const onFinish = values => {
        setIsLoading(true)

        if (token) {
            return resetPassword({ ...values, token })
                .then((e) => {
                    if (e === 'error') {
                        notification.error({
                            message: 'Ooops ! Une erreur s\'est produite lors de la mise à jour de votre mot de passe.',
                            duration: 3000
                        })
                        return setIsLoading(false)
                    }
                    notification.success({
                        message: 'Félicitation ! Votre mot de passe à bien été mis à jour',
                        onClose: () => props.history.push('/login'),
                        duration: 3000
                    })
                    setIsLoading(false)
                })
                .catch(() => {
                    notification.error({
                        message: 'Ooops ! Une erreur s\'est produite lors de la mise à jour de votre mot de passe.',
                        duration: 3000
                    })
                    setIsLoading(false)
                })
        }

        return requestResetPassword(values)
            .then((e) => {
                if (e === 'error') {
                    notification.error({
                        message: 'Ooops ! Il semblerait que cet email n\'est pas enregistré sur le chat...',
                        duration: 3000
                    })
                    return setIsLoading(false);
                }
                notification.success({
                    message: 'Félicitation ! Votre lien de réinitialisation arrive sur votre boîte mail !',
                    duration: 3000
                })
                setIsLoading(false);
            })
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
                    {props.location.search.substring(1, 6) === 'token' ? <Form.Item name="password" rules={[{ required: true, message: 'Veuillez saisir un mot de passe' }]}>
                        <Input type="password" prefix={<LockOutlined />} autoFocus placeholder="Saisissez votre nouveau mot de passe" allowClear={true} />
                    </Form.Item> : <Form.Item name="email" rules={[{ required: true, message: "Le pseudo n'est pas valide" }]} >
                        <Input prefix={<UserOutlined />} type="text" autoFocus placeholder="Entrez votre email" allowClear={true} />
                    </Form.Item>}
                    <Button htmlType="submit" loading={isLoading} type="primary">Réinitialiser</Button>
                    <div>
                        {/* eslint-disable-next-line */}
                        <span className="title-form"><small>Déjà membre ? <a href="" onClick={() => props.history.push('/login')}>Connexion</a></small></span>
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

export default _.compose(connect(mapStateToProps, mapDispatchToProps), withRouter)(PasswordRecovered);