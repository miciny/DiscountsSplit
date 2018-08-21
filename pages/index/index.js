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
      aGoodsAll: '(点击可输入)',
      personNo: '总\xa0\xa0\xa0人\xa0\xa0\xa0数:',
    }, 

    listData: [], //结果展示数据，【“A”：“22.20”】
    tabelShowFlag: false, //结果展示的table是否显示
    personNm: 0, //选择的人数的底标
    array: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], //选择的人数
    arrayA: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'], //选择的人数对应的字母
    focus: false, //第一个框是否聚焦

    resetNull: "",

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
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },

  //选择人数
  bindPickerChange: function (e) {
    this.setData({
      personNm: e.detail.value,
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

  //价格保留两位，传入Float，返回String，保留两位小数的
  priceForm: function(price) {
    price = price.toFixed(2)
    return price
  },
  //取价格，传入String 返回float
  getPrice: function (price) {
    price = parseFloat(price)
    if (isNaN(price)) { price = 0 };
    price = price.toFixed(2);
    price = parseFloat(price)
    return price
  },

  //计算显示
  formSubmit: function (e) {

    var a = this.getPrice(e.detail.value['goodsAll']); //商品总金额
    var b = this.getPrice(e.detail.value['discountsAll']); //总优惠
    var c = this.getPrice(e.detail.value['freightAll']); //总运费
    var ss = a - b + c;  //实付金额

    //金额大于0，实付大于0，优惠小于商品金额
    if (a <= 0 || ss < 0 || b > a){
      var str = ""
      if (a <= 0){
        str = "数据有误: 请输入正确的商品总金额"
      } else if (b > a) {
        str = "数据有误: 优惠金额大于商品总金额"
      } else if (ss < 0) {
        str = "数据有误: 实付金额小于0元"
      }

      wx.showModal({
        title: '提示',
        content: str,
        showCancel: false
      })  
    } else {
      var listDataTem = [];
      var nameListData = new Array();; //名字和字母的对应关系
      var totalGoods = 0; //记录每个人的实付金额（四舍五入之后的）
      var totalFreight = 0; //记录每个人的运费金额（四舍五入之后的）
      var totalDiscounts = 0; //记录每个人的优惠金额（四舍五入之后的）
      var totalPay = 0; //记录每个人的商品金额，计算的总应付金额，防止金额对不上
      var flag = false; //是否显示结果

      for (var key in e.detail.value) {
        if (this.isInArray3(this.data.arrayA, key)) {
          var d = this.getPrice(e.detail.value[key]); //每个人的金额
          var f = d / a * b; //优惠分摊
          var g = d / a * c; //运费分摊
          var ee = d - f + g; //应付金额

          totalPay += ee;
          totalFreight += (g);
          totalDiscounts += (f);
          totalGoods += d;

          //要输出时，四舍五入一下
          f = this.priceForm(f); 
          g = this.priceForm(g); 
          ee = this.priceForm(ee); 
          d = this.priceForm(d); 
          var sPay = { 
            "name": key, 
            "goods": d,
            "freight": g, 
            "discounts": f, 
            "pay": ee 
            }
          listDataTem.push(sPay)
        }else{  //记录名字
          if(key.indexOf("name_") != -1){
            var name = e.detail.value[key]; //名字
            var nameA = key.slice(5);
            if(name == ""){name = nameA};  //如果为空
            nameListData[nameA] = name;
          }
        }
      }

      //处理名字问题
      for (var item in listDataTem){
        var nameA = listDataTem[item].name;
        var name = nameListData[nameA];
        listDataTem[item].name = name;
      }

      //各个人的金额总数等于商品金额
      var totalGoodsForm = this.priceForm(totalGoods); //  要比较，处理下小数
      if (totalGoodsForm != a){
        wx.showModal({
          title: '提示',
          content: '个人金额总计:￥' + totalGoodsForm + '与订单总计:￥' + a + '\n金额不一致',
          showCancel: false
        }) 
        listDataTem = [];
      }else{
        //  要显示，处理下小数
        totalPay = this.priceForm(totalPay); 
        totalFreight = this.priceForm(totalFreight);
        totalDiscounts = this.priceForm(totalDiscounts);
        var sPay = { "name": "总计", "goods": totalGoodsForm, "freight": totalFreight, "discounts": totalDiscounts, "pay": totalPay }
        listDataTem.push(sPay)
        flag = true
      }
      this.setData({
        listData: listDataTem,
        tabelShowFlag: flag
      })
    }
  },

  //重置
  resetData: function (e) {
    this.setData({
      personNm: 0,
      resetNull: "",
    })
  },

  //分享app
  onShareAppMessage: function (res) {
    return {
      title: '好用的拼单拆分计算小程序',
      path: 'pages/index/index'
    }
  },

  //确认键
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