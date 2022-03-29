import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, Image } from '@tarojs/components'
import { AtForm, AtInput, AtButton, AtMessage } from 'taro-ui'
import { connect } from 'react-redux'
import { tabClick } from '../../redux/actions/counter'
import './index.less'

class Login extends Component {
  
  state = {
    userName: '',
    userPassword: '',
    loading: false
  }
  handleRegister = () => {
    Taro.navigateTo({
      url: '/pages/register/index'
    })
  }
  handleLogin = () => {
    const { userName, userPassword } = this.state;
    const params = { userName, userPassword };
    this.setState({
      loading: true
    })
    if (userName.length < 3 || userName.length > 12) {
      Taro.atMessage({
        'message': '请输入3-12位长度用户名',
        'type': 'warning',
        'duration': 2000
      })
      this.setState({
        loading: false
      })
      return;
    }
    if (userPassword.length < 6 || userPassword.length > 15) {
      Taro.atMessage({
        'message': '请输入6-15位长度密码',
        'type': 'warning',
        'duration': 2000
      })
      this.setState({
        loading: false
      })
      return;
    }
    Taro.request({
      url: 'https://chayuanshiyi.cn:4000/login/?',
      method:'POST',
      data: params
    }).then(res => {
      this.setState({
        loading: false
      })
      if (res.data.code === 1) {
        Taro.setStorage({
          key: "userInfo",
          data: res.data.data
        })
        Taro.switchTab({
          url: '/pages/index/index'
        })
        this.props.dispatch(tabClick(0))
      } else {
        Taro.atMessage({
          'message': res.data.msg,
          'type': 'error',
          'duration': 2000
        })
      }
    }, err => {
        this.setState({
          loading: false
        })
        Taro.atMessage({
          'message': '网络好像开小差啦',
          'type': 'error',
          'duration': 2000
        })
    })
  }
  handleChange = (value, event) => {
    const type = event.mpEvent.target.id;
    if (type === 'userName') {
      this.setState({
        userName: value
      })
    } else if (type === 'userPassword') {
      this.setState({
        userPassword: value
      })
    }
  }
  render() {
    return (
      <>
        <AtMessage />
        <View className='backgroundTop'/>
        <View className='loginForm'>
          <AtForm>
            <AtInput
              name='userName'
              title='用户名'
              type='text'
              placeholder='请输入3-12位用户名'
              value={this.state.userName}
              onChange={this.handleChange}
            />
            <AtInput
              name='userPassword'
              title='密码'
              type='password'
              placeholder='请输入6-15位密码'
              value={this.state.userPassword}
              onChange={this.handleChange}
            />
            <View style={{ marginTop: '20rpx' }}>
            <AtButton
              loading={this.state.loading}
              circle='true'
              type='primary'
              style={{ marginTop: '40rpx' }}
              onClick={this.handleLogin}>
                登录
            </AtButton>
            </View>
            <View style={{ marginTop: '20rpx' }}>
            <AtButton
              circle='true'
              type='secondary'
              onClick={this.handleRegister}>
                注册
            </AtButton>
            </View>
          </AtForm>
        </View>
        <Image src={require('../../assets/images/logo.png')} style={{ display: 'block', width: '360rpx', height: '360rpx', margin: '50rpx auto' }} />
      </>
    )
  }
}

export default connect()(Login);