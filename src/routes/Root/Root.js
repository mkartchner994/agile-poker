import React from "react";
import "normalize-css/normalize.css";
import "./Root.css";

class Root extends React.Component {
  render() {
    return <div className="Root-container">{this.props.children}</div>;
  }
}

export default Root;
