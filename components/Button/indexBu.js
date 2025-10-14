import React, { Component } from "react";
import PropTypes from "prop-types";

class Button extends Component {

    static defaultProps = {
        title: "Padrão"
    }

    static propTypes = {
        title: PropTypes.string.isRequired
    }

    render() {

        return (
            <div>
            {this.props.title} {this.props.decricao};
         

            <button style = {{
                    backgroundColor: this.props.corBtn,
                    color: this.props.corTxt,
                    padding: "10px 20px",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    margin: "5px"
                }}>{this.props.children}</button>
                </div>
        );
    }
}

export default Button;