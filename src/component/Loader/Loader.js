import React from 'react';
import LoadingOverlay from 'react-loading-overlay'
import PacmanLoader from 'react-spinners/PacmanLoader'
import { connect } from 'react-redux';

const Loader = ({ app, ...props }) => {
    // Make blur behind the loader
    const layout = document.getElementsByClassName('global-layout');
    if (app?.isLoading) {
        layout && layout[0] && (layout[0].style.filter = 'blur(4px)')
    } else {
        layout && layout[0] && (layout[0].style.filter = 'blur(0)')
    }

    // Render
    return <LoadingOverlay
        styles={{
            overlay: (base) => ({
                ...base,
                background: 'linear-gradient(48deg, rgba(36,36,0,1) 0%, rgba(0,6,162,0.6250875350140056) 0%, rgba(166,191,186,1) 100%)'
            })
        }}
        active={app?.isLoading}
        spinner={<PacmanLoader />}
    >
        {props.children}
    </LoadingOverlay>
}

const mapStateToProps = ({ app }) => ({ app });

export default connect(mapStateToProps)(Loader);