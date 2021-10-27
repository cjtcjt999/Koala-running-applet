import React, { Component } from 'react'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import AddAddress from '../../../../components/addAddress/index'

class AddAddressPage extends Component {
  state = {
    address: ''
  }
  componentDidShow() {
    const params = getCurrentInstance().router.params;
    console.log('褚锦涛', params)
    const chooseLocation = requirePlugin('chooseLocation'); //获取腾讯选择地址插件点击确定返回的结果对象
    const location = chooseLocation.getLocation(); // 如果点击确认选点按钮，则返回选点结果对象，否则返回null
    if (params.update === 'true') {
      Taro.setNavigationBarTitle({
        title: '修改地址'
      })
    }
    this.setState({
      addressId: params.id,
      address: location ? location.name : params.address,
      latitude: location ? location.latitude : params.latitude,
      longitude: location ? location.longitude : params.longitude,
      houseNumber: params.houseNumber,
      contacts: params.contacts,
      contactsPhone: params.contactsPhone,
      update: params.update === 'true'
    })
  }
  render() {
    const { addressId, address, houseNumber, contacts, contactsPhone, update, latitude, longitude } = this.state;
    return (
      <AddAddress
        addressId={addressId}
        address={address}
        latitude={latitude}
        longitude={longitude}
        houseNumber={houseNumber}
        contacts={contacts}
        contactsPhone={contactsPhone}
        update={update}
      />
    )
  }
}

export default AddAddressPage;