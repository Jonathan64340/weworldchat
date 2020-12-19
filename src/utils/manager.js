import swal from 'sweetalert'
import { checkConnectionRematch } from '../endpoints';
import { setLogin } from '../action/authentication/authentication_actions';
import { store } from '../index'

let _interval = null;

const onConnectionRematch = () => {
    if (_interval) return;
    if (window.location.href !== '/login')
        _interval = setInterval(() => {
            const { name, isLogged } = store.getState().user?.data;
            checkConnectionRematch(window.socket.id)
                .catch(() => {
                    isLogged && swal({
                        title: "Vous avez été déconnecté",
                        text: "Pour continuer, veuillez vous reconnecter en cliquant sur reconnexion",
                        icon: "warning",
                        buttons: ['Déconnexion', 'Reconnexion'],
                        closeOnClickOutside: false,
                        closeOnEsc: false
                    })
                        .then((onConnect) => {
                            if (onConnect) {
                                store.dispatch(setLogin({ pseudo: name, statusOnline: 'online', id: window.socket.id }))
                                window.socket.emit('users', {
                                    pseudo: name,
                                    statusOnline: 'online',
                                    id: window.socket.id
                                })
                                swal("Reconnexion réussie", {
                                    icon: "success",
                                    closeOnClickOutside: false,
                                    closeOnEsc: false,
                                    buttons: false,
                                    timer: 3000
                                });
                            } else {
                                window.location.href = '/login'
                            }
                        });
                })
        }, 30000)
}

const onStopConnectionRematch = () => {
    clearInterval(_interval)
}


export { onConnectionRematch, onStopConnectionRematch }