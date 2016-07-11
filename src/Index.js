/* eslint-disable no-unused-vars */
import React from 'react';
import {Router, Route, hashHistory, IndexRoute} from 'react-router';
/* eslint-enable no-unused-vars */
import {render} from 'react-dom';
import App from './components/App';
// import Overview from './components/Overview';
import Plot from './components/Plot';
import About from './components/About';
/* eslint-disable no-undef */
window.React = React;
/* eslint-enable no-undef */

render(
    (
        <Router history={hashHistory}>
            <Route path="/" component={App} name="Home">
                <Route path="/about" name="About" component={About} />
                <Route path="/plot" name="Plot" component={Plot} />
            </Route>
        </Router>
    ),
    /* eslint-disable no-undef */
    document.getElementById('content')
    /* eslint-enable no-undef */
);
