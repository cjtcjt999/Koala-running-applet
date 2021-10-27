export default {
  pages: [
    'pages/login/index',
    'pages/register/index',
    'pages/index/index',
    'pages/order/index',
    'pages/userInfo/index',
    'pages/userInfo/personal/index',
    'pages/userInfo/blance/index',
    'pages/userInfo/address/index',
    'pages/userInfo/feedback/index',
    'pages/userInfo/address/addAddress/index',
    'pages/bm/bm_order/index',
    'pages/order/order_info/index'
  ],
  tabBar: {
    color: "#515151",
    selectedColor: "#6190E8",
    list: [
      {
        pagePath: "pages/index/index",
        text: "首页"
      },
      {
        pagePath: "pages/order/index",
        text: "订单"
      },
      {
        pagePath: "pages/userInfo/index",
        text: "我的"
      }
    ]
  },
  subPackages: [
    {
      root: 'pages/addressInfo/',
      pages: [
        'index'
      ]
    }
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black'
  },
  plugins: {
    "chooseLocation": {
      "version": "1.0.5",
      "provider": "wx76a9a06e5b4e693e"
    }
  },
  requiredBackgroundModes: ['location'],
  permission: {
    "scope.userLocation": {
      "desc": "你的位置信息将用于小程序定位"
    },
    "scope.userLocationBackground": {
      "desc": "请开启位置信息以用于后台定位"
    }
  }
}
