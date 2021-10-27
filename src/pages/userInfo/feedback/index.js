import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { AtTextarea, AtButton } from 'taro-ui'
import '../index.less'

class Feedback extends Component {
  state = {
    feedback: '',
    loading: false
  }
  
  setFeedback = (value) => {
    this.setState({
      feedback: value
    })
  }

  subFeedback = () => {
    const { userId, userName, realName } = Taro.getStorageSync('userInfo');
    const params = { userId, userName, realName, feedback: this.state.feedback }
    if (!this.state.feedback) {
      Taro.showToast({
        title: '请输入您的意见反馈',
        icon: 'none'
      })
      return
    }
    Taro.request({
        url: 'http://localhost:3000/userInfo/subFeedback/?',
        method: 'GET',
        data: params
      }).then(res => {
        if (res.data.code === 1) {
          Taro.showToast({
            title: res.data.msg,
            icon: 'success'
          })
          Taro.navigateBack({
            delta: 1
          })
        }
      })
  }

  render() {
    return (
      <>
        <View style={{ width: '90%', margin: '25px auto' }}>
          <AtTextarea
            value={this.state.feedback}
            onChange={this.setFeedback}
            maxLength={60}
            height={400}
            placeholder='点击输入意见反馈'
          />
          <View style={{ marginTop: '40rpx' }}>
            <AtButton type='primary' loading={this.state.loading} onClick={this.subFeedback}>
                <Text style={{ color: '#fff', fontSize: '24rpx' }}>提交</Text>
            </AtButton>
          </View>
        </View>
      </>
    )
  }
}

export default Feedback;