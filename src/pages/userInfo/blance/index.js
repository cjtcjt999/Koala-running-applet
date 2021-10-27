import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { AtButton  } from 'taro-ui'
import '../index.less'

class Blance extends Component {
  state = {
    userInfo: {}
  }
  componentDidMount() {
    const userInfo = Taro.getStorageSync('userInfo');
    this.setState({
      userInfo
    })
  }

  render() {
    return (
      <View style={{ width: '100%', marginTop: '120rpx', display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
       <Text style={{ fontWeight: 'bold', width: '100%', textAlign: 'center' }}>我的余额</Text>
       <Text style={{ fontWeight: 'bold', width: '100%', textAlign: 'center', fontSize: '64rpx', marginTop: '20rpx' }}>
         <Text style={{ fontSize: '36rpx' }}>￥</Text>
         {this.state.userInfo.blance}
       </Text>
       <View style={{ marginTop: '120rpx', width: '420rpx' }}>
         <AtButton type='primary'>充值</AtButton>
       </View>
       <View style={{ marginTop: '20rpx', width: '420rpx' }}>
         <AtButton type='primary'>提现</AtButton>
       </View>
      </View>
    )
  }
}

export default Blance;