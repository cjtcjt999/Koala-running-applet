import React, { Component } from 'react'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { View, Text, Image, Map, Button } from '@tarojs/components'
import { AtCard, AtButton, AtModal, AtModalHeader, AtModalContent, AtModalAction, AtInput } from "taro-ui"
import { connect } from 'react-redux'
import { orderJump, tabClick } from '../../../redux/actions/counter'
import { getPolyLinePoint, getLocationInfo } from '../../../utils/getLocationInfo.js'
import './index.less'

class OrderInfo extends Component {
  state = {
    orderInfo: {},
    loading: false,
    loading2: false,
    modalShow: false,
    id: '',
    runnerCoordinate: '',
    longitude: '',
    latitude: '',
    pl: [],
    voucher: ''
  }
  componentDidShow () {
    const userId = Taro.getStorageSync('userInfo').userId;
    const params = getCurrentInstance().router.params;
    if (params.entry === 'qdOrder' && params.orderStatus === '订单进行中') { //如果接单者是当前用户，即我的抢单页面进入的
      this.setRunnerCoordinate(params, params.id)
      this.setRunTimer = setInterval(() => {
        console.log('setRunTimer', params.commodity)
        this.setRunnerCoordinate(params, params.id)
      }, 10000);
    } else if (params.entry === 'myOrder' && params.orderStatus === '订单进行中') { //我的订单订单进行中
      this.getRunnerCoordinate(params, params.id);
      this.getRunTimer = setInterval(() => {
        console.log('getRunTimer', params.commodity)
        this.getRunnerCoordinate(params, params.id);
      }, 10000);
    } else if (params.entry === 'wantQd' && params.orderStatus === '待接单') { //我要抢单
      getLocationInfo().then(res => {
        const { longitude, latitude } = res;
        getPolyLinePoint(params.takeAddress !== '就近购买' ? JSON.parse(params.takeCoordinate) : { latitude, longitude }, JSON.parse(params.receiveCoordinate)).then(pl => {
          this.setState({
            pl,
            longitude,
            latitude
          })
        })
      })
    }
    this.setState({
      orderInfo: params
    })
  }

  componentWillUnmount() {
    clearInterval(this.setRunTimer)
    clearInterval(this.getRunTimer)
  }

  setRunnerCoordinate = (params,id) => {
    getLocationInfo().then(res => {
      const { longitude, latitude } = res;
      Taro.request({
          url: 'http://localhost:3000/order/qd/setCurrCoordinate/?',
          method: 'GET',
          data: { id, receiptCoordinate: { longitude, latitude } }
      }).then(res => {
          if (res.data.code === 1) {
            if (res.data.data.orderStatus === '订单已完成') {
              clearInterval(this.setRunTimer)
            }
            getPolyLinePoint({ latitude, longitude }, params.receiveCoordinate && JSON.parse(params.receiveCoordinate)).then(pl => {
              this.setState({
                pl,
                runnerCoordinate: JSON.parse(res.data.data.receiptCoordinate)
              })
            })
          } else {
            Taro.showToast({
              title: res.data.msg,
              icon: 'none'
            })
          }
        }, err => {
          Taro.showToast({
            title: '网络好像开小差啦',
            icon: 'none'
          })
      })
    })
  }

  getRunnerCoordinate = (params,id) => {
    Taro.request({
      url: 'http://localhost:3000/order/qd/getCurrCoordinate/?',
      method: 'GET',
      data: { id }
    }).then(res => {
      if (res.data.code === 1) {
        if (res.data.data.orderStatus === '订单已完成') {
          Taro.showToast({
            title: '订单已完成',
            icon: 'success'
          })
          Taro.navigateBack({
            delta: 1
          })
          clearInterval(this.getRunTimer)
        }
        getPolyLinePoint(JSON.parse(res.data.data.receiptCoordinate), params.receiveCoordinate && JSON.parse(params.receiveCoordinate)).then(pl => {
          this.setState({
            pl,
            runnerCoordinate: JSON.parse(res.data.data.receiptCoordinate)
          })
        })
      } else {
        Taro.showToast({
          title: res.data.msg,
          icon: 'none'
        })
      }
    }, err => {
      Taro.showToast({
        title: '网络好像开小差啦',
        icon: 'none'
      })
    })
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
    Taro.request({
      url: 'http://localhost:3000/order/qd/receiveOrder/?',
      method: 'GET',
      data: { id: this.state.id, receiptUserId, receiptUserName, receiptRealName, receiptPhoneNumber }
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
  }

  completeOrder = () => { //确认送达
    this.setState({
      modalShow2: true
    })
  }
  
  setVoucher = (value) => {
    this.setState({
      voucher: value
    })
  }

  handleCancel2 = () => {
    this.setState({
      loading2: false,
      modalShow2: false
    })
  }
  handleConfirm2 = () => {
    this.setState({
      loading2: true,
      modalShow2: false
    })
    Taro.request({
      url: 'http://localhost:3000/order/qd/completeOrder/?',
      method: 'GET',
      data: { id: this.state.orderInfo.id, voucher: this.state.voucher }
    }).then(res => {
      this.setState({
        loading2: false
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
        loading2: false
      })
      Taro.showToast({
        title: '网络好像开小差啦',
        icon: 'none'
      })
    })
  }

  render() {
    const { orderInfo } = this.state;
    const userId = Taro.getStorageSync('userInfo').userId;
    const between = { display: 'flex', justifyContent: 'space-between', marginBottom: '12rpx' };
    return (
      <>
        {
          orderInfo.entry === 'wantQd' || orderInfo.orderStatus === '订单进行中' ?
            <View style={{ position: 'fixed', top: '0', width: '100%', height: '350rpx', zIndex: '-1000' }}>
              <Map
                style={{ width: '100%', height: '100%' }}
                showLocation={orderInfo.entry !== 'qdOrder'}
                longitude={orderInfo.takeAddress === '就近购买' && orderInfo.entry === 'wantQd' ? 
                            this.state.longitude
                            : 
                            orderInfo.takeAddress !== '就近购买' && orderInfo.entry === 'wantQd' ?
                              orderInfo.takeCoordinate && JSON.parse(orderInfo.takeCoordinate).longitude
                              : this.state.runnerCoordinate.longitude || ''}
                latitude={orderInfo.takeAddress === '就近购买' && orderInfo.entry === 'wantQd' ? 
                            this.state.latitude
                            : 
                            orderInfo.takeAddress !== '就近购买' && orderInfo.entry === 'wantQd' ?
                              orderInfo.takeCoordinate && JSON.parse(orderInfo.takeCoordinate).latitude
                              : this.state.runnerCoordinate.latitude || ''}
                polyline={[{
                  points: this.state.pl,
                  color: "#FA6400",
                  width: 10,
                  arrowLine: true,
                  borderWidth: 2 //线的边框宽度，还有很多参数，请看文档
                }]}
                markers={[{
                  id: 0,
                  title:'骑手',
                  iconPath: require('../../../assets/images/distributor.png'),
                  latitude: 
                    orderInfo.takeAddress === '就近购买' && orderInfo.entry === 'wantQd' ?
                      this.state.latitude
                      :
                      orderInfo.takeAddress !== '就近购买' && orderInfo.entry === 'wantQd' ?
                        orderInfo.takeCoordinate && JSON.parse(orderInfo.takeCoordinate).latitude
                        : this.state.runnerCoordinate.latitude || ''
                  ,
                  longitude: 
                    orderInfo.takeAddress === '就近购买' && orderInfo.entry === 'wantQd' ?
                      this.state.longitude
                      :
                      orderInfo.takeAddress !== '就近购买' && orderInfo.entry === 'wantQd' ?
                        orderInfo.takeCoordinate && JSON.parse(orderInfo.takeCoordinate).longitude
                        : this.state.runnerCoordinate.longitude || ''
                  ,
                  width: 40,
                  height: 40
                }]}
              />
            </View>
            :
            ''
        }
        <View className='orderInfo' style={{ marginTop: orderInfo.entry === 'wantQd' || orderInfo.orderStatus === '订单进行中' ? '350rpx' : 'unset' }}>
          <Text style={{ fontSize: '40rpx', fontWeight: 'bold', marginTop: '28rpx', display: 'inline-block' }}>
            {orderInfo.orderStatus}
          </Text>
          <View className='card' style={{ marginTop: '30rpx' }}>
            <AtCard
              title={orderInfo.commodity}
              renderIcon={<Image className='cardImg' src={orderInfo.type === 'DN' ? require('../../../assets/images/dn_sign.png') : require('../../../assets/images/bm_sign.png')} />}
              isFull={true}
            >
              <View className='takeInfo'>
                <Text className='takeAddress'>{orderInfo.takeAddress}</Text>
                <Text className='takeContacts'>
                  {orderInfo.takeContacts && orderInfo.takeContacts.concat(' ', orderInfo.takeContactsPhone)}
                </Text>
                <View className='takeCircle' />
              </View>
              <View className='receiveInfo'>
                <Text className='receiveAddress'>{orderInfo.receiveAddress}</Text>
                <Text className='receiveContacts'>
                  {orderInfo.receiveContacts && orderInfo.receiveContacts.concat(' ', orderInfo.receiveContactsPhone)}
                </Text>
                <View className='receiveCircle' />
              </View>
              {orderInfo.type === 'BM' ? <Text className='estimatedCost'>预估商品费:￥{orderInfo.estimatedCost}元</Text> : ''}
            </AtCard>
          </View>
          { 
            orderInfo.orderStatus === '订单进行中' && orderInfo.entry === 'myOrder' ?
              <View className='card'>
                <AtCard
                  title='收件凭证'
                  isFull={true}
                >
                  <View style={between}>
                    <Text style={{ color: '#a5a5a5' }}>收件凭证</Text>
                    <Text style={{ color: '#0c2afd' }}>{orderInfo.voucher}</Text>
                  </View>
                </AtCard>
              </View>
              :
              ''
          }
          { 
            orderInfo.orderStatus !== '待接单' && orderInfo.entry === 'myOrder' ?
              <View className='card'>
                <AtCard
                  title='配送者信息'
                  isFull={true}
                >
                  <View style={between}>
                    <Text style={{ color: '#a5a5a5' }}>配送者电话</Text>
                    <Text style={{ color: '#0c2afd' }}>{orderInfo.receiptPhoneNumber}</Text>
                  </View>
                </AtCard>
              </View>
              :
              ''
          }
          {
            orderInfo.type === 'BM' ?
              <View className='card'>
                <AtCard
                  title='帮买商品清单'
                  isFull={true}
                >
                  <View style={between}>
                    <Text style={{ color: '#a5a5a5', flex: '1' }}>商品</Text>
                    <Text style={{ flex: '2', textAlign: 'right' }}>{orderInfo.commodity}</Text>
                  </View>
                </AtCard>
              </View>
              :
              ''
          }
          <View className='card'>
            <AtCard
              title='订单需求'
              isFull={true}
            >
              <View style={between}>
                <Text style={{ color: '#a5a5a5' }}>取件时间</Text>
                <Text>{orderInfo.takeTime}</Text>
              </View>
              <View style={between}>
                <Text style={{ color: '#a5a5a5' }}>备注</Text>
                <Text>{orderInfo.remarks}</Text>
              </View>
            </AtCard>
          </View>
          {
            orderInfo.entry === 'myOrder' ?
              <View className='card'>
                <AtCard
                  title='实付款'
                  isFull={true}
                >
                  <View style={between}>
                    <Text style={{ color: '#a5a5a5' }}>跑腿费</Text>
                    <Text>￥{orderInfo.totalFee}</Text>
                  </View>
                  {
                    orderInfo.reallyCost ?
                      <View style={between}>
                        <Text style={{ color: '#a5a5a5' }}>实付商品费</Text>
                        <Text>￥{orderInfo.reallyCost}</Text>
                      </View>
                      :
                      ''
                  }
                  <View style={{ textAlign: 'right', marginTop: '40rpx' }}>
                    <Text>合计</Text>
                    <Text style={{ fontSize: '36rpx', fontWeight: 'bold' }}>￥{Number(orderInfo.totalFee) + (Number(orderInfo.reallyCost) || 0)}</Text>
                  </View>
                </AtCard>
              </View>
              :
              <View className='card'>
                <AtCard
                  title='预计本单获得收入'
                  isFull={true}
                >
                  <View style={between}>
                    <Text style={{ color: '#a5a5a5' }}>跑腿费</Text>
                    <Text>￥{orderInfo.totalFee}</Text>
                  </View>
                  <View style={{ textAlign: 'right', marginTop: '40rpx', color: '#ff5d0f' }}>
                    <Text>合计</Text>
                    <Text style={{ fontSize: '36rpx', fontWeight: 'bold' }}>￥{Number(orderInfo.totalFee)}</Text>
                  </View>
                </AtCard>
              </View>
          }
          <View className='card'>
            <AtCard
              title='订单信息'
              isFull={true}
            >
              <View style={between}>
                <Text style={{ color: '#a5a5a5' }}>配送服务</Text>
                <Text>考拉跑腿服务</Text>  
              </View> 
              <View style={between}>
                <Text style={{ color: '#a5a5a5' }}>订单号码</Text>
                <Text>{orderInfo.orderId}</Text>
              </View>
              <View style={between}>
                <Text style={{ color: '#a5a5a5' }}>下单时间</Text>
                <Text>{orderInfo.orderTime}</Text>
              </View>
              <View style={between}>
                <Text style={{ color: '#a5a5a5' }}>支付方式</Text>
                <Text>{orderInfo.paymentMethod}</Text>
              </View>
            </AtCard>
          </View>
          {
            orderInfo.entry === 'wantQd' ?
            <View style={{ marginTop: '160rpx' }}/>
            :
            ''
          }
          {
            orderInfo.entry === 'wantQd' ?
              <View className='qdButton'>
                <AtButton type={"primary"} onClick={() => this.qdClick(orderInfo.id)} loading={this.state.loading}>抢单</AtButton>
              </View>
              :
              ''
          }
          {
            orderInfo.entry === 'qdOrder' && orderInfo.orderStatus === '订单进行中' ?
            <View style={{ marginTop: '160rpx' }}/>
            :
            ''
          }
          {
            orderInfo.entry === 'qdOrder' && orderInfo.orderStatus === '订单进行中' ?
              <View className='qdButton'>
                <AtButton type={"primary"} onClick={() => this.completeOrder(orderInfo.id)} loading={this.state.loading2}>确认送达</AtButton>
              </View>
              :
              ''
          }
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
        <AtModal isOpened={this.state.modalShow2}>
          <AtModalHeader>请输入收件凭证</AtModalHeader>
          <AtModalContent>
            <View style={{ display: this.state.modalShow2 ? 'block' : 'none' }}>
              <AtInput
                name='voucher'
                type='number'
                placeholder='输入收件人当面提供的凭证'
                value={this.state.voucher}
                onChange={this.setVoucher}
              />
            </View>
          </AtModalContent>
          <AtModalAction> <Button onClick={this.handleCancel2}>取消</Button> <Button onClick={this.handleConfirm2}>确定</Button> </AtModalAction>
        </AtModal>
      </>
    )
  }
}

export default connect()(OrderInfo);