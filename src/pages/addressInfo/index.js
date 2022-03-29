import React, { Component } from 'react'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { View, Text, Image, Radio, RadioGroup } from '@tarojs/components'
import { AtForm, AtInput, AtButton, AtList, AtListItem } from 'taro-ui'
import { getLocationInfo, getAddressInfo } from '../../utils/getLocationInfo'
import { pattern } from '../../utils/pattern'
import './index.less'
import AddAddress from '../../components/addAddress/index'

class AddressInfo extends Component {
  state = {
    address: '',
    addressInfo: [],
    longitude: '',
    latitude: '',
  }
  componentDidMount() {
    // const pages = Taro.getCurrentPages(); // 获取当前的页面栈 
    // const prevPage = pages[pages.length - 2]; //  获取上一页面
    // const eventChannel = prevPage.getOpenerEventChannel();
    // // 监听acceptDataFromOpenerPage事件，获取上一页面通过eventChannel传送到当前页面的数据
    // new Promise((resolve, reject) => {
    //   eventChannel.on('acceptDataFromOpenerPage', function (data) {
    //     resolve(data);
    //   })
    // }).then(res => {
    //   console.log('取件/收件', res.type)
    //   this.setState({
    //     address: res.takeAddress,
    //     type: res.type,
    //     longitude: res.longitude,
    //     latitude: res.latitude
    //   })
    // })
    const params = getCurrentInstance().router.params;
    this.setState({
      address: params.takeAddress,
      type: params.type,
      longitude: params.longitude,
      latitude: params.latitude
    })
    this.getMyAddress();
  }
  componentDidShow () {
    const chooseLocation = requirePlugin('chooseLocation'); //获取腾讯选择地址插件点击确定返回的结果对象
    const location = chooseLocation.getLocation(); // 如果点击确认选点按钮，则返回选点结果对象，否则返回null
    location ? 
    this.setState({
      address: location.name,
      longitude: location.longitude,
      latitude: location.latitude
    }) : ''
  }
  getMyAddress = () => { //获取常用地址信息
    const userId = Taro.getStorageSync('userInfo').userId;
    Taro.request({
      url: 'https://chayuanshiyi.cn:4000/address/get/?',
      method: 'GET',
      data: { userId }
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
  }
  chooseMyAddress = (params) => { //保存地址或选择地址将地址信息带回上个页面
    const pages = Taro.getCurrentPages(); // 获取当前的页面栈 
    const prevPage = pages[pages.length - 2]; //  获取上一页面
    console.log('取件/收件', this.state.type)
    prevPage.setData({ //设置上一个页面的值
      addressParams: params,
      type: this.state.type
    });
    Taro.navigateBack({
      delta: 1
    });
  }
  myAddress = () => { //将地址信息渲染成dom
    const addressInfo = this.state.addressInfo;
    return addressInfo.map(item => {
      return <View style={{ position: 'relative' }} onClick={() => this.chooseMyAddress(item)}>
               <AtListItem title={item.address} note={item.contacts + ' ' + item.contactsPhone} />
               <View className='at-icon at-icon-edit editIcon' />
             </View>
    })
  } 
  render() {
    return (
     <View style={{ background: '#f1f1f1', height: '100vh', overflowY: 'scroll' }}>
        <AddAddress address={this.state.address} longitude={this.state.longitude} latitude={this.state.latitude} saveAndBack={true} type={this.state.type}/>{/*保存地址模块组件,saveAndBack属性为true时将地址信息返回给上一层*/}
       { this.state.addressInfo.length !== 0 ?
       <View className='addressInfo'>
         <View className='myAddressTitle'>常用地址</View>
         <AtList>
           {this.myAddress()}
         </AtList>
       </View> 
       : 
       <View className='noAddress'>
        <Image src={require('../../assets/images/empty.png')}/>
        <View>您暂无常用地址</View>
       </View>
       }
     </View>
    )
  }
}

export default AddressInfo;