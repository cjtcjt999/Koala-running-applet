import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { AtInput, AtButton } from 'taro-ui'
import { pattern } from '../../../utils/pattern'
import '../index.less'

class Personal extends Component {
  state = {
    userInfo: {},
    loading: false
  }
  componentDidMount() {
    const userInfo = Taro.getStorageSync('userInfo');
    this.setState({
      userInfo,
      phoneNumber: userInfo.phoneNumber
    })
  }
  getUserInfo = () => {
    Taro.request({
      url: 'https://chayuanshiyi.cn:4000/userInfo/get/?',
      method: 'GET',
      data: { userId: this.state.userInfo.userId }
    }).then(res => {
      if (res.data.code === 1) {
        Taro.setStorage({
          key: "userInfo",
          data: res.data.data
        })
      } else {
        Taro.showToast({
          title: res.data.msg,
          icon: 'none'
        })
      }
    })
  }
  handlePhone = (value) => {
    this.setState({
      phoneNumber: value
    })
  }
  savePhone = () => {
    const params = { userId: this.state.userInfo.userId, phoneNumber: this.state.phoneNumber }
    if (!pattern.phPattern.test(this.state.phoneNumber)) {
      Taro.showToast({
        title: '请输入正确的手机号码',
        icon: 'none',
      })
      return;
    }
    this.setState({
      loading: true
    })
    Taro.request({
      url: 'https://chayuanshiyi.cn:4000/userInfo/update/?',
      method: 'GET',
      data: params
    }).then(res => {
      this.setState({
        loading: false
      })
      if (res.data.code === 1) {
        Taro.showToast({
          title: res.data.msg,
          icon: 'success',
          duration: 1000
        })
        this.getUserInfo();
      } else {
        Taro.showToast({
          title: res.data.msg,
          icon: 'none'
        })
      }
    }, err => {
      this.setState({
        loading: false
      })
      Taro.showToast({
        title: '网络好像开小差啦',
        icon: 'none'
      })
    })
  }
  render() {
    return (
      <View className='personalData'>
        <AtInput
          disabled
          name='realName'
          title='真实姓名'
          type='text'
          value={this.state.userInfo.realName}
        />
        <AtInput
          disabled
          name='studentNumber'
          title='学号'
          type='text'
          value={this.state.userInfo.studentNumber}
        />
        <AtInput
          disabled
          name='major'
          title='专业'
          type='text'
          value={this.state.userInfo.major}
        />
        <AtInput
          name='phoneNumber'
          title='手机号码'
          type='text'
          value={this.state.phoneNumber}
          onChange={this.handlePhone}
        >
          <View style={{ marginRight: '30rpx' }}>
            <AtButton type='primary' size='small' loading={this.state.loading} onClick={this.savePhone}>
              <Text style={{ color: '#fff', fontSize: '24rpx' }}>保存修改</Text>
            </AtButton>
          </View>
        </AtInput>
      </View>
    )
  }
}

export default Personal;