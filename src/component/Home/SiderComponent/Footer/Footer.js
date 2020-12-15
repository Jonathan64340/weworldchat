import { GithubFilled, LinkedinFilled } from '@ant-design/icons';
import React, { useState, useEffect } from 'react';
import { getVersion } from '../../../../endpoints/app';

const Footer = () => {
    const [currentVersion, setCurrentVersion] = useState(undefined);

    useEffect(() => {
        getVersion().then(data => setCurrentVersion(data.version))
    }, [currentVersion])

    return <div className="credit" >
        <div className="credit__social">
            <a href="https://www.linkedin.com/in/jonathan-domingues/" target="_blank" rel="noopener noreferrer">
                <LinkedinFilled className="credit__linkedin" />
            </a>
            <a href="https://github.com/Jonathan64340" target="_blank" rel="noopener noreferrer">
                <GithubFilled className="credit__github" />
            </a>
        </div>
        <small className="credit__developer">Domingues Jonathan</small>
        <small>{currentVersion}</small>
    </div >
}

export default Footer;