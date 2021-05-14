import React from 'react';
import { connect } from 'react-redux';
import { Button, Switch } from 'antd';
import _ from 'underscore';
import { withRouter } from 'react-router-dom';
import './profile.css';
import { deleteAccount } from '../../endpoints';
import swal from 'sweetalert';
import { setLogout } from '../../action/authentication/authentication_actions';

const Profile = ({ user, ...props }) => {
    console.log(user)

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
                await deleteAccount({ id: user?.data?.id });
                await props.dispatch(setLogout());
                await props.history.push('/login', { remerciement: true });
            }
        })
    }

    return <div className="profile-container">
        <div className="information">
            <h2>Mon profil</h2>
            <div className="avatar-container">
                <div className="avatar-preview">

                </div>
                <Button type="primary">Changer photo de profil</Button>
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
            <div className="info-list">
                <div className="status">
                    <span>Statut de disponibilité</span>
                    <Switch />
                </div>
                <div className="langue">
                    <span>Langue : Français</span>
                    <Button type="primary">Chnager</Button>
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