import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Button, Switch, Avatar, Upload, notification } from 'antd';
import _ from 'underscore';
import { withRouter } from 'react-router-dom';
import './profile.css';
import { deleteAccount } from '../../endpoints';
import swal from 'sweetalert';
import { setLogout, setUserUpdate } from '../../action/authentication/authentication_actions';
import { store } from '../../index';
import imageCompression from 'browser-image-compression';

const Profile = ({ user, ...props }) => {
    const [_uploadImage, setUploadImage] = useState(undefined);
    let sizeOfImage = 99999999999999;

    const handleDeleteAccount = () => {
        swal({
            title: 'Attention',
            text: 'Cette action est irréversible, souhaitez-vous vraiment continuer ?',
            icon: 'info',
            closeOnClickOutside: false,
            buttons: {
                cancel: {
                    text: "Annuler",
                    value: null,
                    visible: true,
                    className: "",
                    closeModal: true,
                },
                confirm: {
                    text: "Confirmer",
                    value: true,
                    visible: true,
                    className: "",
                    closeModal: true
                }
            }
        }).then(async confirm => {
            if (confirm) {
                await window.socket.emit('user-disconnect')
                await window.socket.disconnect()
                await props.dispatch(setLogout());
                await deleteAccount({ id: user?.data?.id });
                await props.history.push('/login', { remerciement: true });
            }
        })
    }

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

    const handleSubmit = (values, imageBase64) => {
        props.dispatch(setUserUpdate({ id: user?.data?.id, avatar: imageBase64 }));
        window.socket.emit('user-change-profile', { id: user?.data?.id, avatar: imageBase64 })
    }

    const handleChangeStatus = () => {
        const statusOnline = store.getState().user?.data?.statusOnline === "online" ? "busy" : "online"
        props.dispatch(setUserUpdate({ statusOnline }))
        window.socket.emit('user-change-status', { id: window.socket.id, statusOnline })
    }

    const uploadImage = async data => {
        if (data.type === 'image/png' || data.type === 'image/jpeg' || data.type === 'image/webp' || data.type === 'image/gif') {
            const reader = new FileReader();
            reader.onloadend = () => {
                handleSubmit(null, reader.result)
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

    return <div className="profile-container">
        <div className="information">
            <h2>Mon profil</h2>
            <div className="avatar-container">
                <Avatar size="large" src={user?.data?.avatar || ""} style={{ background: 'rgba(' + user?.data?.defaultColor + ')', textTransform: 'uppercase' }} className="avatar-preview">
                    {user?.data?.name?.length > 1 ? user.data.name.substring(0, user.data.name.length - (user.data.name.length - 1)) : user.data.name}
                </Avatar>
                <Upload className="upload-image" beforeUpload={uploadImage} accept="image/png, image/jpeg, image/webp">
                    <Button type="primary">Changer photo de profil</Button>
                </Upload>
            </div>
            <div className="info-list">
                <div>
                    Email : <span className="untouched">{user?.data?.email}</span>
                </div>
                <div>
                    Pseudo : <span className="untouched">{user?.data?.name}</span>
                </div>
                <div>
                    Inscrit depuis le : <span className="untouched">{user?.data?.registerDate && new Date(user?.data?.registerDate).toLocaleDateString('fr', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
            </div>
        </div>
        <div className="parametre">
            <h2>Paramètres</h2>
            <small>En ayant le statut "Occupé" vous ne recevrez plus les notifications à l'affichage n'y les notifications sonores.</small>
            <div className="info-list">
                <div className="status">
                    <span>Statut de disponibilité</span>
                    <Switch checkedChildren="En ligne" onChange={handleChangeStatus} unCheckedChildren="Occupé" defaultChecked={store.getState().user?.data?.statusOnline === "online" ? true : false} />
                </div>
                <div className="langue">
                    <span>Langue : Français</span>
                    <Button type="primary">Changer</Button>
                </div>
            </div>
        </div>
        <div className="rgpd">
            <h2>RGPD</h2>
            <div className="delete-profile">
                <span>Vous souhaitez ne plus faire partie de l'application WeWorldChat ?</span>
                <Button type="primary" danger onClick={() => handleDeleteAccount()}>Supprimer mon compte</Button>
            </div>
        </div>
    </div>
};

const mapStateToProps = ({ user }) => ({ user });
const mapDispatchToProps = dispatch => ({ dispatch });
export default _.compose(connect(mapStateToProps, mapDispatchToProps), withRouter)(Profile);