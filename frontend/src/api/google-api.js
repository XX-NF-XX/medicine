import {SEARCH_CONDITIONS} from '../constants/mapConstants';
import axios from 'axios';

export const apiKey = "AIzaSyDmQKgRryMzeNATRXmMr0WD6YEMkEchGxg";

class Place {
  constructor(placeResult) {
    const {place_id, geometry, name, vicinity, types, rating, user_ratings_total} = placeResult;
    this.placeId = place_id;
    this.position = {lat: geometry.location.lat(), lng: geometry.location.lng()};
    this.name = name;
    this.adress = vicinity;
    this.tags = types;
    this.rating = rating;
    this.ratingUsers = user_ratings_total;
  }
}

const _searchNearbyPlaces = (placesService,  searchRequest) => {
  return new Promise((resolve, reject) => {
    let placeResults = [];
    placesService.nearbySearch(searchRequest, (results, status, pagination) => {
      switch (status) {
        case 'OK':
        case 'ZERO_RESULTS':
        case 'NOT_FOUND':
          placeResults = placeResults.concat(results);
          if (pagination.hasNextPage) {
            pagination.nextPage();
          } else {
            resolve({placeResults});
          }
          break;
        case 'OVER_QUERY_LIMIT':
          resolve({placeResults, alert: status});
          break;
        case 'INVALID_REQUEST':
        case 'REQUEST_DENIED':
        case 'UNKNOWN_ERROR':
          resolve({placeResults, error: status});
          break;
        default:
          resolve({placeResults, error: 'UNKNOWN_ERROR'});
      }
    })
  })
}
const _timeout = (timeout) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {resolve('ok')}, timeout);
  })
}
const _getRequestsBySearchType = (searchType, location, radius) => {
  return ([
    ...SEARCH_CONDITIONS[searchType].TYPES.map(type => {
      return {location, radius, type};
    }),
    ...SEARCH_CONDITIONS[searchType].NAMES.map(name => {
      return {location, radius, name};
    }),
  ]);
}
const _combineSearchRequests = (responseResults) => {
  return responseResults.reduce((results, {placeResults, alert, error}, ) => {
    results.placeResults = results.placeResults.concat(placeResults);
    if (placeResults.length === 60) {
      results.alerts.add('OVER_PLACES_LIMIT');
    }
    if (alert) {
      results.alerts.add(alert);
    }
    if (error) {
      results.alerts.add(error);
    }
    return results;
  }, {placeResults: [], alerts: new Set(), errors: new Set()});
}
const _getUnicPlacesBySearchType = (placeResults, searchType) => {
  let unicPlaceIds = [];
  return placeResults.reduce((places, placeResult) => {
    if (!placeResult.types.some((type) => SEARCH_CONDITIONS[searchType].CHECK_TYPES.includes(type))) {
      return places;
    }
    if (SEARCH_CONDITIONS[searchType].EXCLUDE_TYPES 
      && placeResult.types.some((type) => SEARCH_CONDITIONS[searchType].EXCLUDE_TYPES.includes(type))) {
        return places;
    }
    if (unicPlaceIds.includes(placeResult.place_id)) {
      return places;
    }
    unicPlaceIds.push(placeResult.place_id);
    places.push(new Place(placeResult, searchType));
    return places;
  }, []);
}

export function searchMedicPlaces(placesService, location, radius, searchType) {
  const searchRequests = _getRequestsBySearchType(searchType, location, radius);
  let sentSearchRequests = searchRequests.map((searchRequest, index) => {
    const timeout = 1500 * Math.trunc(index / 3);
    return _timeout(timeout).then(() => {
      return _searchNearbyPlaces(placesService, searchRequest);
    });
  });
  return Promise.all(sentSearchRequests)
    .then((responseResults) => {
      const results = _combineSearchRequests(responseResults);
      const places = _getUnicPlacesBySearchType(results.placeResults, searchType);
      const alerts = [...results.alerts];
      const errors = [...results.errors];
      if (!places.length) {
        alerts.push('ZERO_RESULTS');
      }
      return {places, alerts, errors};
  })
}

export function getAdressFromPosition(geocoderService, position) {
  return new Promise((resolve, reject) => {
    geocoderService.geocode({location: position}, (result, status)=> {
      if (status === 'OK') {
        const adress = result[0].formatted_address;
        resolve(adress);
      }
      reject(status);
    });
  });
}

export function getLocationfromGoogle() {
  return axios.post(`https://www.googleapis.com/geolocation/v1/geolocate?key=${apiKey}`)
    .then((result) => {
      const {status, data: {location}} = result;
      if (status === 200) {
        return location;
      }
      throw new Error('GEOLOCATION_ERROR');
    });
}
