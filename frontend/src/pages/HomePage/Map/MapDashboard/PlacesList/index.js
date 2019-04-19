import React, { Component } from 'react';
import {List} from 'antd';

export default class PlacesList extends Component {

  getPlacesList = ({placeId, name, adress, type, tags, rating, ratingUsers}) => {
    return (
      <List.Item 
        key={placeId} 
        style={{cursor:'pointer',}}
        onClick={() => {
          const zoom = this.props.map.getZoom();
          this.props.selectPlace({activePlaceId: placeId, zoom});
        }}
      >
        {name}
        {placeId === this.props.places.activePlaceId &&
          <div style={{paddingLeft: '10px', fontStyle: 'italic', width: '250px'}}>
            {adress}<br />
            {type}<br />
            {tags.join(', ')}<br />
            {`рейтинг: ${rating?rating:'-'}/5 (відгуків - ${ratingUsers?ratingUsers:0})`}
          </div>
        }
      </List.Item>
    )
  }

  render() {
    return (
      <div style={{overflow: 'auto', height:'400px'}}>
      <List
          size="small"
          bordered
          dataSource={this.props.places.placesArray}
          renderItem={this.getPlacesList}
      />
      </div>
    );
  }
};