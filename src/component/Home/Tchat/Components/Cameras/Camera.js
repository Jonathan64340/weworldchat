import React from 'react';
import './camera.css'
import UserCam from './UserCam';
import OwnerCam from './OwnerCam';

const Camera = () => {
    return <div className="container-cameras">
        <UserCam />
        <OwnerCam />
    </div>
}

export default Camera