import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { View } from '@tarojs/components'
import { AtTabs, AtTabsPane } from 'taro-ui'
import FooterNav from '../../components/FooterNav'
import Dn from '../dn'
import Bm from '../Bm'
import Qd from '../Qd'
import './index.less'

class Index extends Component {
  state = {
    current: 0,
    DnShow: true,
    BmShow: false,
    Qdshow: false,
    addressParams: '',
    orderList: []
  }
  componentDidShow() { // 对应onShow，只有在onShow中才会监听到当前页面的改变
    const pages = Taro.getCurrentPages();
    const currPage = pages[pages.length - 1]; // 获取当前页面
    const { addressParams, type } = currPage.__data__;// 获取值
    if (addressParams) { 
      this.setState({ addressParams, type })
    }
    console.log('啊啊啊', addressParams, type)

    if (this.state.current === 2) { //如果是在我要抢单页面就调一遍抢单列表接口，以达到组件前端出现，页面更新的效果
      this.getQdOrderList();
    }
  }
  handleClick = (value) => {
    this.setState({
      current: value
    })
    if (value === 2) {
      this.getQdOrderList();
    }
  }
  getQdOrderList = () => {
    const userId = Taro.getStorageSync('userInfo').userId;
    Taro.request({
      url: 'https://chayuanshiyi.cn:4000/order/qd/get/?',
      method: 'GET',
      data: { userId }
    }).then(res => {
      Taro.stopPullDownRefresh();
      if (res.data.code === 1) {
        this.setState({
          orderList: res.data.data
        })
      } else {
        Taro.showToast({
          title: res.data.msg,
          icon: 'none'
        })
      }
    }, err => {
      Taro.stopPullDownRefresh();
      Taro.showToast({
        title: '网络好像开小差啦',
        icon: 'none'
      })
    })
  }
  render () {
    const { addressParams, type } = this.state;
    const tabList = [{ title: '校园代拿' }, { title: '校园帮买' }, { title: '我要抢单' }]
    return (
      <View className='index'>
        <AtTabs swipeable={false} current={this.state.current} tabList={tabList} onClick={this.handleClick}>
          <AtTabsPane current={this.state.current} index={0} >
            <Dn addressParams={addressParams} type={type} />
          </AtTabsPane>
          <AtTabsPane current={this.state.current} index={1} >
            <Bm/>
          </AtTabsPane>
          <AtTabsPane current={this.state.current} index={2} >
            <Qd orderList={this.state.orderList}/>
          </AtTabsPane>
        </AtTabs>
        <FooterNav/>
      </View>
    )
  }
}

export default Index;