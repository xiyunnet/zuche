var app = getApp()
var fun = require('../fun.js');
var QQMapWX = require('../mapsdk.js');
var qqmapsdk ;//解析地址
Page({
  data: {
    nav:{top:app.globalData.nav_top,title:'地图导航',home:'show',back:'show',safe_top:app.globalData.safe_top,safe_bottom:app.globalData.safe_bottom},page:1,img_replace:0,map_show:1,setting:{},show_shop:'',ac:'list',scale:18,degree:0,addr_show:0,set_start:0,set_end:0,mode:'driving',search_show:0,region:[],policy:'REAL_TRAFFIC',mode_type:'驾车',policy_type:'最省时间',ac:'list'
  },

  onLoad: function (op) {
      if(!app.globalData.map_key){app.err('您没有设置腾讯地图密匙，请先获取并在后台设置后，重新上传应用');return;}else{
         qqmapsdk = new QQMapWX({key:app.globalData.map_key});
      }
      console.log(op)
   var latitude=op.latitude;//获取传输过来的
   var longitude=op.longitude;
   if(!latitude){latitude=op.lat;}
   if(!longitude){longitude=op.lng;}

   if(latitude=='undefined' || latitude=='null'){latitude='';longitude='';}
   var ac=op.ac;
if(latitude && longitude){//如果存在坐标
latitude=parseFloat(latitude);
longitude=parseFloat(longitude);
if(latitude>0 && longitude>0){}else{app.err('传入的经纬度数据错误');return;}
   var marker=this.data.marker;if(!marker){marker=[]}
   let icon='/pages/img/d.png';
   if(ac!='point'){ac='daohang';}//如果没有设置，则导航
   if(ac=='daohang'){
   marker[2]={id:1999,longitude:longitude,latitude:latitude,iconPath:icon,width:'10px',height:'10px',customCallout:{display:'ALWAYS',anchorX:'-10',anchorY:'30'},zIndex:110}
   this.get_marker_info(2);
}else{//如果不是导航 则为选点
   marker[1]={id:999,longitude:longitude,latitude:latitude,iconPath:icon,width:'10px',height:'10px',customCallout:{display:'ALWAYS',anchorX:'-10',anchorY:'30'},zIndex:110}
   if(ac=='point'){
      if(latitude){
         this.data.point=[latitude,longitude];
     // this.setData({latitude:latitude,longitude:longitude})
   }

   }
}
   
}//当有经纬度参数传入的时候

//无参数
if(!ac){ac='list'}
this.setData({ac:ac});
var msg=op.msg;//如果有提示，则显示提示
if(msg){app.err(msg)}

  },

  onReady: function () {
    var marker=this.data.marker;
    if(!marker){marker=[]}
    var that=this;
    fun.get_pos().then(res=>{//获取位置
      if(res.err!='ok'){app.err('获取位置失败，请点击胶囊按钮，选择设置并打开地图权限');return;}//错误
      app.globalData.latitude=res.latitude;//我的经纬度
      app.globalData.longitude=res.longitude;
      
      //我的位置
      var icon='/pages/img/d.png';
      marker[0]={id:9999,longitude:res.longitude,latitude:res.latitude,iconPath:icon,width:'10px',height:'10px',customCallout:{display:'ALWAYS',anchorX:'-10',anchorY:'20'},zIndex:100};//我的位置

if(!marker[1]){//导航起点
      marker[1]={id:999,longitude:res.longitude,latitude:res.latitude,iconPath:icon,width:'10px',height:'10px',customCallout:{display:'ALWAYS',anchorX:'-10',anchorY:'30'},zIndex:110};//起点
      if(this.data.ac=='daohang'){this.get_marker_info(1);}
   }
if(!marker[2]){//导航终点
   marker[2]={id:1999,longitude:res.longitude,latitude:res.latitude,iconPath:icon,width:'10px',height:'10px',customCallout:{display:'ALWAYS',anchorX:'-10',anchorY:'30'},zIndex:110};//终点
   if(this.data.ac=='daohang'){this.get_marker_info(1);}
}
     console.log('初始化设置',marker)
    this.setData({marker:marker});
    
    this.LocationChange();
    if(this.data.ac=='daohang'){//如果已经存在在点了
      this.setData({set_end:1,set_start:1})
      this.daohang();
      return;
   }
   if(this.data.ac=='point'){//选点
      console.log('进行选点',marker);
      if(this.data.point){
         this.get_pos_info(this.data.point[0],this.data.point[1]);
      }else{
   this.get_pos_info(marker[1].latitude,marker[1].longitude);
}
return;
   }

this.setData({latitude:res.latitude,longitude:res.longitude});
//默认，获取当地的位置，和门店信息

qqmapsdk.reverseGeocoder({//获取信息
   location:{latitude:res.latitude,longitude:res.longitude},
   get_poi:1,//获取附近poi点
   success(res){
     that.data.is_get_pos=0;
     console.log('获取位置信息',res);
var addr=res.result.address_component;

var region=[addr.province,addr.city,addr.district];
that.setData({dist:addr.district,region:region,my_region:region});
that.get_shop_list(res.latitude,res.longitude,region);//获取门店
   }
 })


return;
//如果都不是 则获取相应的门店
var shop_id=this.data.shop_id;if(!shop_id){shop_id=0;}
fun.get({ac:'get_shop_list',longitude:res.longitude,latitude:res.latitude,id:shop_id,path:''}).then(res=>{

  for(var i in res.shop_list){   var is_select='';
    var s=res.shop_list[i];
    if(s.id==res.shop.id){shop_id=s.id;
      is_select='is_select_shop';
    this.setData({latitude:s.latitude,longitude:s.longitude});//设置中心点
    this.get_pos_info(s.latitude,s.longitude,s.shop_name);
  }

  marker.push({id:parseInt(i)+103,longitude:s.longitude,latitude:s.latitude,iconPath:'/pages/img/point.png',width:'14px',height:'14px',title:s.shop_name,addr:s.addr,customCallout:{display:'ALWAYS',anchorX:'-10',anchorY:'-10'},zIndex:20,shop:s,is_select:is_select});//终点
  }
  console.log(marker)
  
          this.setData({list:res.shop_list,shop:res.shop,marker:marker,set_start:1,show_jt:1,get_my_position_show:1,shop_id:shop_id});
          setTimeout(function(){that.get_marker_info(1);},200);//获取出发点位置信息
        })


  // this.get_pos_info(res.latitude,res.longitude);
    })
  },
get_shop_list(latitude,longitude,region){
   var key=this.data.key;if(!key){key='';}
   if(!region){region=this.data.region;}
   var my_region=this.data.my_region;//我的地区
   fun.get({ac:'get_index',longitude:longitude,latitude:latitude,key:key,region:JSON.stringify(region)}).then(res=>{//读取附近信息
      var marker=this.data.marker;if(!marker){marker={}}
      marker=this.clean_marker(marker);
      if(res.list){
      for(var i in res.list){
      var n=res.list[i];
      marker.push({id:parseInt(i)+103,longitude:n.lng,latitude:n.lat,iconPath:'/pages/img/point.png',width:'14px',height:'14px',title:n.shopname,addr:n.addr,customCallout:{display:'ALWAYS',anchorX:'-10',anchorY:'-10'},zIndex:20,shop:n});
   }
      }else{
      if(key){app.err('抱歉，没有找到租车门店');}else{
      app.err('抱歉，该区域还没有租车门店');
      }
      }
//位置 是否调整经纬度
var lat=app.globalData.latitude;var lng=app.globalData.longitude;//位置
console.log(region,my_region);
//app.err(region[2]+' '+my_region[2]);
if(region[2]!=my_region[2] && res.list){
lat=res.list[0].lat;
lng=res.list[0].lng;

}
      this.setData({marker:marker,addr_show:0,user:res.user,latitude:lat,longitude:lng})
      })
},
clean_marker(marker){//清理marker
   //console.log(marker)
for(var i in marker){
var id=parseInt(marker[i].id)
//console.log('id',i,id)
if(id>100 && id<888){
   //console.log('aaa',i)
   marker.splice(i,1);
}

}
return marker;
},

  LocationChange(){
    var that=this;
    wx.onLocationChange(function(res){
      var marker=that.data.marker;
      if(!marker){return}
      marker[0].latitude=res.latitude;
      marker[0].longitude=res.longitude;
      marker[0].speed=res.speed;
      marker[0].altitude=res.altitude;//高度
      app.globalData.latitude=res.latitude;//我的经纬度
      app.globalData.longitude=res.longitude;
      that.setData({marker:marker})
      console.log(res)
    })
    
  },


  get_my_position(e){//获取我的定位的
var latitude=app.globalData.latitude;
var longitude=app.globalData.longitude;
if(this.data.is_daohang==1){//导航则到导航起点
var marker=this.data.marker;
latitude=marker[1].latitude;
longitude=marker[1].longitude;
}

this.setData({latitude:latitude,longitude:longitude,get_my_position_show:0,scale:18,show_jt:0,addr_show:0});
if(this.data.ac=='list'){}else{//如果是列表 到我的点
this.get_pos_info(app.globalData.latitude,app.globalData.longitude);
}
  },

  regionchange(e){//地图移动
    console.log(e);
    if(e.type=='begin' && e.causedBy=="gesture"){
      //管理罗盘
      //wx.stopCompass();
      this.data.show_jt_temp=this.data.show_jt;
      var show_jt=1;
      if(this.data.ac=='list'){show_jt=0}
     this.setData({addr_show:0,show_jt:show_jt});
    }
    if(e.type=='end' && e.causedBy=='scale'){
      this.setData({show_jt:this.data.show_jt_temp});
    }
    if(e.type=='end' && e.causedBy=="drag"){//拖到结束
      var latitude=e.detail.centerLocation.latitude;
      var longitude=e.detail.centerLocation.longitude;
      this.data.is_select_marker=0;//不是点击的
      this.setData({get_my_position_show:1});
      if(this.data.search_show==1){
if(this.data.click_poi==1){//点击的可以获取
   this.get_pos_info(latitude,longitude);
   this.data.click_poi=0;
}else{
}
      }else{
         if(this.data.ac=='point'){this.get_pos_info(latitude,longitude);}
   if(this.data.ac=='list'){this.setData({latitude:latitude,longitude:longitude})}//如果为列表，拖到单位到新位置
}

    }
  },
  get_marker_info(id,name){//获取信息
  var is_get_pos=this.data.is_get_pos;//是否正在获取
  if(is_get_pos==1){return;}
  this.data.is_get_pos=1;
var that=this;var marker=this.data.marker;if(!marker){marker=[]}
  qqmapsdk.reverseGeocoder({
    location:{latitude:marker[id].latitude,longitude:marker[id].longitude},
    success(res){
      that.data.is_get_pos=0;
      console.log('获取选点的位置信息',id,res);
var addr={}
addr.address=res.result.address;
addr.title=res.result.formatted_addresses.recommend;
if(name){addr.title=name;}
addr.lat=res.result.location.lat;addr.lng=res.result.location.lng;
addr.latitude=res.result.location.lat;addr.longitude=res.result.location.lng;
addr.pro=res.result.address_component.province;
addr.city=res.result.address_component.city;
addr.dist=res.result.address_component.district;
var region=[addr.pro,addr.city,addr.dist];
marker[id].addr=addr;

that.setData({marker:marker,region:region,addr:addr,dist:addr.dist})
    }
  })
},


get_pos_info(latitude,longitude,name,poi_id){//dh_go 是否导航 获取点的详细信息
   if(this.data.is_daohang==1){this.setData({latitude:latitude,longitude:longitude});return;}
  if(this.data.is_get_pos==1){return;}//是否正在获取
  this.data.is_get_pos=1;//数据或者中
var that=this;
var marker=this.data.marker;if(!marker){marker=[]}
  qqmapsdk.reverseGeocoder({
    location:{latitude:latitude,longitude:longitude},
    get_poi:1,//获取附近poi点
    success(res){
      that.data.is_get_pos=0;
      console.log('位置信息',res);
var addr={}
addr.address=res.result.address;
addr.title=res.result.formatted_addresses.recommend;
if(name){addr.title=name;}
addr.lat=res.result.location.lat;addr.lng=res.result.location.lng;
addr.latitude=res.result.location.lat;addr.longitude=res.result.location.lng;
addr.pro=res.result.address_component.province;
addr.city=res.result.address_component.city;addr.dist=res.result.address_component.district;
var region=[addr.pro,addr.city,addr.dist];
if(that.data.set_start==0){
marker[1].latitude=latitude;
marker[1].longitude=longitude;
marker[1].addr=addr;
if(poi_id){marker[1].poi_id=poi_id;}
}else{//设置终点
  if(that.data.set_end!=1){
  marker[2].latitude=latitude;
  marker[2].longitude=longitude;
  marker[2].addr=addr;
  if(poi_id){marker[2].poi_id=poi_id;}
}}
var pois=res.result.pois;
if(res.result.pois && (that.data.is_search!=1 || that.data.is_select_marker!=1) ){//对点进行
that.marker_add(pois);//添加点
}
that.setData({latitude:latitude,longitude:longitude,marker:marker,addr:addr,addr_show:1,region:region,dist:addr.dist})
    }
  })
},

marker_add(pois,region){//添加点
   if(this.data.ac!='point'){return;}//如果不是选点 则不执行
var marker=this.data.marker;
var len=Object.keys(marker).length-3;
marker.splice(3,len);
console.log('存在的',marker,len)
for(var i in pois){
if(region){
if(region[2]==pois[i].district){
   this.setData({latitude:pois[i].location.lat,longitude:pois[i].location.lng})
}
}

marker.push({id:parseInt(i)+3,longitude:pois[i].location.lng,latitude:pois[i].location.lat,iconPath:'/pages/img/point.png',width:'14px',height:'14px',title:pois[i].title,addr:pois[i].address,poi_id:pois[i].id,callout:{content:pois[i].title,fontSize:10,borderRadius:5,bgColor:'#ffffff',padding:5,display:'ALWAYS'},zIndex:1});//终点
}
this.setData({marker:marker})

},



get_pos(e){//点击地图点 poi点
  console.log(e.detail)
  this.data.click_poi=1;//点击的
this.get_pos_info(e.detail.latitude,e.detail.longitude,e.detail.name);
},
markertap(e){
var marker=this.data.marker;
this.data.is_select_marker=1;//点击的
var id=e.detail.markerId;
var title;
if(marker[id].title){title=marker[id].title;}
this.data.show_jt_temp=1;this.data.click_poi=1;
this.setData({addr_show:1,show_jt:1,shop:marker[id].shop});
console.log(marker[id].shop)
console.log(marker[id])
this.get_pos_info(marker[id].latitude,marker[id].longitude,title,marker[id].poi_id);
},select_this_marker(e){//选择点
var id=e.currentTarget.dataset.id;
var that=this;
this.data.is_select_marker=1;//点击的
var marker=this.data.marker;
var title;if(marker[id].title){title=marker[id].title;}
this.data.show_jt_temp=1;
if(this.data.ac=='list'){
   this.setData({shop_id:marker[id].shop.id})
}
this.setData({addr_show:1,show_jt:1});
if(this.data.ac=='point'){//选点
marker[1].latitude=marker[id].latitude;marker[1].longitude=marker[id].longitude;
this.setData({marker:marker,latitude:marker[id].latitude,longitude:marker[id].longitude});

this.get_marker_info(1);
//this.get_pos_info(marker[id].latitude,marker[id].longitude);
return;
}

this.get_pos_info(marker[id].latitude,marker[id].longitude,title);
},

compass(){
var that=this;
console.log('启动罗盘')
wx.startCompass({success(res){//罗盘
  if(res.errMsg=='startCompass:ok'){
    console.log('罗盘开启')
    //that.setData({show_jt:1})
    that.data.Compasssave=0;
wx.onCompassChange(function(res){
if(that.data.Compasssave%3==0){
//console.log('数据',res.direction)
var d=res.direction.toFixed(0);
that.setData({degree:d})
}
that.data.Compasssave++;
})
  }
  
}})},
set_position(e){//设置导航点
var set_start=this.data.set_start;
if(set_start!=1){
  var search_show=0;
if(this.data.start_search==1){//如果已经打开的搜索框，则不退出
  search_show=1;
}
this.setData({set_start:1,search_show:search_show,start_search:0});
}else{
   console.log('开始导航')
  this.setData({set_end:1,search_show:0});
this.daohang();
}
},
set_start(e){//重新设置开始点，并打开搜索栏目
   var marker=this.data.marker;
   this.setData({set_start:0,set_end:0,is_daohang:0,polyline:[],latitude:marker[1].latitude,longitude:marker[1].longitude});
   this.get_pos_info(marker[1].latitude,marker[1].longitude);
   this.data.start_search=1;
   this.search_show();
},
set_end(){//打开搜索框，判断是否是起点
if(this.data.get_my_position_show==1){//如果已经拖到
}else{//没有拖到，则直接定位开始
  if(this.data.start_search==1){}else{this.setData({set_start:1})}
}
  this.search_show();
},
search_show(){
   this.setData({search_show:1});
},

select_policy(e){
var c=e.currentTarget.dataset.c;
this.setData({policy:c});
console.log(c)
this.daohang();
},
select_mode(e){
  var c=e.currentTarget.dataset.c;
  this.setData({mode:c});
  this.daohang();
  },

daohang(e){//获取导航路径
  var _this=this;
  var is_get_daohang=this.data.is_get_daohang;
  if(is_get_daohang==1){return;}
  this.data.is_get_daohang=1;
  app.msg('导航计算中，请稍后...');
  var marker=this.data.marker;
  if(marker[1].latitude==marker[2].latitude){app.err('您选择的出发点与目的地相同');return;}
  var dis=fun.get_dis(marker[1].latitude,marker[1].longitude,marker[2].latitude,marker[2].longitude,1);//获取距离
  console.log('距离',dis)
var mode=this.data.mode;
var policy=this.data.policy;
var mode_type='驾车';
var policy_type='最省时间';
var scale=14;//缩放
var policy_text='';


var x_dis=dis;
if(mode=='driving'){
if(dis<2000){mode='bicycling';policy='REAL_TRAFFIC';scale=15;}//选择骑行
if(dis<500){mode='walking';policy='REAL_TRAFFIC';scale=17;}//选择步行
}else{
//if(mode=='walking'){
//if(dis>1000 && dis<20000){mode='bicycling';policy='REAL_TRAFFIC';scale=15;}
//if(dis>20000){mode='driving';policy='REAL_TRAFFIC';scale=14;}
//}
}
switch(mode){
   default:mode_type='驾车';break;
   case 'bicycling':mode_type='自行车';break;
   case 'walking':mode_type='步行';break;
   }
   if(!policy){policy_text='LEAST_TIME,REAL_TRAFFIC,NAV_POINT_FIRST';}else{
      policy_text=policy+',LEAST_TIME,NAV_POINT_FIRST';
    }

switch(policy){
default:policy_type='最省时间';break;
case 'LEAST_FEE':policy_type='最少收费';break;
case 'AVOID_HIGHWAY':policy_type='不走高速';break;
}
console.log('导航',mode,dis,marker[1],marker[2],policy_type,policy);

  qqmapsdk.direction({
    mode: mode,
    from: {latitude:marker[1].latitude,longitude:marker[1].longitude},
    to: {latitude:marker[2].latitude,longitude:marker[2].longitude}, 
    from_poi:marker[1].poi_id?marker[1].poi_id:0,
    to_poi:marker[2].poi_id?marker[2].poi_id:0,
    policy:policy_text,//策略
    success: function (res) {
console.log(res)
_this.data.is_get_daohang=0;
var ret = res;
var distance=res.result.routes[0].distance;//距离

if(distance>500){
var dd=Math.floor(distance/10000);
scale=scale-dd;
if(scale<5){scale=5;}

distance=fun.number_fromat(distance/1000,2)+'千米';}else{
distance=distance+'米';
}
var time=res.result.routes[0].duration;
if(time>60){
var hour=Math.floor(time/60);
var min=time-hour*60;
time=hour+'小时'+min+'分';
}else{
time=time+'分钟';
}
var coors = ret.result.routes[0].polyline, pl = [],colorList=[];
//坐标解压（返回的点串坐标，通过前向差分进行压缩）
var kr = 1000000;
for (var i = 2; i < coors.length; i++) {
coors[i] = Number(coors[i - 2]) + Number(coors[i]) / kr;
}
//将解压后的坐标放入点串数组pl中
for (var i = 0; i < coors.length; i += 2) {
pl.push({ latitude: coors[i], longitude: coors[i + 1] });
//var color=_this.get_color(i,coors.length);

if(i>0){
// colorList.push(color);
}
}
console.log(pl)
//设置polyline属性，将路线显示出来,将解压坐标第一个数据作为起点
var steps=ret.result.routes[0].steps;
if(steps){
  for(var i in steps){
var dis=parseInt(steps[i].distance);
if(dis<600){
  dis=dis+'米'
}else{
  dis=fun.number_fromat(dis/1000,2)+'千米';
}
steps[i].distance=dis;

  }
}

_this.setData({policy_type:policy_type,
   mode_type:mode_type,})

_this.setData({
mode:mode,
latitude:pl[0].latitude,
longitude:pl[0].longitude,
time:time,
distance:distance,
scale:scale,
dis:x_dis,//距离
steps:steps,//路径步骤
is_daohang:1,
policy_type:policy_type,
mode_type:mode_type,
polyline: [{
  points: pl,
  color: '#0084ecDD',
  //colorList:colorList,
  width:6
}]
})

    }
  });
},
callouttap(e){//设置起点
   console.log('标签点击',e)
   var markerId=e.markerId;
   var marker=this.data.marker;
   var that=this;
if(markerId==999){
this.setData({set_start:0,set_end:0,is_daohang:0,polyline:[]});
this.setData({set_end:0})
this.get_pos_info(marker[1].latitude,marker[1].longitude);
}
if(markerId==1999){//终点
   console.log('点击终点')
   this.setData({set_end:0,is_daohang:0,polyline:[]});
   this.setData({set_end:0})
   this.search_show();
   }
if(markerId>=100 && markerId<=200){//门店
   console.log('点击门店')
   var shop_name='';
for(var i in marker){
   var id=parseInt(marker[i].id);
if(id==markerId){
   marker[i].is_select='is_select_shop';
   shop_name=marker[i].title;
   this.setData({latitude:marker[i].latitude,longitude:marker[i].longitude,shop_id:marker[i].shop.id,shop:marker[i].shop})
   marker[2].latitude=marker[i].latitude; marker[2].longitude=marker[i].longitude;
}else{
   marker[i].is_select='';
}
}
this.setData({marker:marker,show_jt:1,scale:18,set_end:0,is_daohang:0,polyline:[]});
setTimeout(function(){that.get_pos_info(marker[2].latitude,marker[2].longitude,shop_name);},100)
}

},


region_change(e){//选择点
console.log('region',e.detail)
var region_temp=this.data.region;
var region=e.detail.value;
this.setData({region:region,dist:region[2]});
if(region_temp[2]!=region[2]){//进行查找地址
   console.log('搜索',region)
this.map_search();
}
},
key_input(e){
   var val=e.detail.value;
   if(!val){val='';}
   console.log(val)
   this.data.key=val;
},
area_change(e){//选择区域
var region=e.detail.value;
console.log('area_change',region)
this.setData({region:region,dist:region[2],addr_show:0})
this.map_search();
},

map_search(){//搜索
var key=this.data.key;
var region=this.data.region;
var that=this;
var ac=this.data.ac;
if(ac=='list'){//查找门店
   this.get_shop_list();
   return;
}else{
if(!key){key=region[1]+region[2];}
}
if(!key){return;}
qqmapsdk.getSuggestion({
   keyword:key,
   region_fix:1,//自动扩展范围
  page_size:20,
  address_format:'short',
   region:region?region[1]:'',//位置
   //auto_extend:region?0:1,
   success(res){
console.log('搜索结果',res)
that.marker_add(res.data,region);//添加点
that.setData({addr_show:0,scale:14})
   },fail: function (res) {
      console.log(res);
    },


})


},

  onShow: function () {
    this.compass();//启动罗盘
    wx.startLocationUpdate();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
wx.stopCompass();
wx.stopLocationUpdate();
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
   wx.stopCompass();
   wx.stopLocationUpdate();
  },


  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },win_close(e){var c=e.currentTarget.dataset.c;this.setData({[c]:''})
  },win_show(e){ var c=e.currentTarget.dataset.c;this.setData({[c]:'show'})},
  page_show(e){this.setData({'page_show':true})},
  page_close(e){this.setData({'page_show':false})},
  back(e){wx.navigateBack({delta:0})},
  home(e){ wx.reLaunch({url: '/pages/index/index'})},
  rgo(e){wx.redirectTo({url: e.currentTarget.dataset.url})},
  login: function (e) { wx.navigateTo({url: '/pages/login/index'})},
  win_open(e){var c=e.currentTarget.dataset.c;this.setData({[c]:'show'})},//打开窗口
  win_close(e){var c=e.currentTarget.dataset.c;this.setData({[c]:''})},//关闭窗口
open_min(e){wx.navigateToMiniProgram({appId: e.currentTarget.dataset.url,path: '/pages/index/index',})}
,go(e){ wx.navigateTo({url: e.currentTarget.dataset.url})},
  select_this_point(e){//选择该地点
var marker=this.data.marker;
console.log(marker[1])
app.globalData.is_select_position=marker[1].addr;
this.back()

  },openlocatin(e){//打开导航
   var shop=this.data.shop;
   console.log('门店位置',shop)
   wx.openLocation({
      latitude:parseFloat(shop.lat),	//维度
      longitude:parseFloat(shop.lng), //经度
      name: shop.shopname,	//目的地定位名称
      scale: 15,	//缩放比例
      address: shop.addr	//导航详细地址
    })

  }

})

