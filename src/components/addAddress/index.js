import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, Image, Radio, RadioGroup } from '@tarojs/components'
import { AtForm, AtInput, AtButton } from 'taro-ui'
import { getLocationInfo, getAddressInfo } from '../../utils/getLocationInfo'
import { pattern } from '../../utils/pattern'
import './index.less'

class AddAddress extends Component {
  state = {
    addressId: '',
    address: '',
    houseNumber: '',
    contacts: '',
    sex: '先生',
    contactsPhone: '',
    addressInfo: [],
    btnStatus: true,
    loading: false,
    longitude: '',
    latitude: ''
  }
  componentDidUpdate(prevProps) {
    const { addressId, address, houseNumber, contacts, contactsPhone, longitude, latitude, type, update } = this.props;
    if (address !== prevProps.address) {
      this.setState({
        address
      })
    }
    if (houseNumber !== prevProps.houseNumber) {
      this.setState({
        houseNumber
      })
    }
    if (contacts !== prevProps.contacts) {
      this.setState({
        contacts
      })
    }
    if (contactsPhone !== prevProps.contactsPhone) {
      this.setState({
        contactsPhone
      })
    }
    if (addressId !== prevProps.addressId) {
      this.setState({
        addressId
      })
    }
    if (longitude !== prevProps.longitude) {
      this.setState({
        longitude
      })
    }
    if (latitude !== prevProps.latitude) {
      this.setState({
        latitude
      })
    }
    if (type !== prevProps.type) {
      this.setState({
        type
      })
    }
  }
  handleChange = (value, event) => {
    const type = event.mpEvent.target.id;
    const { address, houseNumber, contacts, contactsPhone } = this.state;
    let newAddress = address, newHouseNumber = houseNumber, newContacts = contacts, newContactsPhone = contactsPhone;
    if (type === 'address') {
      this.setState({
        address: value
      })
      newAddress = value;
    } else if (type === 'houseNumber') {
      this.setState({
        houseNumber: value
      })
      newHouseNumber = value;
    } else if (type === 'contacts') {
      this.setState({
        contacts: value
      })
      newContacts = value;
    } else if (type === 'contactsPhone') {
      this.setState({
        contactsPhone: value
      })
      newContactsPhone = value;
    }
    this.setState({
      btnStatus: !(newAddress !== '' && newHouseNumber !== '' && newContacts !== '' && newContactsPhone !== '')
    })
  }
  handleRadioChange = (e) => {
    this.setState({
      sex: e.detail.value === '1' ? '先生' : '女士'
    })
  }
  chooseAddress = () => { //跳转至腾讯选择地点插件
    getLocationInfo().then(res => {
      const { latitude, longitude } = res;
      getAddressInfo(latitude, longitude);
    })
  }
  chooseMyAddress = (params) => { //保存地址或选择地址将地址信息带回上个页面
    const pages = Taro.getCurrentPages(); // 获取当前的页面栈 
    const prevPage = pages[pages.length - 2]; //  获取上一页面
    this.props.saveAndBack ?
    prevPage.setData({ //设置上一个页面的值
      addressParams: params,
      type: this.state.type
    }) : ''
    Taro.navigateBack({
      delta: 1
    });
  }
  Save = () => { //保存地址并将地址信息返回给上个页面
    const { phPattern } = pattern;
    const { addressId, address, houseNumber, contacts, sex, contactsPhone, latitude, longitude } = this.state;
    const addressDetail = address.replace(/\s*/g, "").concat(' ', houseNumber.replace(/\s*/g, ""));
    const contactsName = contacts.concat(sex);
    const { userId, userName, realName } = Taro.getStorageSync('userInfo');
    const params = { addressId, userId, userName, realName, address: addressDetail, contacts: contactsName, contactsPhone, coordinate: JSON.stringify({latitude, longitude}) };
    this.setState({
      loading: true
    })
    if (!phPattern.test(contactsPhone)) {
      Taro.showToast({
        title: '请输入正确的电话号码',
        icon: 'none',
      })
      this.setState({
        loading: false
      })
      return;
    }
    Taro.request({
      url: this.props.update ? 'https://chayuanshiyi.cn:4000/address/update/?' : 'https://chayuanshiyi.cn:4000/address/save/?',
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
        this.chooseMyAddress(params);
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
      <View className='addressInfo'>
        <AtForm>
          <AtInput
            name='address'
            title='地址'
            type='text'
            editable={false}
            value={this.state.address}
            onChange={this.handleChange}
            onClick={this.chooseAddress}
          >
            <Image src={require('../../assets/images/rightArrow.png')} style={{ width: '40rpx', height: '40rpx' }} />
          </AtInput>
          <AtInput
            name='houseNumber'
            title='门牌号'
            type='text'
            placeholder='单元、门牌号，如：4单元301'
            value={this.state.houseNumber}
            onChange={this.handleChange}
          />
          <AtInput
            name='contacts'
            title='联系人'
            type='text'
            placeholder='联系人姓名'
            value={this.state.contacts}
            onChange={this.handleChange}
          >
            <RadioGroup onChange={this.handleRadioChange}>
              <Radio className='radioStyle' color='#6190E8' value='1' checked>先生</Radio>
              <Radio className='radioStyle' color='#6190E8' value='2'>女士</Radio>
            </RadioGroup>
          </AtInput>
          <AtInput
            name='contactsPhone'
            title='电话'
            border={false}
            type='text'
            placeholder='手机号/座机号'
            value={this.state.contactsPhone}
            onChange={this.handleChange}
          />
          <View style={{ marginTop: '12rpx' }}>
            <AtButton type={"primary"} onClick={this.Save} disabled={this.state.btnStatus} loading={this.state.loading}>{this.props.saveAndBack ? '保存并使用' : '保存并返回'}</AtButton>
          </View>
        </AtForm>
      </View>
    )
  }
}

export default AddAddress;