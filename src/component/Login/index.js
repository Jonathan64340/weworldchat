import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import _ from 'underscore';
import { Helmet } from "react-helmet";
import Footer from '../Footer'
import './Login.css'
import HeaderLayout from '../Header';

const Login = () => {

    useEffect(() => {
        window.socket.open()
    }, [])

    return (<>
        <Helmet>
            <meta charSet="utf-8" />
            <title>Connexion</title>
        </Helmet>
        <HeaderLayout />
        <video autoPlay="true" muted="true" style={{ objectFit: 'cover' }} loop="true" src="https://storage.coverr.co/videos/9Jd00zdrM4M4kCo01OGVY6nD81BL9MTl001?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6IjM4Q0MzQTdGQTlGMUVDNDgxQjk3IiwiaWF0IjoxNjA0MzkxNjk0fQ.FIzjdanW9HtLyWIO6V9c1ot9VBWGjR_O6DP6rhxUn08"></video>
        <Footer />
    </>)
}

const mapStateToProps = ({ user }) => ({ user });
const mapDispatchToProps = dispatch => ({ dispatch })

export default _.compose(connect(mapStateToProps, mapDispatchToProps), withRouter)(Login);