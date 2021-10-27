import React, { Component } from 'react'
import { View, Navigator,Text } from '@tarojs/components'
import './index.less'

class NavBar extends Component {
  state = {
    silderMove: { left: '60rpx' },
    DnTitleSize: { fontSize: '32rpx' },
    BmTitleSize: { fontSize: '28rpx' },
    QdTitleSize: { fontSize: '28rpx' }
  }
  handleDnClick = () => {
    this.setState({
      silderMove: { left: '60rpx' },
      DnTitleSize: { fontSize: '32rpx' },
      BmTitleSize: { fontSize: '28rpx' },
      QdTitleSize: { fontSize: '28rpx' }
    })
    this.props.setItemShow(true, false, false);
  }
  handleBmClick = () => {
    this.setState({
      silderMove: { left: '304rpx'},
      DnTitleSize: { fontSize: '28rpx' },
      BmTitleSize: { fontSize: '32rpx' },
      QdTitleSize: { fontSize: '28rpx' }
    })
    this.props.setItemShow(false, true, false);
  }
  handleQdClick = () => {
    this.setState({
      silderMove: { left: '548rpx' },
      DnTitleSize: { fontSize: '28rpx' },
      BmTitleSize: { fontSize: '28rpx' },
      QdTitleSize: { fontSize: '32rpx' }
    })
    this.props.setItemShow(false, false, true);
  }
  render() {
    return (
      <View className='navBar'>
        <View style={{ display: 'inline-block' }} onClick={this.handleDnClick}>
          <Text style={ this.state.DnTitleSize }>校园代拿</Text>
        </View>
        <View style={{ display: 'inline-block' }} onClick={this.handleBmClick}>
          <Text style={ this.state.BmTitleSize }>校园帮买</Text>
        </View>
        <View style={{ display: 'inline-block' }} onClick={this.handleQdClick}>
          <Text style={ this.state.QdTitleSize }>我要抢单</Text>
        </View>
        <View style={this.state.silderMove} className='slider'></View>
      </View>
    )
  }
}

export default NavBar;