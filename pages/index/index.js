//index.js
//获取应用实例
const app = getApp()

Page({
    //数据
    data: {
        //输入框前的文案
        inputAll: {
            goodsAllTitle: '商品模式：计算每件商品分摊优惠和运费之后的单价。',
            personAllTitle: '人均模式：计算参与人员分摊优惠和运费之后的应付金额。',
            discountsAll: '优\xa0惠\xa0金\xa0额',
            freightAll: '总\xa0\xa0\xa0运\xa0\xa0\xa0费',
            aGoodsAll: '(可修改)',
            personNo: '总\xa0\xa0\xa0人\xa0\xa0\xa0数',
            goodsNo: '总\xa0商\xa0品\xa0数',
        },

        listData: [], //结果展示数据，【“A”：“22.20”】
        tabelShowFlag: false, //结果展示的table是否显示
        personNm: 0, //选择的人数的底标
        array: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], //选择的人数
        arrayA: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'], //选择的人数对应的字母
        focus: false, //第一个框是否聚焦

        calculateMode: 1,   //1商品  0人均
        chooseColor: "rgb(17, 209, 10)",
        chooseColor_zero: "black",
        chooseColor_one: "rgb(17, 209, 10)",

        resetNull: "", //清空时，给输入框的赋值
        resetName: "",
        reset_One: 1, //清空时，给输入框的赋值
        scrollHeight: "", //页面滚动高度赋值
        animationData: {}, //动画
        maskAnimationData: {},
        iconAnimationData: {},
        copyrightHeight: "",
        finnalHeight: 425,

        userInfo: {}, //用户信息
        hasUserInfo: false,
        canIUse: wx.canIUse('button.open-type.getUserInfo')
    },

    //事件处理函数
    onLoad: function() {
        if (app.globalData.userInfo) {
            this.setData({
                userInfo: app.globalData.userInfo,
                hasUserInfo: true,
                focus: true
            })
        } else if (this.data.canIUse) {
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
        //获取屏幕高度，用于滚动scroll设置高度用
        wx.getSystemInfo({
            success: res => {
                this.setData({
                    scrollHeight: parseInt(res.windowHeight),
                    copyrightHeight: parseInt(res.windowHeight) - this.data.finnalHeight
                })
            }
        });
    },

    /**
     * 摇一摇
     */
    onShow: function() {
        //重力加速度
        wx.onAccelerometerChange(function(res) {
            if (res.x > .4 && res.y > .4 || 
                res.x > .4 && res.z > .4 || 
                res.z > .4 && res.y > .4) {
                wx.showToast({
                    title: '👀',
                    icon: 'none',
                    duration: 2000
                });
            }
        })
    },

    //获取用户信息
    onGotUserInfo: function(e) {
        app.globalData.userInfo = e.detail.userInfo
        this.setData({
            userInfo: e.detail.userInfo,
            hasUserInfo: true,
            focus: true
        })
    },

    //点击头像，添加自己的名字
    previewImg: function () {
        if (Object.keys(this.data.iconAnimationData).length == 0) {
            this.setIconAnimation(); 
        }

        if (this.data.calculateMode == 1){
            return
        }

        this.setData({
            resetName: this.data.userInfo.nickName,
        })
    },
    
    //点击头像,旋转自己
    setIconAnimation: function() {
        var animation = wx.createAnimation({
            duration: 3000,
            timingFunction: "linear",
        });
        this.animation = animation;
        animation.rotate(360).step();

        this.setData({
            iconAnimationData: animation.export(),
        })

        setTimeout(() => {
            animation.rotate(0).step({
                duration: 0,
            });
            this.setData({
                iconAnimationData: animation.export(),
            })
        }, 3000);

        setTimeout(() => {
            this.setData({
                iconAnimationData: {},
            })
        }, 3000);
    },

    //选择人数
    bindPickerChange: function(e) {
        var copyheight = this.data.scrollHeight - this.data.finnalHeight - 41 * e.detail.value
        if (copyheight < 20) {
            copyheight = 20
        };

        this.setData({
            personNm: parseInt(e.detail.value),
            listData: [],
            tabelShowFlag: false,
            copyrightHeight: copyheight
        })
    },

    //选择模式
    setModel: function(e) {

        if (e.currentTarget.id == 1) {
            this.setData({
                chooseColor_zero: "black",
                chooseColor_one: this.data.chooseColor
            })
        } else if (e.currentTarget.id == 0) {
            this.setData({
                chooseColor_one: "black",
                chooseColor_zero: this.data.chooseColor
            })
        }

        this.setData({
            calculateMode: e.currentTarget.id,
            listData: [],
            tabelShowFlag: false
        })
    },

    //检查元素是否在数组中
    isInArray3: function(arr, value) {
        if (arr.indexOf && typeof(arr.indexOf) == 'function') {
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
    getPrice: function(price) {
        price = parseFloat(price)
        if (isNaN(price)) {
            price = 0
        };
        price = price.toFixed(2);
        price = parseFloat(price)
        return price
    },

    //计算显示
    formSubmit: function(e) {
        var b = this.getPrice(e.detail.value['discountsAll']); //总优惠
        var c = this.getPrice(e.detail.value['freightAll']); //总运费

        //金额大于0的检测
        if (c < 0 || b < 0) {
            wx.showModal({
                title: '提示',
                content: "数据有误,金额需大于0",
                showCancel: false
            })
            return
        } else {
            var totalGoods = 0; //记录总的商品金额（四舍五入之后的）

            //先算出总金额
            for (var key in e.detail.value) {
                if (this.isInArray3(this.data.arrayA, key)) {
                    var d = this.getPrice(e.detail.value[key]); //每个人的金额
                    if (d < 0) {
                        wx.showModal({
                            title: '提示',
                            content: "数据有误,金额需大于0",
                            showCancel: false
                        })
                        return
                    }
                    totalGoods += d;
                }
            }

            //优惠小于商品金额
            var ss = totalGoods - b + c; //实付金额
            if (b > totalGoods) {
                wx.showModal({
                    title: '提示',
                    content: "数据有误: 优惠金额大于商品总金额",
                    showCancel: false
                })
                return
            } else if (totalGoods <= 0) {
                wx.showModal({
                    title: '提示',
                    content: "数据有误: 请输入金额",
                    showCancel: false
                })
                return
            }

            //金额无误，继续计算
            var listDataTem = [];
            var nameListData = new Array(); //名字和字母的对应关系
            var totalFreight = 0; //记录每个人的运费金额（四舍五入之后的）
            var totalDiscounts = 0; //记录每个人的优惠金额（四舍五入之后的）
            var totalPay = 0; //记录每个人的商品金额，计算的总应付金额，防止金额对不上
            var flag = false; //是否显示结果

            var goodsNoData = new Array(); //记录商品件数
            var totalGoodsNo = 0;

            for (var key in e.detail.value) {
                if (this.isInArray3(this.data.arrayA, key)) {
                    var d = this.getPrice(e.detail.value[key]); //每个人的金额
                    if (d > 0) { //小于等于0的不显示结果
                        var f = d / totalGoods * b; //优惠分摊
                        var g = d / totalGoods * c; //运费分摊
                        var ee = d - f + g; //应付金额

                        totalPay += ee;
                        totalFreight += (g);
                        totalDiscounts += (f);

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
                            "pay": ee,
                            "goodsNo": 1,
                            "goodsSingle": 0
                        }
                        listDataTem.push(sPay)
                    }
                } else { //记录名字
                    if (key.indexOf("name_") != -1) {
                        var name = e.detail.value[key]; //名字
                        var nameA = key.slice(5);
                        if (name == "") {
                            name = nameA
                        }; //如果为空
                        nameListData[nameA] = name;
                    }

                    //如果商品模式
                    if (this.data.calculateMode == 1) {
                        if (key.indexOf("GoodsNo_") != -1) {
                            var no = e.detail.value[key]; //件数
                            var nameA = key.slice(8);
                            if (isNaN(parseInt(no)) || no == "") {
                                no = 1
                            }; //如果为空
                            goodsNoData[nameA] = no;
                        }
                    }
                }
            }

            //处理名字问题
            for (var item in listDataTem) {
                var nameA = listDataTem[item].name;
                var name = nameListData[nameA];
                listDataTem[item].name = name;

                //如果商品模式
                if (this.data.calculateMode == 1) {
                    var no = goodsNoData[nameA];
                    listDataTem[item].goodsNo = no;
                    listDataTem[item].goodsSingle = this.priceForm(parseFloat(listDataTem[item].pay) / parseFloat(no));
                    totalGoodsNo += parseInt(no);
                }
            }

            // 要显示，处理下小数
            var totalGoodsForm = this.priceForm(totalGoods);
            totalPay = this.priceForm(totalPay);
            totalFreight = this.priceForm(totalFreight);
            totalDiscounts = this.priceForm(totalDiscounts);
            var sPay = {
                "name": "总计",
                "goods": totalGoodsForm,
                "freight": totalFreight,
                "discounts": totalDiscounts,
                "pay": totalPay,
                "goodsNo": totalGoodsNo,
                "goodsSingle": totalPay
            }
            listDataTem.push(sPay)
            flag = true

            this.setData({
                listData: listDataTem,
                tabelShowFlag: flag
            })

            this.setAnimation()
        }
    },

    //动画
    setAnimation: function() {
        var animation = wx.createAnimation({
            timingFunction: 'ease',
        })
        animation.scale(0.01, 0.01).step({
            duration: 1
        })
        animation.scale(1, 1).step({
            duration: 400
        })

        var animationMask = wx.createAnimation({
            timingFunction: 'ease',
        })
        animationMask.opacity(0.9).step({
            duration: 400
        })

        this.setData({
            maskAnimationData: animationMask.export(),
            animationData: animation.export()
        })
    },
    fadeAnimation: function() {
        var animation = wx.createAnimation({
            timingFunction: 'ease',
        })
        animation.opacity(0.3).scale(0.01, 0.01).step({
            duration: 300
        })

        var animationMask = wx.createAnimation({
            timingFunction: 'ease',
        })
        animationMask.opacity(0).step({
            duration: 300
        })

        this.setData({
            animationData: animation.export(),
            maskAnimationData: animationMask.export()
        })
    },

    //重置
    resetData: function(e) {
        this.setData({
            personNm: 0,
            resetNull: "",
            resetName: "",
            reset_One: 1,
            copyrightHeight: this.data.scrollHeight - this.data.finnalHeight
        })
    },

    //分享app
    onShareAppMessage: function(res) {
        return {
            title: '拼单拆分计算小程序',
            path: 'pages/index/index',
            imageUrl: ''
        }
    },

    //确认键
    onConfirm: function() {
        this.delayHideModal()
    },

    /**
     * 隐藏模态对话框
     */
    hideModal: function() {
        this.setData({
            tabelShowFlag: false,
            animationData: {},
            maskAnimationData: {}
        })
    },
    delayHideModal: function() {
        var that = this;
        that.fadeAnimation()
        setTimeout(function() {
            that.hideModal()
        }, 280)
    },
    /**
     * 弹出框蒙层截断touchmove事件
     * 本身scrollview不能阻止，不能用这个方法
     */
    preventTouchMove: function() {
        return;
    },
})