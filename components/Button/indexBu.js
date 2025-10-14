import React, { Component } from "react";

class Button extends Component {

    render() {

        return (
            <button style = {{backgroundColor: this.props.cor}}>{this.props.children}</button>
        );
    }
}

export default Button;