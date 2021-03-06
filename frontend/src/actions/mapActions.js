import {
  INIT_MAP_SERVICES, 
  START_SEARCH_POSITION, 
  START_SEARCH_PLACES, 
  END_SEARCH_POSITION, 
  END_SEARCH_PLACES, 
  SELECT_PLACE,
  TOGGLE_SHOW_SETTINGS,
} from '../constants/mapConstants';
import {createAction} from 'redux-actions';
import {getAdressFromPosition, searchMedicPlaces, getLocationfromGoogle} from '../api/google-api';

export const initMapServices = createAction(INIT_MAP_SERVICES);
export const startSearchPosition = createAction(START_SEARCH_POSITION, () => ({
  gmaps: {messages: {loading: 'Встановлення місцезнаходження', alerts: [], errors: []}},
}));
export const startSearchPlaces = createAction(START_SEARCH_PLACES, () => ({
  gmaps: {messages: {loading: 'Пошук медичних закладів', alerts: [], errors: []}},
}));
export const endSearchPosition = createAction(END_SEARCH_POSITION, ({position, adress, alerts=[], errors=[]}) => ({
  search: {position, adress},
  gmaps: {messages: {loading: null}, alerts, errors},
  places: {activePlaceId: null},
}));
export const endSearchPlaces = createAction(END_SEARCH_PLACES, ({places, alerts, errors, zoom, radius, type}) => ({
  search: {radius, type},
  places: {placesArray: places, activePlaceId: null},
  gmaps: {messages: {alerts, errors, loading: null}, zoom},
}));
export const selectPlace = createAction(SELECT_PLACE, ({activePlaceId, zoom}) => ({
  places: {activePlaceId},
  gmaps: {zoom},
}));
export const toggleShowSettings = createAction(TOGGLE_SHOW_SETTINGS, (showSettings) => ({
  search: {showSettings},
}));

export const getLocation = (geocoderService, placesService) => {
  return (dispatch, getState) => {
    dispatch(startSearchPosition());
    let alerts = [];
    let errors = [];
    const {radius, type, position} = getState().mapState.search;
    if (navigator.geolocation) {
      const getPosition = new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const {coords: {latitude: lat, longitude: lng}} = position;
            resolve({lat, lng});
          }, 
          (error) => {
            reject(error);
          }, 
          {timeout: 5000}
        )
      });
      getPosition
        .catch(() => getLocationfromGoogle())
        .then((position) => {
          getAdressFromPosition(geocoderService, position)
            .then((adress)=> {
              dispatch(endSearchPosition({position, adress}));
            })
            .catch(() => {
              alerts.push(`Не взалось визначити адресу для поточного місцезнаходження.`);
              dispatch(endSearchPosition({position, alerts}));
            })
            .finally(() => {
              if (!getState().mapState.places.placesArray.length) {
                dispatch(searchPlaces({placesService, position, radius, alerts, errors, type}));
              }
            });
        })
        .catch(() => {
          debugger;
          errors.push(`Помилка при визначенні місцезнаходження. Вкажіть своє місцецзаходження.`);
          dispatch(endSearchPosition({position, errors}));
          if (!getState().mapState.places.placesArray.length) {
            dispatch(searchPlaces({placesService, position, radius, alerts, errors, type}));
          }
          return;
        })
    } else {
      errors.push(`Помилка при визначенні місцезнаходження. Вкажіть своє місцецзаходження.`);
      dispatch(endSearchPosition({position, errors}));
      if (!getState().mapState.places.placesArray.length) {
        dispatch(searchPlaces({placesService, position, radius, alerts, errors, type}));
      } 
    } 
  }
}

export const searchPlaces = ({placesService, position, radius, alerts=[], errors=[], type}) => {
  return (dispatch) => {
    let zoom = 16;
    zoom = radius > 200 ? 15 : zoom;
    zoom = radius > 400 ? 14 : zoom;
    zoom = radius > 1200 ? 13 : zoom;
    zoom = radius > 3500 ? 12 : zoom;
    dispatch(startSearchPlaces());
    searchMedicPlaces(placesService, position, radius, type)
      .then(({places, alerts: searchAlerts, errors: searchErrors}) => {
        searchAlerts = searchAlerts.map((alert) => {
          if (alert === 'OVER_QUERY_LIMIT') {
            return `Отримані не повні дані пошуку. Можливо велике навантаження на сервіс. Спробуйте пізніше, або зменшіть радіус пошуку.`;
          }
          if (alert === 'OVER_PLACES_LIMIT') {
            return `Можливо отримані не повні дані пошуку. Зменьшіть радіус пошуку.`;
          }
          if (alert === 'ZERO_RESULTS') {
            return `Об'эктів не знайдено.`;
          }
          return `Помилка пошуку.`;
        });
        searchErrors = searchErrors.map((error) => {
            return `Помилка пошуку.`;
        });
        alerts = alerts.concat(searchAlerts);
        errors = errors.concat(searchErrors);
        dispatch(endSearchPlaces({places, alerts, errors, zoom, radius, type}));
      })
  }
}
