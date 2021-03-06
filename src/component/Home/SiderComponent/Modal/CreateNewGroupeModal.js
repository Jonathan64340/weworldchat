import React, { useState } from 'react';
import { Modal, Input, Form, Row, Col, Checkbox, Button } from 'antd';
import './modal.css';
import { UsergroupAddOutlined } from '@ant-design/icons';
import _ from 'underscore';
import { useForm } from 'antd/lib/form/Form';
import { getAvailableGroupName } from '../../../../endpoints';
import { connect } from 'react-redux';

const CreateNewGroupeModal = ({ visible, owner, ...props }) => {
    const [security, setSecurity] = useState(false);
    const [loading, setLoading] = useState(false);
    const [validFields, setValidFields] = useState(false);
    const [form] = useForm();
    const handleSubmit = async values => {
        if (!values) return;
        setLoading(true);

        const data = {
            dataGroupe: {
                name: values.name,
                maxParticipants: values.participants,
                protected: !!security,
                ...(!!security && { password: values.password }),
                currentParticipants: 0,
                owner: owner.id,
                ownerName: props?.user?.data?.name,
                participants: []
            }
        }
        window.socket.emit('send-user-add-groupe', data);
        setLoading(false)
        props.onChange({ visible: false, ...data, create: true })
        setValidFields(false)
        form.resetFields();
    }

    const handleChange = event => {
        const { target } = event;
        setSecurity(target.checked)
    }

    const handleCancel = () => {
        props.onChange({ visible: false, create: false })
        setValidFields(false)
        form.resetFields();
    }

    const validateGroupeName = _.debounce(() => {
        const name = form.getFieldValue('name');
        const participants = form.getFieldValue('participants');
        if (name.length >= 4 && name.length <= 20 && participants >= 0) {
            const group = {
                name
            }
            getAvailableGroupName(group).then((data) => {
                const { error_exception } = data;
                if (error_exception) {
                    setValidFields(false);
                    form.setFields([
                        {
                            name: 'name',
                            errors: [error_exception]
                        }
                    ])
                } else {
                    setValidFields(true)
                }
            }, (data) => {
                const { error_exception } = data;
                setValidFields(false);
                form.setFields([
                    {
                        name: 'name',
                        errors: [error_exception]
                    }
                ])
            })
        } else {
            setValidFields(false);
        }
    }, 500)

    const validateGroupeParticipants = _.debounce(() => {
        const name = form.getFieldValue('name');
        const participants = form.getFieldValue('participants');
        if (name.length >= 4 && name.length <= 20 && participants >= 0) {
            setValidFields(true)
        } else {
            setValidFields(false);
        }
    }, 500)

    return <Modal centered title={<>{<UsergroupAddOutlined />} Créer un nouveau groupe</>} footer={false} visible={visible} onCancel={() => handleCancel()}>
        <Form form={form} onFinish={handleSubmit} layout="vertical">
            <Row>
                <Col span={24}>
                    <Form.Item label="Nom du groupe" name="name" rules={[{ required: true, message: "Le nom n'est pas valide.", min: 4, max: 30 }]} initialValue=''>
                        <Input type="text" placeholder="Saisir un nom de groupe (4 caractères minimum et 30 caractères maximum)" onChange={validateGroupeName} />
                    </Form.Item>
                </Col>
                <Col span={24}>
                    <small>Renseignez le nombre de participants pouvant rejoindre le groupe. Min:3, max:50.</small>
                    <Form.Item label="Limite de participants" name="participants" initialValue={3} rules={[{ required: true, message: "Vous devez saisir un nombre compris entre 3 et 50 inclus." }]}>
                        <Input type="number" placeholder="Saisir le nombre de participants." onChange={validateGroupeParticipants} min={3} max={50} />
                    </Form.Item>
                </Col>
                <Col span={24} style={{ marginBottom: 24 }}>
                    <Checkbox onChange={handleChange}>Protéger le groupe par mot de passe</Checkbox>
                </Col>
                <Col span={24}>
                    {security && <Form.Item label="Mot de passe" name="password" rules={[{ required: true, message: 'Mot de passe non valide !' }]}>
                        <Input type="password" placeholder="Saisir un mot de passe" minLength={4} />
                    </Form.Item>}
                </Col>
            </Row>
            <Button htmlType="submit" loading={loading} disabled={!validFields} type="primary">Créer un groupe</Button>
        </Form>
    </Modal>
}

const mapStateToProps = ({ user }) => ({ user })

export default connect(mapStateToProps)(CreateNewGroupeModal);