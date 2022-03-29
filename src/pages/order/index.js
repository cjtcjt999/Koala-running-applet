import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, Image } from '@tarojs/components'
import { AtCard, AtTabs, AtTabsPane  } from "taro-ui"
import FooterNav from '../../components/FooterNav/index'
import { connect } from 'react-redux'
import { orderJump } from '../../redux/actions/counter'
import './index.less'

class Order extends Component {
  state = {
    orderList: [],
    qdList: []
  }
  componentDidShow() {
    Taro.startPullDownRefresh();
  }
  onPullDownRefresh() {
    this.getOrder();
    this.getQdOrder();
  }
  getOrder = () => {
    const userId = Taro.getStorageSync('userInfo').userId;
    Taro.request({
      url: 'https://chayuanshiyi.cn:4000/order/dn/get/?',
      method: 'GET',
      data: { userId }
    }).then(res => {
      Taro.stopPullDownRefresh();
      if (res.data.code === 1) {
        this.setState({
          orderList: res.data.data
        })
      } else {
        Taro.showToast({
          title: res.data.msg,
          icon: 'none'
        })
      }
    }, err => {
      Taro.stopPullDownRefresh();
      Taro.showToast({
        title: '网络好像开小差啦',
        icon: 'none'
      })
    })
  }
  getQdOrder = () => {
    const userId = Taro.getStorageSync('userInfo').userId;
    Taro.request({
      url: 'https://chayuanshiyi.cn:4000/order/qd/qdList/get/?',
      method: 'GET',
      data: { userId }
    }).then(res => {
      Taro.stopPullDownRefresh();
      if (res.data.code === 1) {
        this.setState({
          qdList: res.data.data
        })
      } else {
        Taro.showToast({
          title: res.data.msg,
          icon: 'none'
        })
      }
    }, err => {
      Taro.stopPullDownRefresh();
      Taro.showToast({
        title: '网络好像开小差啦',
        icon: 'none'
      })
    })
  }
  handleClick = (value) => {
    if (value === 0) {
      this.props.dispatch(orderJump(0));
      this.getOrder();
    } else {
      console.log(value)
      this.props.dispatch(orderJump(1));
      this.getQdOrder();
    }
  }
  showOrderInfo = (e,entry) => {
    const { 
      id, userId, orderId, takeAddress, takeContacts, takeContactsPhone, takeCoordinate, receiveAddress, receiveContacts,
      receiveContactsPhone, receiveCoordinate, receiptUserId, receiptRealName, receiptPhoneNumber, receiptCoordinate, takeTime, voucher, commodity, remarks, tips, estimatedCost, reallyCost, paymentMethod,
      totalFee, orderTime, orderStatus, type
    } = e;
    Taro.navigateTo({ url: `/pages/order/order_info/index?id=${id}&userId=${userId}&orderId=${orderId}&takeAddress=${takeAddress}&takeContacts=${takeContacts ? takeContacts : ''}&takeContactsPhone=${takeContactsPhone ? takeContactsPhone : ''}&takeCoordinate=${takeCoordinate}&receiveAddress=${receiveAddress}&receiveContacts=${receiveContacts}&receiveContactsPhone=${receiveContactsPhone}&receiveCoordinate=${receiveCoordinate}&receiptUserId=${receiptUserId}&receiptRealName=${receiptRealName}&receiptPhoneNumber=${receiptPhoneNumber}&receiptCoordinate=${receiptCoordinate}&takeTime=${takeTime}&voucher=${voucher}&commodity=${commodity}&remarks=${remarks ? remarks : ''}&tips=${tips}&estimatedCost=${estimatedCost ? estimatedCost : ''}&reallyCost=${reallyCost ? reallyCost : ''}&paymentMethod=${paymentMethod}&totalFee=${totalFee}&orderTime=${orderTime}&orderStatus=${orderStatus}&type=${type}&entry=${entry}` })
  }
  render() {
    const tabList = [{ title: '我的订单' }, { title: '我的抢单' }]
    return (
      <View className='orderPage'>
        <AtTabs current={this.props.orderTab} tabList={tabList} onClick={this.handleClick}>
          <AtTabsPane current={this.props.orderTab} index={0} >
            <View className='tabOne'>
            {
              this.state.orderList.length !== 0 && this.state.orderList.map(item => {
                return <View style={{ position: 'relative', marginTop: '30rpx' }}>
                  <AtCard
                    note={item.orderTime}
                    extra={item.orderStatus}
                    title={item.commodity}
                    renderIcon={<Image className='cardImg' src={item.type === 'DN' ? require('../../assets/images/dn_sign.png'): require('../../assets/images/bm_sign.png')}/>}
                    isFull={true}
                    onClick={() => this.showOrderInfo(item,'myOrder')}
                  >
                    <View className='takeInfo'>
                      <Text className='takeAddress'>{item.takeAddress}</Text>
                      <Text className='takeContacts'>
                        {item.takeContacts && item.takeContacts.concat(' ', item.takeContactsPhone)}
                      </Text>
                      <View className='takeCircle'/>
                    </View>
                    <View className='receiveInfo'>
                      <Text className='receiveAddress'>{item.receiveAddress}</Text>
                      <Text className='receiveContacts'>
                        {item.receiveContacts.concat(' ', item.receiveContactsPhone)}
                      </Text>
                      <View className='receiveCircle'/>
                    </View>
                    {item.type === 'BM' ? <Text className='estimatedCost'>预估商品费:￥{item.estimatedCost}元</Text> : ''}
                    <Text className='totalFee'>跑腿费:<Text style={{ color: '#ff5151' }}>￥{item.totalFee}</Text>元</Text>
                  </AtCard>
                </View>
              })
            }
            {
              this.state.orderList.length === 0 ?
                <View className='noOrder'>
                  <Image src={require('../../assets/images/empty.png')} />
                  <View>您暂无订单，前往首页下单哦</View>
                </View>
                : <Text className='noMore'>没有更多订单了</Text>
            }
            </View>
          </AtTabsPane>
          <AtTabsPane current={this.props.orderTab} index={1}>
          <View className='tabOne'>
            {
              this.state.qdList.length !== 0 && this.state.qdList.map(item => {
                return <View style={{ position: 'relative', marginTop: '30rpx' }}>
                  <AtCard
                    note={item.orderTime}
                    extra={item.orderStatus}
                    title={item.commodity}
                    renderIcon={<Image className='cardImg' src={item.type === 'DN' ? require('../../assets/images/dn_sign.png'): require('../../assets/images/bm_sign.png')}/>}
                    isFull={true}
                    onClick={() => this.showOrderInfo(item,'qdOrder')}
                  >
                    <View className='takeInfo'>
                      <Text className='takeAddress'>{item.takeAddress}</Text>
                      <Text className='takeContacts'>
                        {item.takeContacts && item.takeContacts.concat(' ', item.takeContactsPhone)}
                      </Text>
                      <View className='takeCircle'/>
                    </View>
                    <View className='receiveInfo'>
                      <Text className='receiveAddress'>{item.receiveAddress}</Text>
                      <Text className='receiveContacts'>
                        {item.receiveContacts.concat(' ', item.receiveContactsPhone)}
                      </Text>
                      <View className='receiveCircle'/>
                    </View>
                    {item.type === 'BM' ? <Text className='estimatedCost'>预估商品费:￥{item.estimatedCost}元</Text> : ''}
                    <Text className='totalFee'>跑腿费:<Text style={{ color: '#ff5151' }}>￥{item.totalFee}</Text>元</Text>
                  </AtCard>
                </View>
              })
            }
            {
              this.state.qdList.length === 0 ?
                <View className='noOrder'>
                  <Image src={require('../../assets/images/empty.png')} />
                  <View>您还没有抢过单，前往首页抢单哦</View>
                </View>
                : <Text className='noMore'>没有更多抢单信息了</Text>
            }
            </View>
          </AtTabsPane>
        </AtTabs>
        <FooterNav />
      </View>
    )
  }
}

const mapStateToProps = state => {
  return {
    orderTab: state.orderJump.current
  }
};
export default connect(mapStateToProps, null)(Order);