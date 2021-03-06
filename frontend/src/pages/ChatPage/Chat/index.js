import React from 'react';
import { Layout, Row, Col } from 'antd';
import ChatMessages from './ChatMessages';
import ChatCurrent from './ChatCurrent';
import { clearChatHistory } from 'actions/chatActions';
import { connect } from 'react-redux';

const { Content } = Layout;

class Chat extends React.Component {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(clearChatHistory());
  }

  render() {
    return (
      <Content className="page">
        <Row>
          <Col xs={24} sm={10} md={7}>
            <ChatMessages/>
          </Col>
          <Col xs={24} sm={14} md={17}>
            <ChatCurrent/>
          </Col>
        </Row>
      </Content>
    );
  }
}

export default connect()(Chat);
