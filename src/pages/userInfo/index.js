import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, Image } from '@tarojs/components'
import { AtAvatar, AtList, AtListItem } from 'taro-ui'
import FooterNav from '../../components/FooterNav/index'
import './index.less'

class UserInfo extends Component {
  state = {
    userInfo: {},
    imgPath: require('../../assets/images/defaultAvatar.jpg')
  }
  componentDidMount() {
    const userInfo = Taro.getStorageSync('userInfo');
    this.setState({
      userInfo
    })
  }

  handleClick1 = () => {
    Taro.navigateTo({ url: '/pages/userInfo/personal/index' })
  }

  handleClick2 = () => {
    Taro.navigateTo({ url: '/pages/userInfo/blance/index' })
  }

  handleClick3 = () => {
    Taro.navigateTo({ url: '/pages/userInfo/address/index' })
  }

  handleClick4 = () => {
    Taro.navigateTo({ url: '/pages/userInfo/feedback/index' })
  }

  handleClick5 = () => {
    Taro.reLaunch({
      url: '/pages/login/index'
    })
  }
  // chooseAvatar = () => {
  //   const { userId } = this.state;
  //   Taro.chooseImage({
  //     count: 1, // 默认9
  //     sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
  //     sourceType: ['album', 'camera'],
  //     success: function (res) {
  //       console.log('褚锦涛1', res.tempFilePaths[0])
  //       Taro.uploadFile({
  //         url: 'http://localhost:3000/userInfo/upload/?',
  //         filePath: res.tempFilePaths[0],
  //         name: 'file',
  //         header: {
  //           "Content-Type": "multipart/form-data"
  //         },
  //         formData: {
  //           userId
  //         },
  //         success (res2) {
  //           console.log('褚锦涛2', res2)
  //           if (res2.statusCode === 200) {
  //             this.setState({
  //               imgPath: require(`../../../../node demo/uploads/'${JSON.parse(res2.data).data}`)
  //             })
  //           }
  //         }
  //       })
  //     }
  //   })
  // }
  render() {
    return (
      <View style={{ padding: '0 40rpx' }}>
        <View className='topLine'>
          <AtAvatar
            circle
            image={require('../../assets/images/defaultAvatar.jpg')}
          />
          <Text className='userName'>{this.state.userInfo.userName}</Text>
          <View className='certification'>
            <View className='certCheck'><Image src={require('../../assets/images/certification.png')} style={{ width: '32rpx', height: '32rpx' }} /></View>
            <View className='certWord'>已认证</View>
          </View>
        </View>
        <View className='userList'>
          <AtList>
            <AtListItem
              title='个人资料'
              arrow='right'
              iconInfo={{ size: 25, color: '#000', value: 'user' }}
              onClick={this.handleClick1}
            />
            <AtListItem
              title='我的余额'
              arrow='right'
              extraText={'￥' + this.state.userInfo.blance}
              iconInfo={{ size: 25, color: '#000', value: 'credit-card' }}
              onClick={this.handleClick2}
            />
            <AtListItem
              title='我的地址'
              arrow='right'
              iconInfo={{ size: 25, color: '#000', value: 'map-pin' }}
              onClick={this.handleClick3}
            />
            <AtListItem
              title='意见反馈'
              arrow='right'
              iconInfo={{ size: 25, color: '#000', value: 'message' }}
              onClick={this.handleClick4}
            />
            <AtListItem
              title='关于跑腿'
              arrow='right'
              iconInfo={{ size: 25, color: '#000', value: 'tag' }}
            />
            <AtListItem
              title='退出账号'
              iconInfo={{ size: 25, color: '#000', value: 'settings' }}
              onClick={this.handleClick5}
            />
          </AtList>
        </View>
        <FooterNav />
      </View>
    )
  }
}

export default UserInfo;