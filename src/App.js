import React, { Component } from "react";
import { HashRouter as Router, Switch, Route } from "react-router-dom";
import Root from "./routes/Root/Root";
import Home from "./routes/Home/Home";
import Room from "./routes/Room/Room";

class App extends Component {
  render() {
    return (
      <Router>
        <Root>
          <Switch>
            <Route exact path="/" component={Home} />
            <Route exact path="/home/:sessionName" component={Home} />
            <Route exact path="/room/:sessionName" component={Room} />
          </Switch>
        </Root>
      </Router>
    );
  }
}

export default App;
