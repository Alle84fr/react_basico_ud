import React, { Component } from "react";
import PropTypes from "prop-types";

class Button extends Component {

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

Button.defaultProps = {
    title: "Padrão"
}

Button.propTypes = {
    title: PropTypes.string.isRequired
}

export default Button;