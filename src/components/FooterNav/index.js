import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { AtTabBar } from 'taro-ui'
import { connect } from 'react-redux'
import { tabClick } from '../../redux/actions/counter'

class FooterNav extends Component {

  componentDidMount () {
    Taro.hideTabBar()
  }
  handleClick = (value) => {
    this.setState({
      current: value
    })
    this.props.tabClick(value);
    if (value === 0) {
      Taro.switchTab({ url: '/pages/index/index' }) 
    } else if (value === 1) {
      Taro.switchTab({ url: '/pages/order/index' }) 
    } else if (value === 2) {
      Taro.switchTab({ url: '/pages/userInfo/index' })
    }
  }
  render() {
    return (
      <AtTabBar
        fixed
        tabList={[
          { title: '首页', iconType: 'home' },
          { title: '订单', iconType: 'list' },
          { title: '我的', iconType: 'user' }
        ]}
        onClick={this.handleClick}
        current={this.props.current}
      />
    )
  }
}
const mapStateToProps = state => {
  return {
    current: state.tabStateChange.current
  }
};
const mapDispatchToProps = dispatch => {
  return {
    tabClick(current) {
      dispatch(tabClick(current))
    }
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(FooterNav);
