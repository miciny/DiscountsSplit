//index.js
//获取应用实例
const app = getApp()

Page({
  //数据
  data: {
    //输入框前的文案
    inputAll: { 
      goodsAll: '商品总金额:', 
      discountsAll: '优惠总金额:',
      freightAll: '总\xa0\xa0\xa0运\xa0\xa0\xa0费:',
      aGoodsAll: '\xa0的总金额:',
      personNo: '总\xa0\xa0\xa0人\xa0\xa0\xa0数:',
    }, 

    listData: [], //结果展示数据
    tabelShowFlag: false, //结果展示的table是否显示
    index: 0, //选择的人数
    array: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], //选择的人数
    arrayA: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'], //选择的人数对应的字母
    focus: false, //第一个框是否聚焦

    userInfo: {}, //用户信息
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },

  //事件处理函数
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
  onGotUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },

  //选择人数
  bindPickerChange: function (e) {
    var oldIndex = this.data.index;
    this.setData({
      index: e.detail.value,
      listData: [],
      tabelShowFlag: false
    })
  },

  //检查元素是否在数组中
  isInArray3: function (arr, value) {
    if (arr.indexOf && typeof (arr.indexOf) == 'function') {
      var index = arr.indexOf(value);
      if (index >= 0) {
        return true;
      }
    }
    return false;
  },

  //计算显示
  formSubmit: function (e) {
    console.log(e.detail.value)

    var a = parseFloat(e.detail.value['goodsAll']);
    var b = parseFloat(e.detail.value['discountsAll']);
    var c = parseFloat(e.detail.value['freightAll']);

    if (isNaN(a)) { a = 0 };
    if (isNaN(b)) { b = 0 };
    if (isNaN(c)) { c = 0 };

    var ss = a - b + c;

    //金额大于0，实付大于0，优惠小于商品金额
    if (a <= 0 || ss < 0 || b > a){
      wx.showModal({
        title: '提示',
        content: '数据有误',
        showCancel: false
      })  
    } else {
      var listDataTem = [];
      var totalGoods = 0; //记录每个人的实付金额（四舍五入之后的）
      var totalFreight = 0; //记录每个人的运费金额（四舍五入之后的）
      var totalDiscounts = 0; //记录每个人的优惠金额（四舍五入之后的）
      var totalPay = 0; //记录每个人的商品金额，计算的总应付金额，防止金额对不上
      var flag = false; //是否显示结果
      ss = ss.toFixed(2); //实付

      for (var key in e.detail.value) {
        if (this.isInArray3(this.data.arrayA, key)) {
          var d = parseFloat(e.detail.value[key]);
          if (isNaN(d)) { d = 0 };

          var f = d / a * b;
          var g = d / a * c;
          var ee = d - f + g;

          f = parseFloat(f.toFixed(2)); //优惠分摊
          g = parseFloat(g.toFixed(2)); //运费分摊
          ee = parseFloat(ee.toFixed(2)); //应付金额

          totalPay += ee;
          totalFreight += (g);
          totalDiscounts += (f);
          totalGoods += d;

          var sPay = { 
            "name": key, 
            "goods": d,
            "freight": g, 
            "discounts": f, 
            "pay": ee 
            }
          listDataTem.push(sPay)
        }
      }

      //各个人的金额总数等于商品金额
      if (totalGoods != a){
        wx.showModal({
          title: '提示',
          content: '个人金额总计:￥' + totalGoods + '与订单总计:￥' + a + '\n金额不一致',
          showCancel: false
        }) 
        listDataTem = [];
      }else{
        totalPay = totalPay.toFixed(2); 
        totalFreight = totalFreight.toFixed(2);
        totalDiscounts = totalDiscounts.toFixed(2);
        var sPay = { "name": "总计", "goods": totalGoods, "freight": totalFreight, "discounts": totalDiscounts, "pay": totalPay }
        listDataTem.push(sPay)
        flag = true
      }
      this.setData({
        listData: listDataTem,
        tabelShowFlag: flag
      })
    }
  },

  //分享app
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: '好友分享的神秘APP',
      path: 'pages/index/index'
    }
  },

  //
  onConfirm: function () {
    this.hideModal()
  },

  /**
  * 隐藏模态对话框
  */
  hideModal: function () {
    this.setData({
      tabelShowFlag: false
    });
  },
  /**
  * 弹出框蒙层截断touchmove事件,但是模态本身能滚动时，此方法无效
  */
  preventTouchMove: function () {
    return;
  },
})