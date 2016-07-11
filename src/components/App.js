/* eslint-disable no-unused-vars */
import React from 'react';
import {Link} from 'react-router';
import IconButton from 'material-ui/IconButton';
import ActionHome from 'material-ui/svg-icons/action/home';
import RaisedButton from 'material-ui/RaisedButton';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import {pinkA200, deepPurple500, deepPurple700, grey400, grey100, grey500} from 'material-ui/styles/colors';
import AppBar from 'material-ui/AppBar';
/* eslint-enable no-unused-vars */

// import { ServerUrl } from '../../conf.json';
const muiTheme = getMuiTheme({
    palette: {
        primary1Color: deepPurple500,
        primary2Color: deepPurple700,
        primary3Color: grey400,
        accent1Color: pinkA200,
        accent2Color: grey100,
        accent3Color: grey500,
    }
});

const defaultContents = (
    <div>
        <h2>Hei</h2>
        <Link to="/plot">
            <RaisedButton
                label="Create a Plot" primary={true}/>
        </Link>
        <br />
        <Link to="/about">
            <RaisedButton
                label="About the GWP"
                secondary={true} />
        </Link>
    </div>
);

const App = ({children}) => (
    <MuiThemeProvider muiTheme={muiTheme}>
        <div>
            <AppBar
                title="Galaxy Workflow Plotter"
                // TODO: custom icon
                iconElementLeft={<Link to="/"><IconButton><ActionHome color={muiTheme.palette.accent1Color} /></IconButton></Link>}
            />
            <section>
                {children || defaultContents}
            </section>
        </div>
    </MuiThemeProvider>
);

App.propTypes = {children: React.PropTypes.object};

export default App;
