import { TOGGLE_EDIT_TABLE_MODAL, SET_EDIT_ROW, SET_MEDCARD_DATA, TOGGLE_TABLE_LOADING } from "../constants/doctorConstants";

export const toggleEditTableModal = () => {
  return {
    type: TOGGLE_EDIT_TABLE_MODAL
  }
};

export const toggleTableLoading = () => {
  return {
    type: TOGGLE_TABLE_LOADING
  }
};

export const setEditRow = (record) => {
  return {
    type: SET_EDIT_ROW,
    record
  }
};

export const setMedcardData = (medcardData) => {
  return {
    type: SET_MEDCARD_DATA,
    medcardData
  }
};