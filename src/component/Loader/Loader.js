import React from 'react';
import LoadingOverlay from 'react-loading-overlay'
import PacmanLoader from 'react-spinners/PacmanLoader'
import { connect } from 'react-redux';

const Loader = ({ app, ...props }) => {
    if (app?.isLoading) {
        document.body.style.cursor = "wait";
    } else {
        document.body.style.cursor = "default";
    }

    // Render
    return <>{props.children}</>
}

const mapStateToProps = ({ app }) => ({ app });

export default connect(mapStateToProps)(Loader);