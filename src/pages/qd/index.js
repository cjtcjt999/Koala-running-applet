import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, Image } from '@tarojs/components'
import { AtCard, AtButton, AtModal } from "taro-ui"
import { connect } from 'react-redux'
import { orderJump, tabClick } from '../../redux/actions/counter'
import { getLocationInfo } from '../../utils/getLocationInfo.js'
import './index.less'

class Qd extends Component {
  state = {
    loading: false,
    modalShow: false,
    id: ''
  }
  showOrderInfo = (e, entry) => {
    const {
      id, userId, orderId, takeAddress, takeContacts, takeContactsPhone, takeCoordinate, receiveAddress, receiveContacts,
      receiveContactsPhone, receiveCoordinate, takeTime, commodity, remarks, tips, estimatedCost, reallyCost, paymentMethod,
      totalFee, orderTime, orderStatus, type
    } = e;
    Taro.navigateTo({ url: `/pages/order/order_info/index?id=${id}&userId=${userId}&orderId=${orderId}&takeAddress=${takeAddress}&takeContacts=${takeContacts ? takeContacts : ''}&takeContactsPhone=${takeContactsPhone ? takeContactsPhone : ''}&takeCoordinate=${takeCoordinate}&receiveAddress=${receiveAddress}&receiveContacts=${receiveContacts}&receiveContactsPhone=${receiveContactsPhone}&receiveCoordinate=${receiveCoordinate}&takeTime=${takeTime}&commodity=${commodity}&remarks=${remarks ? remarks : ''}&tips=${tips}&estimatedCost=${estimatedCost ? estimatedCost : ''}&reallyCost=${reallyCost ? reallyCost : ''}&paymentMethod=${paymentMethod}&totalFee=${totalFee}&orderTime=${orderTime}&orderStatus=${orderStatus}&type=${type}&entry=${entry}` })
  }
  qdClick = (id) => {
    this.setState({
      loading: true,
      modalShow: true,
      id: id
    })
  }
  handleClose = () => {
    this.setState({
      loading: false,
      modalShow: false
    })
  }
  handleCancel = () => {
    this.setState({
      loading: false,
      modalShow: false
    })
  }
  handleConfirm = () => {
    this.setState({
      modalShow: false
    })
    const { userId: receiptUserId, userName: receiptUserName, realName: receiptRealName, phoneNumber: receiptPhoneNumber } = Taro.getStorageSync('userInfo');
    getLocationInfo().then(res => {
      const { longitude, latitude } = res;
      Taro.request({
        url: 'http://localhost:3000/order/qd/receiveOrder/?',
        method: 'GET',
        data: { id: this.state.id, receiptUserId, receiptUserName, receiptRealName, receiptPhoneNumber, receiptCoordinate: { longitude, latitude } }
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
            this.props.dispatch(orderJump(1));
            this.props.dispatch(tabClick(1));
            Taro.switchTab({ url: '/pages/order/index' })
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
    })
  }
  render() {
    return (
      <View className='qdPage'>
        <View className='tabOne'>
          {
            this.props.orderList.length !== 0 && this.props.orderList.map(item => {
              return <View style={{ position: 'relative', marginTop: '30rpx' }}>
                <AtCard
                  note={item.orderTime}
                  extra={item.orderStatus}
                  title={item.commodity}
                  renderIcon={<Image className='cardImg' src={item.type === 'DN' ? require('../../assets/images/dn_sign.png') : require('../../assets/images/bm_sign.png')} />}
                  isFull={true}
                  onClick={() => this.showOrderInfo(item,'wantQd')}
                >
                  <View className='takeInfo'>
                    <Text className='takeAddress'>{item.takeAddress}</Text>
                    <Text className='takeContacts'>
                      {item.takeContacts && item.takeContacts.concat(' ', item.takeContactsPhone)}
                    </Text>
                    <View className='takeCircle' />
                  </View>
                  <View className='receiveInfo'>
                    <Text className='receiveAddress'>{item.receiveAddress}</Text>
                    <Text className='receiveContacts'>
                      {item.receiveContacts.concat(' ', item.receiveContactsPhone)}
                    </Text>
                    <View className='receiveCircle' />
                  </View>
                  {item.type === 'BM' ? <Text className='estimatedCost'>预计垫付商品费:￥{item.estimatedCost}元</Text> : ''}
                  <Text className='totalFee'>预计获得收入:<Text style={{ color: '#ff5151' }}>￥{item.totalFee}</Text>元</Text>
                </AtCard>
                <View style={{ background: '#fff', padding: '4px 20rpx 20rpx 20rpx;' }}>
                  <AtButton type={"primary"} onClick={() => this.qdClick(item.id)} loading={this.state.loading}>抢单</AtButton>
                </View>
              </View>
            })
          }
          {
            this.props.orderList.length === 0 ?
              <View className='noOrder'>
                <Image src={require('../../assets/images/empty.png')} />
                <View>您暂无订单，前往首页下单哦</View>
              </View>
              : <Text className='noMore'>没有更多订单了</Text>
          }
        </View>
        <AtModal
          isOpened={this.state.modalShow}
          title='是否确定接收此单任务？'
          cancelText='取消'
          confirmText='确认'
          onClose={this.handleClose}
          onCancel={this.handleCancel}
          onConfirm={this.handleConfirm}
        />
      </View>
    )
  }
}

export default connect()(Qd);