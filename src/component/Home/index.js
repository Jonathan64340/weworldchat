import React, { useState } from 'react';
import { Layout } from 'antd';
import _ from 'underscore';
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { Helmet } from "react-helmet";

import SiderComponent from './SiderComponent';
import Tchat from './Tchat';
import './Home.css'

const Home = ({ user, ...props }) => {
    // useEffect(() => onConnectionRematch(), [])
    const [viewTchat, setViewTchat] = useState('')
    const [isMobile, setIsMobile] = useState(window.innerWidth >= 900 ? true : false)

    window.addEventListener('resize', ev => {
        if (ev?.target?.innerWidth >= 900) {
            return setIsMobile(true)
        }
        return setIsMobile(false)
    })

    return <>
        <Helmet>
            <meta charSet="utf-8" />
            <title>Tchattez - {user.data?.name}</title>
        </Helmet>
        <Layout className="home-layout">
            <div className="flex-container">
                <SiderComponent viewTchat={viewTchat} isMobile={!isMobile} />
                <Tchat privateId={props.match.params.id} socketId={props?.history?.location?.state?.socketId || undefined} viewTchat={setViewTchat} isMobile={!isMobile} />
            </div>
        </Layout>
    </>
}

const mapStateToProps = ({ user }) => ({ user })
const mapDispatchToProps = dispatch => ({ dispatch })
export default _.compose(connect(mapStateToProps, mapDispatchToProps), withRouter)(Home)