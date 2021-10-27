import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, Swiper, SwiperItem, Image } from '@tarojs/components'
import { AtInput, AtButton, AtTabBar } from 'taro-ui'
import './index.less'

class Bm extends Component {
  state = {

  }
  goToOrder = (e) => {
    let params = (e >= 0 && e <= 7) ? e : '';
    Taro.navigateTo({ url: `/pages/bm/bm_order/index?type=${params}` })
  }
  render() {
    return (
      <View className='Bm'>
        <View>
          <AtInput
            editable={false}
            type='text'
            placeholder='想买点什么...'
            onClick={this.goToOrder}
          >
            <AtButton type='primary' onClick={this.goToOrder}>去下单</AtButton>
          </AtInput>
        </View>
        <View style={{ marginTop: '16rpx' }}>
          <AtTabBar
            tabList={[
              { title: '日用', image: require('../../assets/images/item_type/dailyUse.png'), text: 'HOT' },
              { title: '饮料', image: require('../../assets/images/item_type/drinks.png') },
              { title: '小吃', image: require('../../assets/images/item_type/streetFood.png'), text: 'HOT' },
              { title: '文具', image: require('../../assets/images/item_type/stationery.png') },
              { title: '奶茶', image: require('../../assets/images/item_type/milkTea.png'), text: 'HOT' },
              { title: '药品', image: require('../../assets/images/item_type/drugs.png'), text: '安心' },
              { title: '酒水', image: require('../../assets/images/item_type/alcohol.png') },
              { title: '果蔬', image: require('../../assets/images/item_type/fruits .png') },
            ]}
            onClick={this.goToOrder}
            current={this.state.current}
          />
        </View>
        <Swiper
          className='ad_swiper'
          indicatorColor='#999'
          indicatorActiveColor='#333'
          circular
          indicatorDots
          autoplay>
          <SwiperItem>
            <Image src={require('../../assets/images/find_ad.jpg')} style={{ width: '100%', height: '100%' }}/>
          </SwiperItem>
          <SwiperItem>
            <Image src={require('../../assets/images/find_ad.jpg')} style={{ width: '100%', height: '100%' }} />
          </SwiperItem>
          <SwiperItem>
            <Image src={require('../../assets/images/find_ad.jpg')} style={{ width: '100%', height: '100%' }} />
          </SwiperItem>
        </Swiper>
      </View>
    )
  }
}
export default Bm;