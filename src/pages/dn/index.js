import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { $ } from '@tarojs/extend'
import { Map, View, Text, Image, Picker } from '@tarojs/components'
import { AtList, AtListItem, AtInput, AtFloatLayout, AtTabBar, AtSlider, AtButton, AtTextarea  } from 'taro-ui'
import { hourList, minuteList } from '../../config/timeList'
import { getLocationInfo } from '../../utils/getLocationInfo'
import { connect } from 'react-redux'
import { orderJump, tabClick } from '../../redux/actions/counter'
import './index.less'

class Dn extends Component {
  initialState = {
    longitude: '',
    latitude: '',
    takeAddress: '请选择取件地址',
    takeContacts: '填写联系人',
    takeContactsPhone: '',
    receiveAddress: '',
    receiveContacts: '填写联系人',
    receiveContactsPhone: '',
    selector: [hourList, minuteList[0]],
    takeTime: '立即取件',
    orderInfoShow: false,
    commodity: '',
    remarks: '',
    tips: '',
    paymentMethod: '微信支付',
    comModalShow: false,
    typeCurrent: 0,
    valCurrent: 0,
    weiCurrent: 0.5,
    remModalShow: false,
    tipsModalShow: false,
    tipsCurrent: 0,
    showOtherTips: false,
    otherTips: '',
    totalFee: 2,
    loading: false
  }
  state = this.initialState;

  componentWillMount() {
    getLocationInfo().then(res=>{
      const { longitude, latitude, takeAddress } = res;
      this.setState({
        longitude,
        latitude,
        takeAddress
      })
    })
  }
  async componentDidUpdate(preProps, preState) {
    const { address, contacts, contactsPhone, coordinate } = this.props.addressParams;
    const { takeContactsPhone, receiveContactsPhone } = this.state;
    if (preProps.addressParams !== this.props.addressParams) {
      if (this.props.type === 'take') {
        this.setState({
          takeAddress: address,
          takeContacts: contacts,
          takeContactsPhone: contactsPhone,
          takeCoordinate: coordinate
        })
      } else {
        this.setState({
          receiveAddress: address,
          receiveContacts: contacts,
          receiveContactsPhone: contactsPhone,
          receiveCoordinate: coordinate
        })
      }
    }
    if ((preState.takeContactsPhone !== takeContactsPhone || preState.receiveContactsPhone !== receiveContactsPhone)
          && takeContactsPhone && receiveContactsPhone) {
      const takeHeight = await $('.takeInfo').height();
      const receiveHeight = await $('.receiveInfo').height();
      const Dnheight = await $('.DnInfo').height();
      const otherHeight = Dnheight - takeHeight - receiveHeight - 112;
      this.setState({
        orderHeight: `${otherHeight}px`,
        orderInfoShow: true
      })
    }
  }
  getAddressInfo = (type) => {
    const _this = this;
    // Taro.navigateTo({
    //     url: '/pages/addressInfo/index',
    //     success: function (res) {
    //       // 通过eventChannel向被打开页面传送数据
    //       res.eventChannel.emit('acceptDataFromOpenerPage', { takeAddress: _this.state.takeAddress, type, longitude: _this.state.longitude, latitude: _this.state.latitude })
    //     }
    // });
    Taro.navigateTo({ url: `/pages/addressInfo/index?takeAddress=${_this.state.takeAddress}&type=${type}&longitude=${_this.state.longitude}&latitude=${_this.state.latitude}` })
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
  //物品信息
  setWeight = (e) => {
    let comWeight = e + '斤'
    this.setState({
      weiCurrent: e
    })
  }
  //物品信息保存
  setCommodity = () => {
    const comTypeList = { 0: '餐饮', 1: '文件', 2: '生鲜', 3: '蛋糕', 4: '鲜花', 5: '钥匙', 6: '数码', 7: '服饰', 8: '其他' };
    const comValueList = { 0: '50元以下', 1: '50-150元', 2: '150-300元', 3: '300-1000元', 4: '1000-1500元', 5: '1500-3000元' };
    const { typeCurrent, valCurrent, weiCurrent } = this.state;
    let comType = comTypeList[typeCurrent], comValue = comValueList[valCurrent], comWeight = weiCurrent + '斤';
    let commodity = comType + '、' + comValue + '、' + comWeight;
    console.log(commodity);
    this.setState({
      commodity,
      comModalShow: false
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
  //提交订单
  onSubmit = () => {
    const {
      takeAddress, takeContacts, takeContactsPhone, takeCoordinate, receiveAddress, receiveContacts,
      receiveContactsPhone, receiveCoordinate, takeTime, commodity, remarks, tips, paymentMethod, totalFee
    } = this.state;
    console.log('褚锦涛', takeCoordinate, receiveCoordinate)
    const { userId, userName, realName } = Taro.getStorageSync('userInfo');
    const params = {
      userId, userName, realName, takeAddress, takeContacts, takeContactsPhone, receiveAddress, receiveContacts,
      receiveContactsPhone, takeTime, commodity, remarks, tips: Number(this.state.tips.slice(1)),
      paymentMethod, totalFee, takeCoordinate, receiveCoordinate, orderStatus: '待接单', type: 'DN'
    };
    if (!commodity) {
      Taro.showToast({
        title: '请填写物品信息',
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
    const {
      longitude,
      latitude,
      orderInfoShow,
      takeAddress,
      takeContacts,
      takeContactsPhone,
      receiveAddress,
      receiveContacts,
      receiveContactsPhone
    } = this.state;
    return (
      <View className='DnContainer'>
        <Map 
          style={{ width: '100%', height: '100%' }}
          longitude={longitude}
          latitude={latitude}
          showLocation={true}
        >
        </Map>
        <View className='DnInfo' style={orderInfoShow ? { top: '6vh' } : { top: 'unset' }}>
          <View style={{ margin: '20rpx 40rpx 24rpx 40rpx' }}>
            <View className='takeInfo' onClick={() => this.getAddressInfo('take')}>
              <Text className='takeAddress'>{takeAddress}</Text>
              <Text className={takeContactsPhone ? 'takeContacts_b' : 'takeContacts'}>
                {takeContacts.concat(' ', takeContactsPhone)}
              </Text>
              <Image src={require('../../assets/images/userInfo.png')} className='takeInfoIcon' />
              <View className='takeCircle'>取</View>
            </View>
            <View className='receiveInfo' onClick={() => this.getAddressInfo('receive')}>
              <Text className='receiveAddress'>{receiveAddress}</Text>
              <Text className={receiveContactsPhone ? 'receiveContacts_b' : 'receiveContacts'}>
                {receiveContacts.concat(' ', receiveContactsPhone)}
              </Text>
              <Image src={require('../../assets/images/userInfo.png')} className='receiveInfoIcon' />
              <View className='receiveCircle'>收</View>
            </View>
            <View style={{ display: orderInfoShow ? 'block' : 'none' }}>
              <View className='takeTimeLine'>
                <View style={{ position: 'relative' }}>
                  <Picker
                    mode='multiSelector'
                    range={this.state.selector}
                    onColumnChange={this.onColumnChange}
                    onChange={this.pickerChange}
                    onClick={this.setNewTime}
                  >
                    <AtList>
                      <AtListItem
                        title='取件时间'
                        extraText={this.state.takeTime}
                      />
                    </AtList>
                  </Picker>
                  <Text className='appointmentWord'>可预约</Text>
                  <Image src={require('../../assets/images/rightArrow.png')} className='goArrow' />
                </View>
              </View>
              <View style={{ height: '29vh', overflowY: 'scroll' }}>
                <View className='orderInfo'>
                  <AtInput
                    name='commodity'
                    title='物品信息'
                    type='text'
                    editable={false}
                    placeholder='物品类型、价值、重量'
                    value={this.state.commodity}
                    onClick={() => {
                      this.setState({
                        comModalShow: true
                      })
                    }}
                  >
                    <Image src={require('../../assets/images/rightArrow.png')} style={{ width: '40rpx', height: '40rpx' }} />
                  </AtInput>
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
                    <Image src={require('../../assets/images/rightArrow.png')} style={{ width: '40rpx', height: '40rpx' }} />
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
                    <Image src={require('../../assets/images/rightArrow.png')} style={{ width: '40rpx', height: '40rpx' }} />
                  </AtInput>
                  <AtInput
                    name='paymentMethod'
                    title='支付方式'
                    type='text'
                    editable={false}
                    value={this.state.paymentMethod}
                    onClick={this.setPaymentMethod}
                  >
                    <Image src={require('../../assets/images/rightArrow.png')} style={{ width: '40rpx', height: '40rpx' }} />
                  </AtInput>
                </View>
              </View>
            </View>
          </View>
          <View className='bottomLine'style={{ display: orderInfoShow ? 'flex' : 'none', alignItems: 'center' }}>
              <View style={{ paddingLeft: '16rpx' }}>
                <View style={{ display: 'inline-block', fontSize: '30rpx', fontWeight: 'bold' }}>跑腿费</View>
                <View style={{ display: 'inline-block', fontSize: '36rpx', fontWeight: 'bold', color: '#ff5151', marginLeft: '10rpx' }}>{`￥${this.state.totalFee}`}</View>
              </View>
              <View style={{ position: 'absolute', right: '0', height: '100%' }}>
                <AtButton type={"primary"} full={true} onClick={this.onSubmit}>提交订单</AtButton>
              </View>
          </View>
        </View>
        <AtFloatLayout 
          isOpened={this.state.comModalShow}
          title="物品信息"
          onClose={() => {
            this.setState({
              comModalShow: false
            })
          }}>
          <View className='comTitle'>物品类型</View>
          <AtTabBar
            tabList={[
              { title: '餐饮' },
              { title: '文件' },
              { title: '生鲜' },
              { title: '蛋糕' },
              { title: '鲜花' },
              { title: '钥匙' },
              { title: '数码' },
              { title: '服饰' },
              { title: '其他' }
            ]}
            onClick={(value) => {
              this.setState({
                typeCurrent: value
              })
            }}
            current={this.state.typeCurrent}
          />
          <View className='comTitle'>物品价值</View>
          <AtTabBar
            tabList={[
              { title: '50元以下' },
              { title: '50-150元' },
              { title: '150-300元' },
              { title: '300-1000元' },
              { title: '1000-1500元' },
              { title: '1500-3000元' }
            ]}
            onClick={(value) => {
              this.setState({
                valCurrent: value
              })
            }}
            current={this.state.valCurrent}
          />
          <View className='comTitle'>物品重量(单位：斤)</View>
          <AtSlider step={0.5} min={0.5} max={25} showValue={true} value={this.state.weiCurrent} onChange={this.setWeight}/>
          <View style={{ marginTop: '36rpx' }}>
            <AtButton  type={"primary"} onClick={this.setCommodity}>确定</AtButton>
          </View>
        </AtFloatLayout>
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
          /> : '' }
          <View style={{ marginTop: '36rpx' }}>
            <AtButton type={"primary"} onClick={this.setTips}>确定</AtButton>
          </View>
        </AtFloatLayout>
      </View>
    )
  }
}

export default connect()(Dn);