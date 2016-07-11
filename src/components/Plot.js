/* eslint-disable no-unused-vars */
import React from 'react';
import CircularProgress from 'material-ui/CircularProgress';
import TextField from 'material-ui/TextField';
import Graph from './Graph';
/* eslint-enable no-unused-vars */
/* global fetch */
import 'whatwg-fetch';

var Plot = React.createClass({
    getInitialState() {
        return {
            url: "",
            data: {}
        };
    },

    loadDataFromUrl(url) {
        fetch(url)
        .then(function(response) {
            // console.log(response);
            return response.json();
        }).then(function(json) {
            console.log(json);
            this.setState({
                url: url,
                data: json
            });
            this.processData(json);
        }.bind(this)).catch(function(ex) {
            console.log('parsing failed', ex);
        });
    },

    processData(json) {
        this.setState({
            url: this.state.url,
            data: this.state.data
        });
    },

    handleBlur(event) {
        this.loadDataFromUrl(event.target.value);
    },

    render() {
        var data;
        if (this.state.url.length === 0) {
            data = (
                <div>
                    <h2>Plot</h2>
                    <div>
                        <div>
                            <TextField
                                id="url_input"
                                type="url"
                                placeholder="Galaxy Workflow JSON Url"
                                onBlur={this.handleBlur}
                                />
                        </div>
                    </div>
                </div>
            );
        } else if (!this.state.processed) {
            data = (
                <div>
                    <h2>Plot</h2>
                    <div>
                        <div>
                            <TextField
                                id="url_input"
                                type="url"
                                placeholder="Galaxy Workflow JSON Url"
                                onBlur={this.handleBlur}
                                />
                        </div>
                        <CircularProgress size={2} />
                    </div>
                </div>
            );
        } else {
            // We have our plot
            data = (
                <div>
                    <h2>Plot</h2>
                    <div>
                        <div>
                            <TextField
                                id="url_input"
                                type="url"
                                placeholder="Galaxy Workflow JSON Url"
                                onBlur={this.handleBlur}
                                />
                        </div>
                    </div>
                    <h2>{this.state.data.name}</h2>
                    <Graph data={this.state.processed} />
                </div>
            );
        }
        return data;
    }
});

export default Plot;
