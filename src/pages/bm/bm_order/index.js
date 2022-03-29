import React, { Component } from 'react'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { View, Text, Picker, Image, Radio, RadioGroup } from '@tarojs/components'
import { AtInput, AtIcon, AtTextarea, AtTabBar, AtFloatLayout, AtButton } from 'taro-ui'
import { hourList, minuteList } from '../../../config/timeList'
import { commodityList } from '../../../config/commodityList'
import { getLocationInfo, getAddressInfo } from '../../../utils/getLocationInfo'
import { connect } from 'react-redux'
import { orderJump, tabClick } from '../../../redux/actions/counter'
import './index.less'

class Bm_order extends Component {
  state = {
    receiveAddress: '',
    receiveContacts: '',
    receiveContactsPhone: '',
    takeAddress: '',
    takeCoordinate: '',
    remModalShow: false,
    tipsModalShow: false,
    estModalShow: false,
    takeTime: '立即取件',
    selector: [hourList, minuteList[0]],
    commodityType: '商品',
    commodityList: commodityList[99],
    commodity: '',
    remarks: '',
    tipsCurrent: 0,
    showOtherTips: false,
    tips: '',
    otherTips: '',
    paymentMethod: '微信支付',
    showAppointAddress: true,
    estimatedCost: '',
    price: '',
    totalFee: 2,
  }
  componentDidShow () {
    const pages = Taro.getCurrentPages();
    const currPage = pages[pages.length - 1]; // 获取当前页面
    const { addressParams } = currPage.__data__;// 获取值
    if (addressParams) {
      this.setState({
        receiveAddress: addressParams.address,
        receiveContacts: addressParams.contacts,
        receiveContactsPhone: addressParams.contactsPhone,
        receiveCoordinate: addressParams.coordinate,
      })
    }
    const params = getCurrentInstance().router.params;//获取帮买页面标签
    const commodityType = {
      0: '日用',
      1: '饮料',
      2: '小吃',
      3: '文具',
      4: '奶茶',
      5: '药品',
      6: '酒水',
      7: '果蔬'
    }
    if (params.type) {
      this.setState({
        commodityType: commodityType[params.type],
        commodityList: commodityList[params.type]
      })
    }
    //获取在插件中选择好的地址
    const chooseLocation = requirePlugin('chooseLocation'); //获取腾讯选择地址插件点击确定返回的结果对象
    const location = chooseLocation.getLocation(); // 如果点击确认选点按钮，则返回选点结果对象，否则返回null
    location ? 
      this.setState({
        takeAddress: location && location.name,
        takeCoordinate: JSON.stringify({latitude: location.latitude,longitude: location.longitude})
      })
    : ''
  }
  getAddressInfo = () => {
    Taro.navigateTo({ url: '/pages/userInfo/address/index?shouldBack=true' })
  }
  //取件时间
  pickerChange = e => {
    this.setState({
      takeTime: this.state.selector[0][e.detail.value[0]] + (this.state.selector[1][e.detail.value[1]] && ':' + this.state.selector[1][e.detail.value[1]])
    })
  }
  onColumnChange = e => { //2B时间选择器，手写的级联关系
    const { newTimeColumn } = this.state;
    if (e.detail.column === 0) {
      const _this = this;
      const hour = e.detail.value;
      _this.setState({
        selector: hour === 0 ? [newTimeColumn, minuteList[0]] : [newTimeColumn, minuteList[1]]
      })
    }
  }
  setNewTime = () => {
    const nowHour = new Date().getHours();
    const newTimeColumn = ['立即取件'];
    hourList.map(item => {
      if (item > nowHour) {
        newTimeColumn.push(item);
      }
    })
    this.setState({
      newTimeColumn: newTimeColumn,
      selector: [newTimeColumn, minuteList[0]]
    })
  }
  setCommodity = (value) => {
    this.setState({
      commodity: value
    })
  }
  //备注保存
  setRemarks = () => {
    this.setState({
      remarks: this.state.remarksChange || '',
      remModalShow: false
    })
  }
  //小费保存
  setTips = () => {
    const tipsList = { 0: '', 1: '￥1', 2: '￥2', 3: '￥5', 4: '￥10', 5: '￥15', 6: '￥20', 7: '￥25', 8: this.state.otherTips ? `￥${this.state.otherTips}` : '' };
    this.setState({
      tips: tipsList[this.state.tipsCurrent],
      totalFee: 2 + Number(tipsList[this.state.tipsCurrent].slice(1)),
      tipsModalShow: false
    })
  }
  handleRadioChange = (e) => {
    const value = e.detail.value;
    if (value === '1') {
      this.setState({
        showAppointAddress: true,
        takeAddress: ''
      })
    } else {
      this.setState({
        showAppointAddress: false,
        takeCoordinate: '',
        takeAddress: '就近购买'
      })
    }
  }
  //选择指定地址，跳转到插件
  chooseAppointAdderss = () => {
    getLocationInfo().then(res => {
      const { latitude, longitude } = res;
      getAddressInfo(latitude, longitude);
    })
  }
  //预估商品费保存
  setEstCost = () => {
    this.setState({
      estimatedCost: '￥' + this.state.price,
      estModalShow: false
    })
  }
  //提交订单
  onSubmit = () => {
    const {
      takeAddress, takeCoordinate, receiveAddress, receiveContacts,
      receiveContactsPhone, receiveCoordinate, takeTime, commodity, remarks, tips, paymentMethod, estimatedCost, totalFee
    } = this.state;
    const { userId, userName, realName } = Taro.getStorageSync('userInfo');
    const params = {
      userId, userName, realName, takeAddress, takeCoordinate, receiveAddress, receiveContacts,
      receiveContactsPhone, receiveCoordinate, takeTime, commodity, remarks, tips: Number(tips.slice(1)),
      estimatedCost: Number(estimatedCost.slice(1)), paymentMethod, totalFee, orderStatus: '待接单', type: 'BM'
    };
    if (!commodity) {
      Taro.showToast({
        title: '请填写物品信息',
        icon: 'none'
      })
      return;
    }
    if (!takeAddress) {
      Taro.showToast({
        title: '请选择购买地址',
        icon: 'none'
      })
      return;
    }
    if (!receiveAddress) {
      Taro.showToast({
        title: '请选择收货地址',
        icon: 'none'
      })
      return;
    }
    if (!estimatedCost) {
      Taro.showToast({
        title: '请输入预估商品费',
        icon: 'none'
      })
      return;
    }
    if (takeCoordinate === receiveCoordinate) {
      Taro.showToast({
        title: '您的取件地址与收件地址相同，请重新选择',
        icon: 'none'
      })
      return;
    }
    this.setState({
      loading: true
    })
    Taro.request({
      url: 'https://chayuanshiyi.cn:4000/order/dn/save/?',
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
        setTimeout(() => {
          Taro.switchTab({ url: '/pages/order/index' })
          this.props.dispatch(tabClick(1));
          this.props.dispatch(orderJump(0));
          this.setState(
            this.initialState
          )
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
        <View className='bm_order'>
          <View className='line' onClick={this.getAddressInfo}>
            <View style={{ display: 'flex' }}>
              <View>
                <AtIcon value='map-pin' size='18' color='#000'/>
              </View>
              <View style={{ marginLeft: '12rpx' }}>
                <View>{this.state.receiveAddress || '请选择收货地址'}</View>
                <View style={{ fontSize: '24rpx' }}>
                  {this.state.receiveAddress ? this.state.receiveContacts + ' ' + this.state.receiveContactsPhone : <Text style={{ color: '#ff5151' }}>填写联系人</Text>}
                </View>
              </View>
            </View>
            <View>
              <AtIcon value='chevron-right' size='18' color='#000' />
            </View>
          </View>
          <Picker
            mode='multiSelector'
            range={this.state.selector}
            onColumnChange={this.onColumnChange}
            onChange={this.pickerChange}
            onClick={this.setNewTime}
          >
            <View className='line'style={{ marginTop: '20rpx' }}>
              <View style={{ display: 'flex' }}>
                <View className='clockIcon'>
                  <AtIcon value='clock' size='15' color='#000' />
                </View>
                <View style={{ marginLeft: '12rpx' }}>
                  <View>{this.state.takeTime}</View>
                </View>
              </View>
              <View>
                <AtIcon value='chevron-right' size='18' color='#000' />
              </View>
            </View>
          </Picker>
          <View style={{ position: 'relative', marginTop: '30rpx' }}>
            <Text className='commodityTitle'>填写想代购的{this.state.commodityType}</Text>
            <AtTextarea
              count={false}
              value={this.state.commodity}
              onChange={this.setCommodity}
              maxLength={60}
              height={400}
              placeholder='点击输入你的商品要求，例如：苹果数据线1条'
            />
            <View className='commodityLabel'>
              <AtTabBar
                tabList={this.state.commodityList}
                onClick={(value) => {
                  this.setState({
                    commodity: this.state.commodity + ' ' + this.state.commodityList[value].title
                  })
                }}
              />
            </View>
          </View>
          <View className='orderInfo'>
            <View>
              <View className='takeLine'>
                <Text>购买地址</Text>
                <RadioGroup onChange={this.handleRadioChange}>
                  <Radio className='radioStyle' color='#6190E8' value='1' checked>指定地址</Radio>
                  <Radio className='radioStyle' color='#6190E8' value='2'>就近购买</Radio>
                </RadioGroup>
              </View>
              <View style={{ display: this.state.showAppointAddress ? 'block' : 'none' }} onClick={this.chooseAppointAdderss}>
                <AtInput
                  name='takeAddress'
                  type='text'
                  editable={false}
                  placeholder='请选择购买地址'
                  value={this.state.takeAddress}
                >
                  <Image src={require('../../../assets/images/rightArrow.png')} style={{ width: '40rpx', height: '40rpx' }} />
                </AtInput>
              </View>
            </View>
            <AtInput
              name='remarks'
              title='备注'
              type='text'
              editable={false}
              placeholder='物品描述、送件要求等'
              value={this.state.remarks}
              onClick={() => {
                this.setState({
                  remModalShow: true
                })
              }}
            >
              <Image src={require('../../../assets/images/rightArrow.png')} style={{ width: '40rpx', height: '40rpx' }} />
            </AtInput>
          </View>
          <View className='orderInfo'>
            <AtInput
              name='estimatedCost'
              title='预估商品费'
              type='text'
              editable={false}
              placeholder='预估价格'
              value={this.state.estimatedCost}
              onClick={() => {
                this.setState({
                  estModalShow: true
                })
              }}
            >
              <Image src={require('../../../assets/images/rightArrow.png')} style={{ width: '40rpx', height: '40rpx' }} />
            </AtInput>
            <AtInput
              name='tips'
              title='小费'
              type='text'
              editable={false}
              placeholder='加小费抢单更快哦'
              value={this.state.tips}
              onClick={() => {
                this.setState({
                  tipsModalShow: true
                })
              }}
            >
              <Image src={require('../../../assets/images/rightArrow.png')} style={{ width: '40rpx', height: '40rpx' }} />
            </AtInput>
            <AtInput
              name='paymentMethod'
              title='支付方式'
              type='text'
              editable={false}
              value={this.state.paymentMethod}
              onClick={this.setPaymentMethod}
            >
              <Image src={require('../../../assets/images/rightArrow.png')} style={{ width: '40rpx', height: '40rpx' }} />
            </AtInput>
          </View>
        </View>
        <View className='bottomLine' style={{ display: 'flex' , alignItems: 'center' }}>
          <View style={{ paddingLeft: '16rpx' }}>
            <View style={{ display: 'inline-block', fontSize: '30rpx', fontWeight: 'bold' }}>跑腿费</View>
            <View style={{ display: 'inline-block', fontSize: '36rpx', fontWeight: 'bold', color: '#ff5151', marginLeft: '10rpx' }}>{`￥${this.state.totalFee}`}</View>
          </View>
          <View style={{ position: 'absolute', right: '0', height: '100%' }}>
            <AtButton type={"primary"} full={true} onClick={this.onSubmit}>提交订单</AtButton>
          </View>
        </View>
        <View style={{ position: 'absolute', top: '0', zIndex: '-10', height: '100vh', width: '100%', background: 'linear-gradient(to bottom, #4e9dff, #f3f3f3 30%)' }}/>
        <View className='floatLayout'>
          <AtFloatLayout
            isOpened={this.state.remModalShow}
            title="备注"
            onClose={() => {
              this.setState({
                remModalShow: false
              })
            }}>
            <View style={{ marginTop: '20rpx' }}>
              <AtTextarea
                value={this.state.remarksChange}
                onChange={(value) => {
                  this.setState({
                    remarksChange: value
                  })
                }}
                maxLength={50}
                height={230}
                placeholder='可输入物品描述或送检要求'
              />
            </View>
            <View style={{ marginTop: '50rpx' }}>
              <AtButton type={"primary"} onClick={this.setRemarks}>确定</AtButton>
            </View>
          </AtFloatLayout>
          <AtFloatLayout
            isOpened={this.state.tipsModalShow}
            title="加小费"
            onClose={() => {
              this.setState({
                tipsModalShow: false
              })
            }}>
            <AtTabBar
              tabList={[
                { title: '不加了' },
                { title: '￥1' },
                { title: '￥2' },
                { title: '￥5' },
                { title: '￥10' },
                { title: '￥15' },
                { title: '￥20' },
                { title: '￥25' },
                { title: '其他金额' }
              ]}
              onClick={(value) => {
                this.setState({
                  tipsCurrent: value,
                  showOtherTips: value === 8
                })
              }}
              current={this.state.tipsCurrent}
            />
            {this.state.showOtherTips ?
              <AtInput
                name='otherTips'
                title='小费'
                type='number'
                placeholder='最高100元'
                value={this.state.otherTips}
                onChange={(value) => {
                  const val = Number(value);
                  if (isNaN(val) === true || val > 100 || val <= 0 || (value.indexOf('.') !== -1 && value.split('.')[1].length > 2)) {
                    this.setState({
                      otherTips: ''
                    })
                    return;
                  }
                  this.setState({
                    otherTips: value
                  })
                }}
              /> : ''}
            <View style={{ marginTop: '36rpx' }}>
              <AtButton type={"primary"} onClick={this.setTips}>确定</AtButton>
            </View>
          </AtFloatLayout>
          <AtFloatLayout
            isOpened={this.state.estModalShow}
            title="预估商品费"
            onClose={() => {
              this.setState({
                estModalShow: false
              })
            }}>
              <Text style={{ fontSize: '24rpx' }}>实际商品费在骑手购买完成后可通过考拉跑腿支付</Text>
              <View className='priceModal'>
                <AtInput
                  name='price'
                  title='￥'
                  type='number'
                  placeholder='最高可代购500元的商品'
                  value={this.state.price}
                  onChange={(value) => {
                    const val = Number(value);
                    if (isNaN(val) === true || val > 500 || val <= 0 || (value.indexOf('.') !== -1 && value.split('.')[1].length > 2)) {
                      this.setState({
                        price: ''
                      })
                      return;
                    }
                    this.setState({
                      price: value
                    })
                  }}
                />
              </View>
            <View style={{ marginTop: '36rpx' }}>
              <AtButton type={"primary"} onClick={this.setEstCost}>确定</AtButton>
            </View>
          </AtFloatLayout>
        </View>
      </>
    )
  }
}
export default connect()(Bm_order);