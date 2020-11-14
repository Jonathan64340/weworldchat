import React, { useEffect, useState } from 'react';
import { Layout } from 'antd';
import _ from 'underscore';
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from "react-helmet";

import SiderComponent from './SiderComponent';
import Tchat from './Tchat';
import './Home.css'
import { onConnectionRematch } from '../../utils/manager';

const Home = ({ user, ...props }) => {
    useEffect(() => onConnectionRematch(), [])
    const [viewTchat, setViewTchat] = useState('')

    return <>
        <Helmet>
            <meta charSet="utf-8" />
            <title>Tchattez - {user.data?.name}</title>
        </Helmet>
        <Layout className="home-layout">
            <div className="flex-container">
                <SiderComponent viewTchat={viewTchat} />
                <Tchat privateId={props.match.params.id} viewTchat={setViewTchat} />
            </div>
        </Layout>
    </>
}

const mapStateToProps = ({ user }) => ({ user })
const mapDispatchToProps = dispatch => ({ dispatch })
export default _.compose(connect(mapStateToProps, mapDispatchToProps), withRouter)(Home)