
App({
   onLaunch: function () {
     var that=this;
     this.globalData.view=[];//浏览
     this.globalData.view.push({ac:'load',time:(new Date()).getTime()});
     
     wx.showShareMenu({withShareTicket: true,menus: ['shareAppMessage', 'shareTimeline']})
     //获取系统信息
     wx.getSystemInfo({
       success: (res) => {
         if(res.system.indexOf('iOS')!=-1){that.globalData.os='iOS';}else{ that.globalData.os='AN'; }//系统
         that.globalData.nav_top = res.statusBarHeight;
         if(!res.safeArea.top){res.safeArea.top=44;}
         that.globalData.safe_top=res.safeArea.top;
         that.globalData.safe_bottom=res.screenHeight-res.safeArea.bottom-20;
       }
     });
 //登录信息
     var val = wx.getStorageSync('login_info');
     if (val) {
       var d = JSON.parse(val);
       that.globalData.user_id = d.user_id;
       that.globalData.session = d.session;
       that.globalData.user_info = d;
     }
     var val = wx.getStorageSync('adm_login');//管理员登录
     if (val) {
       var d = JSON.parse(val);
       that.globalData.adm_id = d.id;
       that.globalData.adm_session = d.session;
     }
 
     var user_session=wx.getStorageSync('user_session');
     if(!user_session){
       user_session=Math.ceil((new Date).getTime()/1000);
     try {
       wx.setStorageSync('user_session', user_session)
     } catch (e) { }
   }
 this.globalData.user_session=user_session;
 
   },
   //全局信息
   globalData: {
   server:"https://www.zjhn.top/car/",
   map_key:"SJFBZ-VCPLJ-DUIFY-KTCLP-6N525-OWFYK",
   web:"租车",
   website:"https://s4.zjhn.top/",
   upload:"https://upload.zjhn.top/upload.php",//图片上传服务器
   shop_id:145,//门店
   app_c:"tuan",
   adm:10,//管理
   app_id:84,
   version:1.17
   },
   //消息提示
   msg:function(t){wx.showToast({ title: t,icon: 'none',duration: 2000 });},
   err: function (t) {console.log('消息');
   wx.showModal({title: '提示',content: t,})
   },onError:function(res){
     var app=this.globalData.app;
     if(!app){return;}
     console.log('应用',app)
    if(app.debug!=1){return;}
     wx.showModal({title: '错误提示',content:res,});
     //是否提交错误
     wx.request({
       url: this.globalData.server+'server.php',
       header:{'content-type':'application/x-www-form-urlencoded'},
       method:'POST',
       enableHttp2:true,
       data:{
       ac:'send_err',
       adm:this.globalData.adm,
       app_id:this.globalData.app_id,
       version:this.globalData.version?this.globalData.version:'',
       val:res
       },success(res){
       
       }
     })
   },onHide(){//应用关闭时候推送信息
     var app=this.globalData.app;
     if(!this.globalData.view){return;}
     if(!app){return;}
     console.log('应用',app)
    console.log(this.globalData.view)
     wx.request({
       url: this.globalData.server+'server.php',
       header:{'content-type':'application/x-www-form-urlencoded'},
       method:'POST',
       enableHttp2:true,
       data:{
       ac:'app_view',
       adm:this.globalData.adm,
       app_id:this.globalData.app_id,
       shop_id:this.globalData.shop_id,
       user_id:this.globalData.user_id?this.globalData.user_id:0,
       session:this.globalData.session?this.globalData.session:'',
       user_session:this.globalData.user_session?this.globalData.user_session:'',
       data:JSON.stringify(this.globalData.view),
       },success(res){
       console.log(res)
       }
     })
 
   }
 })
 