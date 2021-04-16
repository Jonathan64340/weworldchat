import swal from 'sweetalert'
import { store } from '../index'

const onConnectionRematch = () => {
    window.socket.on('disconnect', () => {
        if (window.location.href !== '/login') {
            const { name, isLogged } = store.getState().user?.data;
            isLogged && swal({
                title: "Vous avez été déconnecté",
                text: "Vous allez être redirigé vers la page de connexion",
                icon: "error",
                closeOnClickOutside: false,
                closeOnEsc: false
            })
                .then(() => {
                    window.location.href = '/login'
                });
        }
    })
}


export { onConnectionRematch }