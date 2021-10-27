import React from 'react'
import Taro from '@tarojs/taro'

const getLocationInfo = () => {//获取当前定位的经纬度及坐标位置描述
  return new Promise((resolve,reject) => {
    Taro.getLocation({
      type: 'wgs84',
    }).then((res) => {
      const latitude = res.latitude;
      const longitude = res.longitude;
      var QQMapWX = require('./sdk/qqmap-wx-jssdk.js');
      var qqmapsdk = new QQMapWX({
        key: 'QNBBZ-7ANRF-DEHJ7-JZ7FO-DZ4YH-JKFAC' // 必填
      });
      qqmapsdk.reverseGeocoder({
        location: { latitude, longitude },
        success: function (res) {
          const takeAddress = res.result.address;
          resolve({
            latitude,
            longitude,
            takeAddress
          })
        }
      })
    })
  })
}

const getAddressInfo = (latitude, longitude) => {
  const key = 'QNBBZ-7ANRF-DEHJ7-JZ7FO-DZ4YH-JKFAC'; //使用在腾讯位置服务申请的key
  const referer = 'wx76a9a06e5b4e693e'; //调用插件的app的名称
  const location = JSON.stringify({
    latitude,
    longitude
  });
  const category = '大学,小区,生活服务';
  wx.navigateTo({
    url: 'plugin://chooseLocation/index?key=' + key + '&referer=' + referer + '&location=' + location + '&category=' + category
  });
}

const getPolyLinePoint = (takeCoordinate, receiveCoordinate) => { //获取路线规划需要的坐标数组
  console.log('褚锦涛',takeCoordinate, receiveCoordinate)
  return new Promise((resolve, reject) => {
    var QQMapWX = require('./sdk/qqmap-wx-jssdk.js');
    var qqmapsdk = new QQMapWX({
      key: 'QNBBZ-7ANRF-DEHJ7-JZ7FO-DZ4YH-JKFAC' // 必填
    });
    qqmapsdk.direction({
      mode: 'walking',// 可选值：'driving'（驾车）、'walking'（步行）、'bicycling'（骑行），不填默认：'driving', 可不填
      //from参数不填默认当前地址
      from: takeCoordinate,
      to: receiveCoordinate,
      success: function (res) {
        var ret = res;
        var coors = ret.result.routes[0].polyline, pl = [];
        //坐标解压（返回的点串坐标，通过前向差分进行压缩）
        var kr = 1000000;
        for (var i = 2; i < coors.length; i++) {
          coors[i] = Number(coors[i - 2]) + Number(coors[i]) / kr;
        }
        //将解压后的坐标放入点串数组pl中
        for (var i = 0; i < coors.length; i += 2) {
          pl.push({ latitude: coors[i], longitude: coors[i + 1] })
        }
        //设置polyline属性，将路线显示出来,将解压坐标第一个数据作为起点
        resolve(pl)
      },
      fail: function (error) {
        console.error(error);
      },
      complete: function (res) {
        
      }
    });
  })
}
export { getLocationInfo, getAddressInfo, getPolyLinePoint };