import React, { useEffect } from 'react';
import { connect } from 'react-redux'

const getUserMedia = () => {
    navigator.mediaDevices.enumerateDevices()
        .then(devices => {
            let cam = devices.find(_devices => _devices.kind === "videoinput")
            let mic = devices.find(_devices => _devices.kind === 'audioinput')
            let constraints = { video: cam, audio: mic };

            return navigator.mediaDevices.getUserMedia(constraints)
                .then(stream => {
                    let video = document.getElementById('camera-owner-flux')
                    video.srcObject = stream
                    video.play()
                })
                .catch(err => console.log(err))
        })
}

const OwnerCam = ({ user, tchat }) => {
    useEffect(() => {
        if (document.getElementById('camera-owner-flux') && tchat.data.enableWebcamCall) getUserMedia()
    }, [tchat])
    return <div className="container-webcam">
        <video className="content-webcam" autoPlay={true} id="camera-owner-flux">
            AUCUN SIGNAL
        </video>
    </div>
}

const mapStateToProps = ({ user, tchat }) => ({ user, tchat })
export default connect(mapStateToProps)(OwnerCam);