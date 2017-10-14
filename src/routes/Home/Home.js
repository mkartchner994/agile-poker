import React  from "react";
import "./Home.css";

class Home extends React.Component {
  constructor(props) {
    super(props);

    this._joinSession = this._joinSession.bind(this);
    this._sessionNameChange = this._onChange.bind(this, "sessionName");
    this._userNameChange = this._onChange.bind(this, "userName");
    this._userTypeChange = this._onChange.bind(this, "userType");

    this.state = {
      sessionName: this.props.match.params.sessionName || "",
      userName: "",
      userType: "player"
    };
  }

  /* Action handlers -----------------------------*/

  _joinSession() {
    let { sessionName, userName, userType } = this.state;
    if (!sessionName) {
      alert("Session name is required");
      return;
    }
    if (!userName) {
      alert("User name is required");
      return;
    }
    if (!userType) {
      alert("User type is required");
      return;
    }
    localStorage.setItem(`${sessionName}_user`, userName);
    localStorage.setItem(`${sessionName}_type`, userType);
    this.props.history.push(`/room/${sessionName}`);
  }

  _onChange(type, e) {
    let state = {};
    let value = e.target.value.trim();
    state[type] = value;
    this.setState(() => state);
  }

  /* React methods and lifecyle events -----------*/

  render() {
    return (
      <div>
        <h2>Join a session</h2>

        <label className="Home-label">Session name</label>
        <input
          type="text"
          value={this.state.sessionName}
          onChange={this._sessionNameChange}
          placeholder="supercalifragilisticexpialidocious"
        />

        <label className="Home-label">User name</label>
        <input
          type="text"
          value={this.state.userName}
          onChange={this._userNameChange}
          placeholder="Chim_chim_cher-ee"
        />

        <label className="Home-label">User type</label>
        <select value={this.state.userType} onChange={this._userTypeChange}>
          <option value="player">Player</option>
          <option value="observer">Observer</option>
        </select>

        <div className="Home-joinButtonContainer">
          <button onClick={this._joinSession}>Join</button>
        </div>
      </div>
    );
  }
}

export default Home;
