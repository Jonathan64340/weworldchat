import { InfoCircleOutlined, UpOutlined } from '@ant-design/icons';
import React, { useRef } from 'react';
import './footer.css';


const Footer = () => {
    const toggleClass = useRef();
    const toggleHeight = useRef();
    const onToggle = () => {
        toggleClass.current.classList.toggle('active')
        if(toggleClass.current.classList.contains('active')) {
            toggleClass.current.style.bottom = `-${toggleHeight.current.clientHeight}px`;
        } else {
            toggleClass.current.style.bottom = `0`;
        }
    }
    return (<div className="footer-content" ref={toggleClass}>
        <div className="footer-content-btn" onClick={() => onToggle()}>
            <UpOutlined />
        </div>
        <div className="footer-content-description" ref={toggleHeight}>
            <div className="footer-content-description-info">
                <InfoCircleOutlined />{' '}Ce chat requiert une authentification. <br /> En continuant vous acceptez de respecter les autres personnes présentes sur le chat sous réserve de bannir votre compte.
            </div>
        </div>
    </div>)
}

export default Footer;