import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, Picker } from '@tarojs/components'
import { AtForm, AtInput, AtButton, AtList, AtListItem } from 'taro-ui'
import { collegeList, majorList } from '../../config/majorList'
import {pattern} from '../../utils/pattern'
import './index.less'

class Register extends Component {
  
  state = {
    userName: '',
    userPassword: '',
    realName: '',
    studentNumber: '',
    selector: [collegeList, majorList[0]],
    major: '',
    loading: false
  }
  pickerChange = e => {
    this.setState({
      major: this.state.selector[1][e.detail.value[1]]
    })
  }
  onColumnChange = e => {
    if (e.detail.column === 0) {
      const _this = this;
      const college = e.detail.value;
      _this.setState({
        selector: [collegeList, majorList[college]]
      })
    }
  }
  handleChange = (value, event) => {
    const type = event.mpEvent.target.id;
    const formChange = { 
      'userName2': {userName: value},
      'userPassword2': {userPassword: value},
      'realName': {realName: value},
      'phoneNumber': {phoneNumber: value},
      'studentNumber': {studentNumber: value} 
    };
    this.setState(formChange[type]);
  }
  handleRegister = () => {
    const { userName, userPassword, realName, phoneNumber, studentNumber, major } = this.state;
    const params = { userName, userPassword, realName, phoneNumber, studentNumber, major };
    const { uPattern, pPattern, phPattern, nPattern } = pattern;
    this.setState({
      loading: true
    })
    if (userName.length < 3 || userName.length > 12) {
      Taro.showToast({
        title: '请输入3-12位长度用户名',
        icon: 'none',
      })
      this.setState({
        loading: false
      })
      return;
    }
    if (userPassword.length < 6 || userPassword.length > 15) {
      Taro.showToast({
        title: '请输入6-15位长度密码',
        icon: 'none',
      })
      this.setState({
        loading: false
      })
      return;
    }
    if (!nPattern.test(realName)) {
      Taro.showToast({
        title: '请输入合法的姓名',
        icon: 'none',
      })
      this.setState({
        loading: false
      })
      return;
    }
    if (!phPattern.test(phoneNumber)) {
      Taro.showToast({
        title: '请输入正确的手机号码',
        icon: 'none',
      })
      this.setState({
        loading: false
      })
      return;
    }
    if (studentNumber.length !== 12) {
      Taro.showToast({
        title: '请输入12位长度正确的学号',
        icon: 'none',
      })
      this.setState({
        loading: false
      })
      return;
    }
    if (!major) {
      Taro.showToast({
        title: '请选择您的专业',
        icon: 'none',
      })
      this.setState({
        loading: false
      })
      return;
    }
    Taro.request({
      url: 'https://chayuanshiyi.cn:4000/register/',
      method: 'POST',
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
        setTimeout(() => {
          Taro.navigateBack({
            delta: 1
          })
        }, 1000);
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
      <>
        <View className='backgroundTop'/>
        <View className='loginForm'>
          <AtForm>
            <AtInput
              name='userName2'
              title='用户名'
              type='text'
              placeholder='请输入3-12位用户名'
              value={this.state.userName}
              onChange={this.handleChange}
            />
            <AtInput
              name='userPassword2'
              title='密码'
              type='password'
              placeholder='请输入6-15位密码'
              value={this.state.userPassword}
              onChange={this.handleChange}
            />
            <AtInput
              name='realName'
              title='真实姓名'
              type='text'
              placeholder='请输入您的姓名'
              value={this.state.realName}
              onChange={this.handleChange}
            />
            <AtInput
              name='phoneNumber'
              title='手机号码'
              type='number'
              placeholder='请输入您的手机号码'
              value={this.state.phoneNumber}
              onChange={this.handleChange}
            />
            <AtInput
              name='studentNumber'
              title='学号'
              type='text'
              placeholder='请输入12位数学号'
              value={this.state.studentNumber}
              onChange={this.handleChange}
            />
            <Picker
              mode='multiSelector'
              range={this.state.selector}
              onColumnChange={this.onColumnChange}
              onChange={this.pickerChange}
              style={{ marginLeft: '8rpx' }}
            >
              <AtList>
                <AtListItem
                  title='专业'
                  extraText={this.state.major}
                />
              </AtList>
            </Picker>
            <View style={{ marginTop: '20rpx' }}>
              <AtButton
                circle='true'
                type='primary'
                loading={this.state.loading}
                onClick={this.handleRegister}>
                  立即注册
              </AtButton>
            </View>
          </AtForm>
        </View>
      </>
    )
  }
}

export default Register;