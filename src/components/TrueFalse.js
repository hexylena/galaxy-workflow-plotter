/* eslint-disable no-unused-vars */
import React from 'react';
import FontIcon from 'material-ui/FontIcon';
/* eslint-enable no-unused-vars */

var TrueFalse = React.createClass({
    render() {
        var iconName = this.props.checked ? "✓" : "✕";
        return (
            <span>{iconName}</span>
        );
    }
});

export default TrueFalse;
