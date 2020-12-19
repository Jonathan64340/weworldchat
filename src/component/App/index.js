import React from 'react';
import HeaderLayout from '../Header';
import { Layout } from 'antd';
import { connect } from 'react-redux';
import 'antd/dist/antd.css'
import './App.css';

import {
    BrowserRouter as Router,
    Switch,
    Route,
    Redirect
} from "react-router-dom";
import Login from '../Login';
import Home from '../Home';
import Loader from '../Loader/Loader';

const App = ({ user }) => {
    return (
        <Loader>
            <Layout className="global-layout">
                <Router>
                    {user?.data?.isLogged && <HeaderLayout />}
                    <Switch>
                        <Route path="/login" component={Login} />
                        {!user?.data?.isLogged && <Redirect to="/login" />}
                        <Route path="/global" exact component={Home} />
                        <Route path="/conversation/:id" exact component={Home} />
                        <Route path="/group/:id" exact component={Home} />
                        <Route path="*" exact render={() => (<h1>Erreur 404 - Page introuvable</h1>)} />
                    </Switch>
                </Router>
            </Layout>
        </Loader>

    )
}

const mapStateToProps = ({ user }) => ({ user });

export default connect(mapStateToProps, {})(App);