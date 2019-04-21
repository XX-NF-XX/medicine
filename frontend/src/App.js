import React from 'react';
import routes from './routes';
import TopMenu from 'components/TopMenu';
import { Layout } from 'antd';
import axios from 'axios';
import { connect } from 'react-redux';
import Socket from 'helpers/Socket';
import { notification } from "antd/lib/index";
import { updateChatHistory, updateChatsStatus, updateReadMessages, updateNewMessages } from 'actions/chatActions';

const mapStateToProps = ({ authState, chatState }) => {
  return {
    userId: authState.userId,
    token: authState.token,
    currentCompanion: chatState.currentCompanion,
    chatHistory: chatState.chatHistory,
  }
};

let socket;

class App extends React.Component {
  componentWillMount() {
    axios.defaults.baseURL = process.env.REACT_APP_API_URL;
  }

  componentDidMount() {
    const { userId } = this.props;
    if (userId) {
      this.initChat(userId);
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.userId !== this.props.userId) {
      if (this.props.userId) {
        this.initChat(this.props.userId);
      } else {
        socket.socket.emit('disconnect');
      }
    }
  }

  readMessages = () => {
    const { currentCompanion, chatHistory } = this.props;
    const unreadMessages = chatHistory.filter(message => !message.isRead && message.sender === currentCompanion.sender);
    let unreadMessagesIds = [];
    unreadMessages.forEach(item => {
      unreadMessagesIds.push(item.id)
    });
    if (unreadMessagesIds.length) {
      socket.socket.emit('read', unreadMessagesIds);
    }
  };

  scrollDown = () => {
    const block = document.querySelector('.chat-frame-messages');
    block.scrollTop = block.scrollHeight;
  };

  initChat = (userId) => {
    const { dispatch } = this.props;

    socket = new Socket(userId);

    socket.socket.emit('status');

    socket.socket.on('status', chatsStatus => {
      dispatch(updateChatsStatus(chatsStatus.bySender, chatsStatus.total));
    });

    socket.socket.on('history', chatHistory => {
      dispatch(updateChatHistory(chatHistory, chatHistory.slice(-100)));
      this.scrollDown();
      setTimeout(() => this.readMessages(), 1000);
    });

    socket.socket.on('message', (message, meta) => {
      const { userId, currentCompanion, chatHistory } = this.props;
      if (!chatHistory.length) {
        socket.socket.emit('status');
      }

      if (userId !== meta.sender) {
        const args = {
          message: 'Нове повідомлення',
          description: message,
        };
        socket.socket.emit('status');
        notification.open(args);
      }
      if (currentCompanion) {
        if (currentCompanion.sender === meta.sender || userId === meta.sender) {
          const { dispatch } = this.props;
          dispatch(updateNewMessages({ ...meta, message }));
          this.scrollDown();
        }
        if (currentCompanion.sender === meta.sender) {
          setTimeout(() => socket.socket.emit('read', [meta.id]), 1000);
        }
      }
    });

    socket.socket.on('read', read => {
      const { dispatch } = this.props;
      dispatch(updateReadMessages(read));
      socket.socket.emit('status');
    });

    socket.socket.on('error', error => {
      socket.socket.emit('disconnect');
    });
  };

  render() {
    return (
      <Layout className="layout">
        <TopMenu/>
        {routes}
      </Layout>
    );
  }
}

const ConnectedApp = connect(mapStateToProps)(App);

export { socket, ConnectedApp };
