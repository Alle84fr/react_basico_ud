import React, { Component } from "react";
import PropTypes from "prop-types";

class Button extends Component {

    state = {
  
  }

  componentWillUnmount(){
    console.log("componentWillUnmount")
  }
    

    render() {

        return (

            <button 
                onClick={this.props.press}
                style = {{
                    backgroundColor: this.props.corBtn,
                    color: this.props.corTxt,
                    padding: "10px 20px",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    margin: "5px"
                }}>{this.props.children}</button>
        );
    }
}

export default Button;