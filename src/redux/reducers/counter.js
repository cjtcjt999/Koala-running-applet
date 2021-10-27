import { TABCLICK, ORDERJUMP } from '../constants/counter'

const INITIAL_STATE = {
  current: 0
}

export function tabStateChange(state = INITIAL_STATE, action) {
  switch (action.type) {
    case TABCLICK:
      return {
        ...state,
        current: action.payload
      }
    default:
      return state
  }
}
export function orderJump(state = INITIAL_STATE, action) {
  switch (action.type) {
    case ORDERJUMP:
      return {
        ...state,
        current: action.payload
      }
    default:
      return state
  }
}
