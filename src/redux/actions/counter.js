import {
  TABCLICK,
  ORDERJUMP
} from '../constants/counter'

//tabbar点击图标状态切换
export const tabClick = current => {
  return {
    type: TABCLICK,
    payload: current
  }
}
//订单页需要跳转展示的tab（用于区分代拿帮买下单跳转和抢单跳转）
export const orderJump = current => {
  return {
    type: ORDERJUMP,
    payload: current
  }
}

