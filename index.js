  // 获取元素
  var canvas = document.getElementById('myCanvas');
  canvas.ctx = canvas.getContext('2d');
  var all = [],timer,heroX,backgroundFun,personFun,isOverFlag;
  var windowHeight = window.innerHeight;
  var windowWidth = window.innerWidth;

  // 兼容性处理
	window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame;
	window.cancelAnimationFrame = window.cancelAnimationFrame || window.webkitCancelAnimationFrame;
	var lastTime = 0;
  window.requestAnimationFrame = function (callback) {
    var currTime = new Date().getTime();
    var timeToCall = Math.max(0, 16.7 - (currTime - lastTime));
    var id = window.setTimeout(function () {
      callback(currTime + timeToCall);
    }, timeToCall);
    lastTime = currTime + timeToCall;
    return id;
  };
  window.cancelAnimationFrame = function (id) {
    clearTimeout(id);
  };

  // 利用 CSS3 旋转 对根容器逆时针旋转 90 度
  var detectOrient = function () {
    var width = document.documentElement.clientWidth,
      height = document.documentElement.clientHeight,
      $wrapper = document.getElementById("J_wrapper"),
      style = "";
    if (width >= height) { // 横屏
      style += "width:" + width + "px;"; // 注意旋转后的宽高切换
      style += "height:" + height + "px;";
      canvas.height = height;
      canvas.width = width;
    } else { // 竖屏
      style += "width:" + height + "px;";
      style += "height:" + width + "px;";
      canvas.height = width;
      canvas.width = height;
    }
    backgroundFun = new background();
    backgroundFun.w = canvas.width;
    backgroundFun.h = canvas.height;
    $wrapper.style.cssText = style;
  }
  window.onresize = function(){
    detectOrient();
    if (document.querySelector('#page3').classList.contains('active')) {
      init();
    }
  };
  detectOrient();

  // 背景
  function background(){
    this.x = 0; //初始X轴位置
    this.y = 0; //初始Y轴位置
		this.w = canvas.width; //宽度
    this.h = canvas.height; //高度
		this.dx = 0; //图片在雪碧图的X轴位置
		this.dy = 7546; //图片在雪碧图的Y轴位置
    this.mh = 7546; // 向上爬行高度
    this.speed = 1; //运动基础速度
  }
  // 小人
  function person(){
    this.x = canvas.width / 2 - 135 / 2;// 小人初始X轴位置
		this.y = canvas.height - 120;// 小人初始Y轴位置
		this.dx = 0;
		this.dy = 740;
		this.w = 135;
    this.h = 159;
    this.blood = 100; //血量
    this.role = 'person';
    this.state = 1;
    this.stateNum = 0;
  }

  // 雪球
  function snowBall(){
    this.x = parseInt(Math.random() * 460 + 50);
		this.y = -41.5;
		this.dx = 157;
		this.dy = 0;
		this.w = 81;
    this.h = 83;
    this.speed = 3;
    this.effect = -15;
    this.role = 'snowBall';
  }

  // 雪块
  function snowBlock(){
    this.x = parseInt(Math.random() * 460 + 50);
		this.y = -31.5;
		this.dx = 70;
		this.dy = 0;
		this.w = 81;
    this.h = 81;
    this.speed = 1;
    this.effect = -8;
    this.role = 'snowBlock';
  }

  // 药瓶
  function bloodBottle(){
    this.x = parseInt(Math.random() * 460 + 50);
		this.y = -40.5;
		this.dx = 0;
		this.dy = 0;
		this.w = 55;
    this.h = 81;
		this.effect= 10;
    this.speed = 1;
    this.role = 'bloodBottle';
  }

  function init(){
    all = [];
		drawImages.timestamp = 0;
    invasion.m = 0;
    heroX = canvas.width / 2 - 88 / 2; //小人初始位置的X轴坐标赋值
    document.getElementById('audio').play();
    personFun = new person();
    all.push(backgroundFun);
    all.push(personFun);
    drawImages();
  }

  function drawImages(){
		canvas.ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawImages.timestamp += 10;//刷新掉落物品的时间
    if(all != ''){
      invasion(drawImages.timestamp);
      all.forEach(function(item){
        setTimeout(function() {
          if (item.y > windowHeight && all != '') all.remove(item);
        }, 1000);
        canvas.ctx.beginPath();
        canvas.ctx.globalAlpha = 1;
        var total = item.__proto__.constructor.name;
        if(total == 'snowBall'){ // 判断是否为雪球
          item.y += (1.5 * item.speed);
        }else if(total == 'snowBlock'){ // 判断是否为雪球
          item.y += item.speed;
        }else if(total == 'bloodBottle'){//判断是否为血药
          item.y += item.speed;
        }else if(total == 'person'){// 判断是否为小人
          item.x = heroX;
        }
        if(total == 'background'){
          item.dy -= item.speed;
          // 距离展示
          moveDistance(item);
          function moveDistance(item){
            document.querySelector('.moveNum').innerHTML = parseInt(item.mh-item.dy)+'m';
            document.querySelector('#moveDistance').style.bottom = (item.mh-item.dy)/item.mh*147+ 10 +'px';//实时记录血量变化
          }
          if(item.dy <= 0){
            isOverFlag = true;
            isOver(isOverFlag);
          }
          canvas.ctx.drawImage(raiden_bg,item.dx,item.dy,item.w,item.h,item.x,item.y,item.w,item.h);
        }else if(total == 'person'){
          item.stateNum+=0.1;
          item.blood -= 0.03;
          bloodVolume(item.blood);//实时记录血量变化
          if(item.blood <= 0){
            isOverFlag = false;
            isOver(isOverFlag);
          }
          switch (parseInt(item.state)) {
            case 0: //向左爬动
              personAnimate(item,265);
              break;
            case 1: //未移动
              personAnimate(item,430);
              break;
            case 2: //像右移动
              personAnimate(item,100);
              break;
          }
        }else{
          canvas.ctx.drawImage(raiden_props,item.dx,item.dy,item.w,item.h,item.x,item.y,item.w/2,item.h/2);
        }
      })
    }
    try {
			drawImages.timer = requestAnimationFrame(drawImages);
    } catch (error) {}
    all && all.forEach(function (item) {
      drawImages.first = item;
      all && all.forEach(function (other) {
        drawImages.another = other;
        drawImages.another !== drawImages.first && ishit(drawImages.first, drawImages.another);
      });
    });
  }

  // 出现怪物的频次以400毫秒为基准，逐次递减
	function invasion(timestamp) {
		invasion.speed = (400 - parseInt(timestamp / 400));
    invasion.t = parseInt(timestamp / invasion.speed);
		if (invasion.t > invasion.m) {
      if(invasion.t % 4 == 0){
        all.push(new snowBall());
      }
      if(invasion.t % 7 == 2){
        all.push(new snowBlock());
      }
      if(invasion.t % 7 == 0){
        all.push(new bloodBottle());
      }
      invasion.m = invasion.t;
    }
  };

  /*
	 *	碰撞检测 *
	 */
	function ishit(b,a) {
		var h, v;
		if (a.role !== b.role) {
			// 礼物或者炸弹 碰撞检测
			if ((a.role === 'snowBall' || a.role === 'snowBlock' || a.role === 'bloodBottle') && b.role === 'person') {
				h = a.x > b.x ? Math.abs(a.x - b.x + a.w/2) : Math.abs(b.x - a.x + b.w/2);
				v = a.y > b.y ? Math.abs(a.y - b.y + a.h/2) : Math.abs(b.y - a.y + b.h/2);
				if (h <= (a.w/2 + b.w/2) && v <= (a.h/2 + b.h/2)) {
          b.blood += premium(a);
          if(b.blood >= 100) b.blood = 100; //吃药大于100限制最大值
          isOverFlag = false;
          if (b.blood <= 0) isOver(isOverFlag); //游戏失败结束
          bloodVolume(b.blood);//实时记录血量变化
				}
			}
		}
	};

	// 技能效果及加分
	function premium(a) {
    var number = 0;
		explosion(a); //碰到炸弹爆炸
    number = + a.effect;
		return number;
	};
	// 碰到炸弹爆炸
	function explosion(o) {
		if (o.role === 'snowBall' || o.role === 'snowBlock') {
			var x = o.x - (213/2 - o.w/2) / 2;
      var y = o.y - (178/2 - o.h/2) / 2;
      canvas.ctx.drawImage(raiden_props, 0, 600, 213, 178, x, y, 213/2, 178/2);
      decelerate();
    }
    all.remove(o);
	}

  	// 移动小人
	var timeOutEventLeft,timeOutEventRight,timerLeft,timerRight;
	left.addEventListener('touchstart',function(e){
		timeOutEventLeft = setTimeout(longPressLeft,0);
    clearInterval(timerRight);
    personFun.state = 0;
		e.preventDefault();
	});
	left.addEventListener('touchmove',function(e){
		clearTimeout(timeOutEventLeft);
		clearInterval(timerLeft);
    timeOutEventLeft = 0;
	});
	left.addEventListener('touchend',function(e){
		clearTimeout(timeOutEventLeft);
    clearInterval(timerLeft);
    personFun.state = 1;
		return false;
	});
	function longPressLeft(){
		timeOutEventLeft = 0;
    //执行长按事件的行为
		clearInterval(timerLeft);
		timerLeft = setInterval(function(){
			if (heroX <= 50) {
				heroX = 50;
			}else{
				heroX -=5;
      }
		}, 50);
  }

	right.addEventListener('touchstart',function(e){
		clearInterval(timerLeft);
    timeOutEventRight = setTimeout(longPressRight,0);
    personFun.state = 2;
		e.preventDefault();
	});
	right.addEventListener('touchmove',function(e){
		clearTimeout(timeOutEventRight);
		clearInterval(timerRight);
    timeOutEventRight = 0;
	});
	right.addEventListener('touchend',function(e){
		clearTimeout(timeOutEventRight);
    clearInterval(timerRight);
    personFun.state = 1;
		return false;
	});
	function longPressRight(){
		//执行长按事件的行为
    timeOutEventRight = 0;
		clearInterval(timerRight);
		timerRight = setInterval(function(){
			if (heroX >= canvas.width - 100) { //640-人物宽
				heroX = canvas.width - 100;
			}else{
				heroX += 5;
			}
		}, 50);
  }
  function isOver(isOverFlag) {
    cancelAnimationFrame && cancelAnimationFrame(drawImages.timer);
    canvas.ctx.clearRect(0, 0, canvas.width, canvas.height);
    if(isOverFlag){ // 成功登顶
      Carousel.showRule(document.querySelector('#page3'),document.querySelector('#page5'));
    }else{ // 登顶失败
      Carousel.showRule(document.querySelector('#page3'),document.querySelector('#page4'));
      all.forEach(function(item){
        var total = item.__proto__.constructor.name;
        if(total == 'background'){ // 判断是否为雪球
          document.querySelector('.p4-t2').innerHTML = parseInt(item.mh - item.dy)+'m';
        }
      })
    }
    document.getElementById('audio').pause();
    all = '';
  };

  // 小人动画
  function personAnimate(item,dy){
    item.dx = parseInt(item.stateNum) % 6 * 135;
    item.dy = dy;
    canvas.ctx.drawImage(raiden_props,item.dx,item.dy,item.w,item.h,item.x,item.y,item.w/2,item.h/2);
  }
  // 碰撞减速
  function decelerate(){
    all.forEach(function(item){
      var total = item.__proto__.constructor.name;
      if(total == 'bloodBottle' || total == 'snowBlock' || total == 'background'){
        item.speed -= 0.5;
        setTimeout(function(){
          item.speed = 1;
        }, 500);
      }
    })
  }
  // 血量展示
  function bloodVolume(blood){
    document.querySelector('#bloodVolume').style.height = blood/100*140 +'px';//实时记录血量变化
  }
  // 距离展示
  function moveDistance(y){
    document.querySelector('#moveDistance').style.bottom = y/100*140 + 10+'px';//实时记录血量变化
  }
  // 获取小人的当前移动状态
  function personStateGet(num){
    var _num = num;
    all.forEach(function(item){
      var total = item.__proto__.constructor.name;
      if(total == 'person'){ // 判断是否为雪球
        item.state = _num;
      }
    })
  }