//index.js
//获取应用实例
const app = getApp()

Page({
  //数据
  data: {
    inputAll: { 
      goodsAll: '商品总金额:', 
      discountsAll: '优惠总金额:',
      freightAll: '总\xa0\xa0\xa0运\xa0\xa0\xa0费:',
      aGoodsAll: '个人总金额:',
    }, 

    inputData_goodsAll: '',
    inputData_discountsAll: '',
    inputData_freightAll: '',
    inputData_aGoodsAll: '', 
    result: '请输入金额',  

    focus: false,
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true,
        focus: true
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true,
          focus: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true,
            focus: true
          })
        }
      })
    }
  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },

  //获取输入框的内容
  goodsAllInput: function (e) {
    this.setData({
      inputData_goodsAll: e.detail.value
    })
  },
  discountsAllInput: function (e) {
    this.setData({
      inputData_discountsAll: e.detail.value
    })
  },
  freightAllInput: function (e) {
    this.setData({
      inputData_freightAll: e.detail.value
    })
  },
  aGoodsAllInput: function (e) {
    this.setData({
      inputData_aGoodsAll: e.detail.value
    })
  },

  //计算显示
  doCalculate: function() {
    var aa = (this.data.inputData_goodsAll);
    var bb = (this.data.inputData_discountsAll);
    var cc = (this.data.inputData_freightAll);
    var dd = (this.data.inputData_aGoodsAll);

    if (aa == ""){
      aa = "0"
    }
    if (bb == ""){
      bb = "0"
    }
    if (cc == "") {
      cc = "0"
    }
    if (dd == "") {
      dd = "0"
    }

    var a = parseFloat(aa);
    var b = parseFloat(bb);
    var c = parseFloat(cc);
    var d = parseFloat(dd);

    var str = "";
    var ss = a - b + c

    if (a <= 0 || ss < 0 || b > a){
      str = "数据有误"
    } else {
      var ee = d - d / a * b + d / a * c
      ee = ee.toFixed(2);
      str = "实付：￥" + ss + ",\xa0\xa0\xa0\xa0\xa0个人应付：￥" + ee
    }

    this.setData({
      result: str,
    })
  }
})
