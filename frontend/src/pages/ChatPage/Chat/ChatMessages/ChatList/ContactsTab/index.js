import React from 'react';
import ChatSearch from './ChatSearch';
import { searchUsers } from 'api';
import { connect } from 'react-redux';
import { Typography } from "antd";

const { Text } = Typography;

let timer = null;

const mapStateToProps = ({ patientState }) => {
  return {
    testId: patientState.testId,
  }
};

class ContactsTab extends React.Component {
  state = {
    contactsList: [],
    name: "",
  };

  componentDidMount() {
    const { testId } = this.props;
    searchUsers(testId, { name: "" })
      .then(data => {
        this.setState({
          contactsList: data
        })
      })
  }

  searchUser = (value) => {
    const {
      testId,
    } = this.props;
    clearTimeout(timer);
    timer = setTimeout(
      () => {
        searchUsers(testId, { name: value })
          .then(data => {
            this.setState({
              contactsList: data
            })
          })
      },
      500,
    )
  };

  chooseContact = (item) => {
    const { chatsStatus, chooseChat, chooseTab } = this.props;
    const chat = chatsStatus.filter(chatItem => chatItem.sender === item.id);
    if (chat.length) {
      chooseChat(chat[0]);
    } else {
      chooseChat({
        sender: item.id,
        name: item.name,
        unread: "0",
      });
    }
    chooseTab("2");
  };

  render() {
    const { contactsList } = this.state;

    return (
      <React.Fragment>
        <ChatSearch searchUser={this.searchUser}/>
        <div className="contacts-list">
          {contactsList.map(item =>
            <div
              onClick={() => this.chooseContact(item)}
              className="chat-list-item d-flex justify-content-between"
              key={item.id}
            >
              <Text>{item.name}</Text>
            </div>
          )}
        </div>
      </React.Fragment>
    );
  }
}

export default connect(mapStateToProps)(ContactsTab);
