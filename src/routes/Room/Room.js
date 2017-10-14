import React from "react";
import "./Room.css";

const buttonScores = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144];

class Room extends React.Component {
  state = {
    scoresVisible: false,
    users: []
  };

  constructor(props) {
    super(props);
    // Create functions for each of our buttons here so we only have to create them once
    // and not everytime the component is rendered.
    buttonScores.forEach(score => {
      this[`button${score}`] = this._selectButton.bind(this, score);
    });
  }

  // /* React methods and lifecyle events -----------*/

  async componentWillMount() {
    this.sessionName = this.props.match.params.sessionName;
    this.userName = localStorage.getItem(`${this.sessionName}_user`);
    this.userType = localStorage.getItem(`${this.sessionName}_type`);
    if (!this.userName) {
      this.props.history.replace(`/home/${this.sessionName}`);
    }
    let db = window.firebase.database().ref();
    let sessionRoom = await db.child(`rooms/${this.sessionName}`).once("value");
    // We need to create the room if it doesn't exist.
    if (!sessionRoom.exists()) {
      db
        .child("rooms")
        .child(this.sessionName)
        .set({
          scoresVisible: false
        });
    }
    this.dbSession = db.child("rooms").child(this.sessionName);
    // Add this user to the db.
    let newUser = this.dbSession.child("users").push();
    this.userKey = newUser.key;
    newUser.set({
      userName: this.userName,
      userType: this.userType,
      score: -1
    });
    // Remove this user once the browser is closed.
    let dc = this.dbSession.child("users").child(this.userKey);
    dc.onDisconnect().remove();
    // Listen for changes in this room.
    this.dbSession.on("value", this._setData);
  }

  componentWillUnmount() {
    this.dbSession.off("value", this._setData);
    this.dbSession
      .child("users")
      .child(this.userKey)
      .remove();
  }

  render() {
    let { scoresVisible, users } = this.state;
    let players = users.filter(user => user.userType === "player");
    let observers = users.filter(user => user.userType === "observer");
    return (
      <div>
        <h2>Session: {this.sessionName}</h2>

        <div className="Room-userContainer">
          {this._renderPointButtons()}

          <h3>
            Players ---{" "}
            <button className="Room-changeNameBtn" onClick={this._changeName}>
              Change Name
            </button>
          </h3>
          <ul className="Room-userList">
            {players.map(player => (
              <li
                className="Room-userListItem"
                onDoubleClick={this._removeUser.bind(this, player)}
                key={player.id}
              >
                <span className="Room-userListItemNameContainer">
                  {player.userName}
                </span>
                <span className="Room-userListItemScoreContainer">
                  {this._renderScore(player)}
                </span>
              </li>
            ))}
          </ul>

          {observers.length ? (
            <div>
              <h3>Observers</h3>
              <ul className="Room-userList">
                {observers.map(observer => (
                  <li
                    className="Room-userListItem"
                    onDoubleClick={this._removeUser.bind(this, observer)}
                    key={observer.id}
                  >
                    <span>{observer.userName}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {observers.length || players.length ? (
            <div className="Room-removeUserLabel">
              (Double click a username to remove)
            </div>
          ) : null}
        </div>

        <div className="Room-scoresContainer">
          <button
            className="Room-scoresActionBtn"
            onClick={this._clearAllUserScores}
          >
            Clear scores
          </button>
          <button
            className="Room-scoresActionBtn"
            onClick={this._updateRoomVisibility}
          >
            {scoresVisible ? "Hide" : "Show"} scores
          </button>
          {this._renderScoreTotals()}
        </div>
      </div>
    );
  }

  // /* View render functions -----------------------------*/

  _renderPointButtons() {
    return buttonScores.map(score => (
      <button
        key={score}
        className="Room-pointButton"
        onClick={this[`button${score}`]}
      >
        {score}
      </button>
    ));
  }

  _renderScore(player) {
    if (this.state.scoresVisible) {
      return <div>{player.score > -1 ? player.score : ""}</div>;
    } else {
      let classNames = ["Room-hiddenScore"];
      if (player.score !== -1) {
        classNames.push("decided");
      }
      classNames = classNames.join(" ");
      return <div className={classNames} />;
    }
  }

  _renderScoreTotals() {
    let totals = this._calculateTotals();
    let totalsArray = Object.keys(totals).sort((a, b) => a - b);
    if (this.state.scoresVisible) {
      return (
        <div className="Room-totalsContainer">
          <h4 className="Room-totalsTitle">
            Totals{" "}
            <span className="Room-totalsTitleUnanimous">
              {totalsArray.length === 1 && totalsArray[0] !== "?"
                ? " - unanimous!"
                : ""}
            </span>
          </h4>

          <table className="Room-totalScoresTable">
            <thead>
              <tr className="Room-totalScoresTableHead">
                <td>Score</td>
                <td>#</td>
              </tr>
            </thead>
            <tbody>
              {totalsArray.map(total => (
                <tr key={total}>
                  <td className="Room-totalScoresTableData">{total}</td>
                  <td className="Room-totalScoresTableData">{totals[total]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    } else {
      return null;
    }
  }

  // /* Action handlers -----------------------------*/

  _selectButton(score) {
    if (!this.state.scoresVisible) {
      this.dbSession
        .child("users")
        .child(this.userKey)
        .child("score")
        .set(score);
    }
  }

  _updateRoomVisibility = () => {
    this.dbSession.child("scoresVisible").set(!this.state.scoresVisible);
  };

  _clearAllUserScores = () => {
    let users = this.dbSession.child("users");
    this.state.users.forEach(user => {
      users
        .child(user.id)
        .child("score")
        .set(-1);
    });
  };

  _changeName = e => {
    e.preventDefault();
    localStorage.removeItem(`${this.sessionName}_user`);
    this.props.history.replace(`/home/${this.sessionName}`);
  };

  _removeUser = (user, e) => {
    e.preventDefault();
    let shouldRemove = window.confirm(
      `Are you sure you want to remove ${user.userName} from the room?`
    );

    if (shouldRemove) {
      this.dbSession
        .child("users")
        .child(user.id)
        .remove();
    }
  };

  _setData = snapshot => {
    let newState = snapshot.val();
    newState.users = this._prepareUserData(newState.users);
    this.setState(state => newState);
  };

  _prepareUserData(users) {
    let newUsers = [];
    if (users) {
      Object.keys(users).forEach(key => {
        let userObj = users[key];
        userObj.id = key;
        newUsers.push(userObj);
      });
    }
    return newUsers;
  }

  _calculateTotals = () => {
    let totals = {};
    let players = this.state.users.filter(user => user.userType === "player");
    players.forEach(player => {
      let score = player.score;
      if (score === -1) {
        score = "?";
      }
      let scoresTotal = totals[score];
      if (scoresTotal) {
        totals[score] += 1;
      } else {
        totals[score] = 1;
      }
    });
    return totals;
  };
}

export default Room;
