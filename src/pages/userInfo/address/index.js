import React, { Component } from 'react'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { View, Text, Image } from '@tarojs/components'
import { AtList, AtListItem } from 'taro-ui'
import '../index.less'

class Address extends Component {
  state = {
    userInfo: {},
    addressInfo: []
  }
  componentDidShow() {
    const userInfo = Taro.getStorageSync('userInfo');
    Taro.request({
      url: 'https://chayuanshiyi.cn:4000/address/get/?',
      method: 'GET',
      data: { userId: userInfo.userId }
    }).then(res => {
      const data = res.data.data;
      if (res.data.code === 1) {
        this.setState({
          addressInfo: data
        })
      } else {
        Taro.showToast({
          title: res.data.msg,
          icon: 'none'
        })
        Taro.navigateBack({
          delta: 1
        })
      }
    }, err => {
      Taro.showToast({
        title: '网络好像开小差啦',
        icon: 'none'
      })
    })
    this.setState({
      userInfo
    })
  }
  addNewAddress = () => {
    Taro.navigateTo({ url: '/pages/userInfo/address/addAddress/index' })
  }
  updateAddress = (e) => {
    const address = e.address.trim().split(' ')[0];
    const houseNumber = e.address.trim().split(' ')[1];
    const params = `id=${e.id}&address=${address}&latitude=${e.latitude}&longitude=${e.longitude}&houseNumber=${houseNumber}&contacts=${e.contacts.slice(0, e.contacts.length - 2)}&contactsPhone=${e.contactsPhone}`
    Taro.navigateTo({ url: `/pages/userInfo/address/addAddress/index?${params}&update=true` })
  }
  chooseBack = (params) => {
    const routerParams = getCurrentInstance().router.params;
    if (routerParams.shouldBack === 'true') {
      const pages = Taro.getCurrentPages(); // 获取当前的页面栈 
      const prevPage = pages[pages.length - 2]; //  获取上一页面
      prevPage.setData({ //设置上一个页面的值
        addressParams: params
      });
      Taro.navigateBack({
        delta: 1
      });
    }
  }
  render() {
    return (
      <View className='userAddress'>
        { this.state.addressInfo.length !== 0 ?
        <View className='addressInfo'>
          <AtList>
            {this.state.addressInfo.map(item => {
              return <View style={{ position: 'relative' }} onClick={() => this.chooseBack(item)}>
                <AtListItem title={item.address} note={item.contacts + ' ' + item.contactsPhone} />
                <View className='iconBlock' onClick={() => this.updateAddress(item)}>
                  <View className='at-icon at-icon-edit'/>
                </View>
              </View>
            })}
          </AtList>
        </View>
        :
        <View className='noAddress'>
          <Image src={require('../../../assets/images/empty.png')}/>
          <View>您暂无常用地址</View>
        </View>
        }
        <View style={{ height: '120rpx' }}/>
        <View className='addNewAddress' onClick={this.addNewAddress}>
            + 新建地址
        </View>
      </View>
    )
  }
}

export default Address;