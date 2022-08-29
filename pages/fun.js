
function indexOf(str, v) {
   if (str.indexOf(v) < 0) { return false; } else { return true; }
 }
 
 function get_pos(){//获取位置
   return new Promise((resolve, reject) => {
     wx.getLocation({
       type: 'gcj02',
       isHighAccuracy:'true',
       success (res) {
         console.log('位置信息',res)
         res.err='ok';
         resolve(res);
       },
       fail(res){
         res.err='fail';
         resolve(res);
       }
      })
   });
 }
 
 function get(data){
   var app = getApp();
   if(!data){data={};}
   data.user_id=app.globalData.user_id;if(!data.user_id){data.user_id=0;}
   data.session=app.globalData.session;if(!data.session){data.session='';}
   data.adm_id=app.globalData.adm_id;if(!data.adm_id){data.adm_id=0;}
   data.adm_session=app.globalData.adm_session;if(!data.adm_session){data.adm_session='';}
   data.from_id=app.globalData.from_id;if(!data.from_id){data.from_id=0;}
   data.user_session=app.globalData.user_session;
   data.from=app.globalData.from;if(!data.from){data.from='';}
   data.latitude=app.globalData.latitude;if(!data.latitude){data.latitude=0}
   data.longitude=app.globalData.longitude;if(!data.longitude){data.longitude=0}
   console.log(data)
   return new Promise((resolve, reject) => {
 wx.request({
   url: app.globalData.server+'/server.php',
   header:{'content-type':'application/x-www-form-urlencoded'},
   method:'POST',
   enableHttp2:true,
   data:data,success(res){
 if(!res.data){console.log('没有返回数据');return;}console.log(res.data)
 if(res.data.err!='ok'){ 
   if(typeof res.data=='string'){
 if(res.data.indexOf('404 Not Found')!=-1){app.err('服务器页面丢失，请联系管理员处理');return;} 
 }
 if(res.data.direct && res.data.url){wx.navigateTo({url: '/pages/login/index',});resolve({err:'no_login'});return;}//跳转页面
 if(res.data.err=='no_login'){wx.navigateTo({url: '/pages/login/index',});resolve({err:'no_login'});return;}
 if(res.data.err=='adm_login'){wx.navigateTo({url: '/pages/login/adm_login',});resolve({err:'no_login'});return;}
 if(res.data.err!=''){app.err(res.data.err);return;}
 } 
 if(res.data.err_msg){
   app.msg(res.data.err_msg)
 }
     resolve(res.data)
   },fail(res){
     console.log('错误',res)
   }
 })
   });
 }
 
 function get_phone(data) {//获取手机号码
   var app = getApp()
   return new Promise((resolve, reject) => {
     wx.login({
       success(res) {
         console.log('获取手机号码',res,data);
             wx.request({
               url: app.globalData.server+'server.php', // 目标服务器url
               data: {
                 ac: 'get_phone',
                 header:{'content-type':'application/x-www-form-urlencoded'},
                 method:'POST',
                 encryptedData:encodeURIComponent(data.encryptedData) ,
                 iv: data.iv,
                 code: res.code,
                 adm:app.globalData.adm?app.globalData.adm:0
               },
               success: (res) => {console.log(res.data)
                 if (!res.data.err_code) {
                   resolve(res.data)
                 } else {app.msg('获取失败，请重新获取');
                   console.log('获取失败',res.data);
                 }
               }
             }); 
           },
 
       fail(res) {
         console.log(`login调用失败`);
       }
     });
   });
 }
 
 function go_login() {
   var app = getApp()
   return new Promise((resolve, reject) => {
     wx.getUserProfile({
       desc: '微信登录',
       success: res => {
        app.globalData.userInfo=res.userInfo;
        wx.login({
         success(res) {
           console.log('login code',res);
           var shop=app.globalData.shop;
           var shop_id=app.globalData.shop_id;
           if(shop){shop_id=shop.id;}
           if(!shop_id){shop_id=0;}
               wx.request({
                 url: app.globalData.server+'server.php', // 目标服务器url
                 header:{'content-type':'application/x-www-form-urlencoded'},
                 method:'POST',
                 data: {
                   ac: 'wx_login',
                   nickName: app.globalData.userInfo.nickName,
                   logo: app.globalData.userInfo.avatarUrl,
                   city: app.globalData.userInfo.city,
                   province: app.globalData.userInfo.province,
                   encryptedData: res.encryptedData,
                   iv: res.iv,
                   sign: res.signature, 
                   code: res.code,
                   from_id: app.globalData.from_id ? app.globalData.from_id : 0,
                   user_session:app.globalData.user_session?app.globalData.user_session:0,
                   adm:app.globalData.adm?app.globalData.adm:0,
                   app_id:app.globalData.app_id?app.globalData.app_id:0,
                   shop_id:shop_id,//门店
                 },
                 success: (res) => {console.log(res.data)
                   if (res.data.err == 'ok') {
                     app.globalData.user_id = res.data.id;
                     app.globalData.session = res.data.session;
                     app.globalData.user_info = res.data;
                     res.data.user_id = res.data.id;
                     console.log('登录成功')
                     try {
                       wx.setStorageSync('login_info', JSON.stringify(res.data))
                     } catch (e) { }
                     resolve('ok')
                   } else {
                     console.log('登录错误',res.data);
                     app.msg('登录错误:'+res.data.err);
                   }
                 }
               }); 
             },
   
         fail(res) {
           console.log(`login调用失败`);
         }
       });
 
       }
     })
   });
 }
 
 
 
 function get_time(start,end){
 var time=end-start;if(time<0){return 0;}
 var h='';
 var day=Math.floor(time/(3600*24));
 if(day){h+=day+'天';time=time-day*3600*24;}
 var hour=Math.floor(time/3600);
 if(hour){h+=hour+'时';time=time-hour*3600;}
 var minit=Math.floor(time/60);
 if(minit){h+=minit+'分';time=time-minit*60;}
 h+=time+'秒';
 return h;
 }
 
 function number_fromat(num, n) {
   var nn = parseFloat(num);
   return nn.toFixed(n);
 }
 
 function get_dis(lat1,long1,lat2,long2,acs){//获取两地距离
   console.log(lat1,long1,lat2,long2)
 var earch=6370.996;
 var pi=3.1415926;
 var r1=lat1*pi/180;
 var r2=lat2*pi/180;
 var l1=long1*pi/180;
 var l2=long2*pi/180;
 var a=r1-r2;
 var b=l1-l2;
 console.log(a,b);
 var cc=Math.pow(Math.sin(a/2),2)+Math.cos(r1)*Math.cos(r2)*Math.pow(Math.sin(b/2),2);
 console.log(cc);
 var dis=2*Math.asin(Math.sqrt(cc));
 var dis=Math.ceil(dis*earch*1000);
 console.log(dis);
 if(acs==1){return dis;}
 if(dis>1000){
 return number_fromat(dis/1000,2)+'千米';
 }else{
 return number_fromat(dis,1)+'米';
 }
 }
 
 function q(id){ return new Promise((resolve, reject) => {
 const query = wx.createSelectorQuery();
 query.select(id).boundingClientRect();
 query.selectViewport().scrollOffset();
 query.exec(function(res){
   resolve(res)
 });
 });
 }
 
 function is_phone(num){
   let reg = /^1(3[0-9]|4[5,7]|5[0,1,2,3,5,6,7,8,9]|6[2,5,6,7]|7[0,1,7,8]|8[0-9]|9[1,8,9])\d{8}$/;
   return reg.test(num);
 }
 
 function scan(){//扫描二维码
   wx.scanCode({
     onlyFromCamera: true,success(res){
       console.log(res)
       var that=this;
   switch(res.scanType){
   case 'QR_CODE'://二维码
   //console.log(res.result)
   var r=res.result.split('|');
 switch(r[0]){
   default://默认
   wx.navigateTo({
     url: r[0],
   })
   break;
   case 'go'://跳转页面
   wx.navigateTo({
     url: r[1],
   })
   break;
   case 'rgo':
   wx.redirectTo({
     url: r[1],
   })
   break;
   case 'home':
   wx.reLaunch({
     url: '/pages/index/index',
   })  
   break;
   case 'ac'://命令
   eval(r[1])
   break;
   case 'help'://显示帮助
   wx.navigateTo({
     url: '/pages/help/index?'+r[1],
   })
   break;
 }
   break;//qrcode
   case 'WX_CODE'://小程序码
   if(res.result=='*'){
     wx.showModal({
       title: '错误',content:'抱歉，您扫描的小程序码有误！'
     })
     return;}
  var val=res.path.split('?scene=');
  var url=val[0];
  var query=val[1];if(!query){query='';}
  if(query){
    if(query.indexOf('%')==-1){query=encodeURIComponent(query)}
  }
   wx.redirectTo({
     url: '/'+url+'?scene='+query,
   })
   break;
 
   }
   
     }
   })
 }
 
 function rand(max){
  return Math.floor(Math.random() * max)
 }
 
 function view_add(ac){//添加浏览情况
 if(!ac){return}var app = getApp();
 if(!app.globalData.view){app.globalData.view=[]}
 app.globalData.view.push({ac:ac,time:(new Date()).getTime()});
 }
 
 
 function scrollTo(item,time) {
   if(!time){time=0;}
    wx.createSelectorQuery().select(item).boundingClientRect(res => {
      wx.pageScrollTo({
        scrollTop: res.top, 
        duration: time 
      })
    }).exec()
 }
 
 
 function upload(data){//获取位置
    var app = getApp();
    var user_id=app.globalData.user_id;
    var session=app.globalData.session;
    return new Promise((resolve, reject) => {
       const uploadTask = wx.uploadFile({
          url: app.globalData.server+'/server.php',
          filePath:data['tempFilePath'],
          name: 'file',
          formData:{
            ac:'upload_file',user_id:user_id,session:session,size:data['size'],id:data.id,c:data.c?data.c:'',name:data['tempFilePath']
            
          },
          success (res){
            console.log('成功',res.data);
            var x=''
          if(res.data){
              x=res.data.split('||');
          }
           
            if(x[0]=='ok'){
            resolve({err:'ok',id:x[1],img:x[2],img_240:x[3],img_480:x[4],img_750:x[5],img_id:x[6]});
          }else{resolve(res.data)}
          }
        })
        
        //uploadTask.onProgressUpdate((res) => {
          //resolve(res.progress);
          //console.log('上传进度', res.progress)
        //  console.log('已经上传的数据长度', res.totalBytesSent)
         // console.log('预期需要上传的数据总长度', res.totalBytesExpectedToSend)
       // })
    });
  }
 
 module.exports = { indexOf: indexOf, number_fromat: number_fromat, go_login: go_login,get_dis:get_dis,get:get,q:q,get_time:get_time,is_phone:is_phone,get_phone:get_phone,get_pos:get_pos,scan:scan,rand:rand,view_add:view_add,scrollTo:scrollTo,upload:upload }
 