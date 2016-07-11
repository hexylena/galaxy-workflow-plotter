/* eslint-disable no-unused-vars */
import React from 'react';
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';
import TrueFalse from './TrueFalse';
var Breadcrumbs = require('react-breadcrumbs');
/* eslint-enable no-unused-vars */
import {ServerUrl} from '../../conf.json';
/* global fetch */
import 'whatwg-fetch';

var UserDetail = React.createClass({
    getInitialState() {
        return {
            user: {}
        };
    },

    loadDataFromServer() {
        fetch(ServerUrl + '/api/users/' + this.props.params.id)
            .then(function(response) {
                return response.json();
            }).then(function(json) {
                this.setState({
                    user: json
                });
            }.bind(this)).catch(function(ex) {
                console.log('parsing failed', ex);
            });
    },

    componentDidMount() {
        this.loadDataFromServer();
    },

    render() {
        return (
            <div>
                <div>
                    <Breadcrumbs
                        routes={this.props.routes}
                        params={this.props.params}
                    />
                </div>
                <h1>User {this.state.user.username}</h1>
                <h3><a href="mailto:{this.state.user.email}">{this.state.user.email}</a></h3>
                <Table>
                    <TableBody
                      showRowHover
                      stripedRows
                      displayRowCheckbox={false}
                    >
                        <TableRow>
                            <TableRowColumn>ID</TableRowColumn>
                            <TableRowColumn>{this.state.user.id}</TableRowColumn>
                        </TableRow>
                        <TableRow>
                            <TableRowColumn>Active</TableRowColumn>
                            <TableRowColumn><TrueFalse checked={this.state.user.active} /></TableRowColumn>
                        </TableRow>
                        <TableRow>
                            <TableRowColumn>Deleted</TableRowColumn>
                            <TableRowColumn><TrueFalse checked={this.state.user.deleted} /></TableRowColumn>
                        </TableRow>
                        <TableRow>
                            <TableRowColumn>External</TableRowColumn>
                            <TableRowColumn><TrueFalse checked={this.state.user.external} /></TableRowColumn>
                        </TableRow>
                        <TableRow>
                            <TableRowColumn>Disk Usage</TableRowColumn>
                            <TableRowColumn>{this.state.user.disk_usage}</TableRowColumn>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        );
    }
});

export default UserDetail;
