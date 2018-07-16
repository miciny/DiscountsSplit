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
      aGoodsAll: '\xa0的总金额:',
      personNo: '总\xa0\xa0\xa0人\xa0\xa0\xa0数:',
    }, 

    index: 0,
    array: [2, 3, 4, 5, 6, 7, 8],
    arrayA: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
    all: {},

    inputData_goodsAll: '',
    inputData_discountsAll: '',
    inputData_freightAll: '',
    result: '',
    resultFinal: '',  

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

  //选择人数
  bindPickerChange: function (e) {
    var oldIndex = this.data.index;
    this.setData({
      index: e.detail.value,
      result: "",
      resultFinal: "",
    })

    //重新选择人数，现在处理数据
    if (oldIndex>this.data.index){
        var oldAll = this.data.all;
        var newArrayA = this.data.arrayA.slice(0, this.data.array[e.detail.value]);
        for (var key in oldAll){
          if (!this.isInArray3(newArrayA, key)){
            delete oldAll[key];
          }
        }
    }
  },

  isInArray3: function(arr, value){
    if(arr.indexOf&&typeof (arr.indexOf) == 'function') {
      var index = arr.indexOf(value);
      if (index >= 0) {
        return true;
      }
    }
    return false;
  },

  inputB: function (e) {
    var all = this.data.all;
    var iname = e.target.dataset.iname;
    all[iname] = e.detail.value;
    this.setData({
      all: all
    });
  },

  //计算显示
  doCalculate: function() {
    var a = parseFloat(this.data.inputData_goodsAll);
    var b = parseFloat(this.data.inputData_discountsAll);
    var c = parseFloat(this.data.inputData_freightAll);

    if (isNaN(a)) { a = 0 };
    if (isNaN(b)) { b = 0 };
    if (isNaN(c)) { c = 0 };

    var str = "";
    var strFinal = '';
    var ss = a - b + c;

    if (a <= 0 || ss < 0 || b > a){
      wx.showModal({
        title: '提示',
        content: '数据有误',
        showCancel: false
      })  
    } else {
      ss = ss.toFixed(2);
      str = "实\xa0\xa0\xa0付:￥" + ss
      var totalPay = 0;
      var totalGoods = 0;

      for (var key in this.data.all) {
        var d = parseFloat(this.data.all[key]);
        if (isNaN(d)) { d = 0 };

        var f = d / a * b;
        var g = d / a * c;
        var ee = d - f + g;

        totalPay += ee;
        totalGoods += d;
        f = f.toFixed(2);
        g = g.toFixed(2);
        ee = ee.toFixed(2);

        str += "\n" + key + "\xa0应付:￥" + ee + "\n\xa0\xa0分摊优惠:￥" + f + ",分摊运费:￥" + g
      }

      if (totalGoods != a){
        wx.showModal({
          title: '提示',
          content: '个人金额总计:￥' + totalGoods + '与订单总计:￥' + a + '\n金额不一致',
          showCancel: false
        }) 
        str = ""
        strFinal = ""
      }else{
        totalPay = totalPay.toFixed(2);
        strFinal += "应付总计:\xa0\xa0￥" + totalPay;
      }
    }

    this.setData({
      result: str,
      resultFinal: strFinal,
    })
  }
})
