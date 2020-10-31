import { InfoCircleOutlined, UpOutlined } from '@ant-design/icons';
import React, { useRef } from 'react';
import './footer.css';


const Footer = () => {
    const toggleClass = useRef();
    const onToggle = () => {
        console.log(toggleClass.current.classList.toggle('active'))
    }
    return (<div className="footer-content" ref={toggleClass}>
        <div className="footer-content-btn" onClick={() => onToggle()}>
            <UpOutlined />
        </div>
        <div className="footer-content-description">
            <div className="footer-content-description-info">
                <InfoCircleOutlined />{' '}Ce chat ne collecte aucune information sensible. <br /> Toutes les données échangées au cours d'une discussion seront automatiquement supprimées une fois que l'utilisateur se déconnectera de l'application.
            </div>
        </div>
    </div>)
}

export default Footer;