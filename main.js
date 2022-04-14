define(function (require, exports) {
	//document.addEventListener(Event.Touch.move, Event.preventDefault);
	var raiden = document.getElementById('raiden');
	raiden.ctx = raiden.getContext('2d');

	window.addEventListener('DOMContentLoaded', function () {
		raiden.height = window.innerHeight;
		raiden.width = window.innerWidth;
		document.querySelector('.loading').classList.remove('loading-visible');
	});

	// 兼容性处理
	window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame;
	window.cancelAnimationFrame = window.cancelAnimationFrame || window.webkitCancelAnimationFrame;
	var lastTime = 0;
	if (!window.requestAnimationFrame) {
		window.requestAnimationFrame = function (callback) {
			var currTime = new Date().getTime();
			var timeToCall = Math.max(0, 16.7 - (currTime - lastTime));
			var id = window.setTimeout(function () {
				callback(currTime + timeToCall);
			}, timeToCall);
			lastTime = currTime + timeToCall;
			return id;
		};
	}
	if (!window.cancelAnimationFrame) {
		window.cancelAnimationFrame = function (id) {
			clearTimeout(id);
		};
	}

	//开始游戏
	var main = document.querySelector('.main');
	document.querySelector('.start').addEventListener('tap', function () {
		main.classList.add('visible');
		_countdown();
	})
	//倒计时
	var countdown1 = document.getElementById('countdown');

	function _countdown() {
		countdown1.classList.add('show');
		var num = parseInt(countdown1.getAttribute('data-number'));
		if (num === 1) {
			countdown1.classList.remove('show');
			_countdown.timer && clearTimeout(_countdown.timer);
			init();
			return;
		}
		num--;
		countdown1.setAttribute('data-number', num);
		countdown1.querySelector('span').innerHTML = num;
		countdown1.querySelector('span').className = 'number' + num;
		_countdown.timer = setTimeout(_countdown, 1e3);
	}

	var props = [],
		bullets = [],
		figure, heroX, heroY, all = [],background,timer;
	var monster = [{
		"dx": 311,
		"dy": 600,
		"w": 58,
		"h": 64,
		"effect": -6
	}, {
		"dx": 404,
		"dy": 600,
		"w": 78,
		"h": 85,
		"effect": -6
	}, {
		"dx": 523,
		"dy": 600,
		"w": 108,
		"h": 117,
		"effect": -6
	}, ];
	var diamonds = [{
		"dx": 0,
		"dy": 162,
		"w": 105,
		"h": 100,
		'effect': 10
	}, {
		"dx": 129,
		"dy": 162,
		"w": 119,
		"h": 100,
		'effect': 10
	}, {
		"dx": 269,
		"dy": 162,
		"w": 128,
		"h": 101,
		'effect': 10
	}, {
		"dx": 413,
		"dy": 162,
		"w": 100,
		"h": 101,
		'effect': 10
	}, {
		"dx": 537,
		"dy": 162,
		"w": 100,
		"h": 101,
		'effect': 10
	}, {
		"dx": 0,
		"dy": 0,
		"w": 70,
		"h": 72,
		'effect': 5
	}, {
		"dx": 101,
		"dy": 0,
		"w": 60,
		"h": 76,
		'effect': 5
	}, {
		"dx": 195,
		"dy": 0,
		"w": 63,
		"h": 71,
		'effect': 5
	}, {
		"dx": 287,
		"dy": 0,
		"w": 58,
		"h": 64,
		'effect': 5
	}, {
		"dx": 366,
		"dy": 0,
		"w": 69,
		"h": 76,
		'effect': 5
	}, {
		"dx": 456,
		"dy": 0,
		"w": 61,
		"h": 83,
		'effect': 5
	}, {
		"dx": 544,
		"dy": 0,
		"w": 48,
		"h": 48,
		'effect': 5
	}, {
		"dx": 544,
		"dy": 56,
		"w": 33,
		"h": 34,
		'effect': 5
	}, {
		"dx": 615,
		"dy": 0,
		"w": 51,
		"h": 50,
		'effect': 5
	}, {
		"dx": 678,
		"dy": 0,
		"w": 48,
		"h": 60,
		'effect': 5
	}, {
		"dx": 742,
		"dy": 0,
		"w": 88,
		"h": 105,
		'effect': 5
	}, {
		"dx": 839,
		"dy": 0,
		"w": 60,
		"h": 72,
		'effect': 5
	}, ]; //礼物 17
	// 初始化

	function init() {
		ishit.SCORE = 0;
		window.subtract = !1;
		window.delaySpeed = 1;
		window.bombing = !1; //控制小人是否遇到炸弹
		score.innerHTML = ishit.SCORE;
		attack.timestamp = 0;
		invasion.m = 0;
		time.countdown = 60; //游戏倒计时时间
		time.innerHTML = time.countdown;

		// 小人的初始化坐标
		heroX = 640 / 2 - 100 / 2; //100小人高
		heroY = parseInt(raiden.height) - 200;

		add(0, 323, 203, 100, 'figure'); //添加小人到画布
		add(0,3000-raiden.height,raiden.width, 3000,'background'); //添加背景图片到画布
		attack();

		timer && clearInterval(timer);
		timer = setInterval(countDown, 1000);
	};

	// 创建对象
	function generate(x, y, dx, dy, w, h, role, effect) {
		this.x = x;
		this.y = y;
		this.dx = dx;
		this.dy = dy;
		this.w = w;
		this.h = h;
		this.width = w;
		this.height = role === 'figure' || 'background' ? h : h - 30;
		this.role = role;
		this.effect = effect;
	};

	// 添加怪或道具之后加入到数组中，通过遍历数组得到每一个怪或道具
	function add(dx, dy, w, h, role, effect) { //参数（图片里的x，y位置，元素宽高，角色，effect）
		switch (role) {
			case 'figure':
				x = heroX;
				y = heroY;
				figure = new generate(x, y, dx, dy, w, h, role, effect);
				all.push(figure);
				break;
			case 'prop':
			case 'bomb': //炸弹和礼包出现的位置
				x = parseInt(Math.random() * 510), y = 0; //510=640-笔记本宽  /笔记本比较宽，计算出现的x范围
				props.push(new generate(x, y, dx, dy, w, h, role, effect));
				break;
			case 'background': //背景位置
				x = 0,y = 0;
				background = new generate(x, y, dx, dy, w, h, role, effect);
				console.log(JSON.stringify(background));
				all.push(background);
				break;
		};
	};


	// 出现怪物的频次以400毫秒为基准，逐次递减
	function invasion(timestamp) {
		invasion.speed = (400 - parseInt(timestamp / 400));

		invasion.t = parseInt(timestamp / invasion.speed);
		//console.log(invasion.t )
		if (invasion.t > invasion.m) {
			if (invasion.t % 6 == 0) { //出现炸弹的频率 6s
				//var position = monster[parseInt(Math.random()*3)]; //n为几个炸弹
				var position = monster[parseInt(Math.random() * 3)];
				add(position.dx, position.dy, position.w, position.h, 'bomb', position.effect);
			} else {
				//var position = diamonds[parseInt(Math.random()*3)]; //n为几个礼物
				var position = diamonds[parseInt(Math.random() * 17)];
				add(position.dx, position.dy, position.w, position.h, 'prop', position.effect);
			}
			invasion.m = invasion.t;
		}
		console.log(all);
		console.log(props);
	};
	/*
	 *	重绘，实现道具和怪，人物，子弹的移动
	 *	考虑到移动端的性能问题，这里将在超出画布的时候进行删减处理
	 * 	subtract为小人是否被击中的控制变量
	 */
	function attack() {
		all = [];
		raiden.ctx.clearRect(0, 0, raiden.width, raiden.height);
		if (!subtract) {
			attack.timestamp += 16;//刷新掉落物品的时间
			invasion(attack.timestamp);
		}

		raiden.ctx.beginPath();
		if (!subtract) background.dy -= delaySpeed;
		if(background.y == -3000 + raiden.height){
			clearInterval(timer);
			isOver();
			return false;
		}
		raiden.ctx.drawImage(raiden_bg, background.dx, background.dy, background.w, background.h, background.x, background.y, background.w, background.h);
		console.log(background.dy);
		all.push(background);
		// 小人
		figure.x = heroX;
		figure.y = heroY;

		raiden.ctx.drawImage(raiden_props, figure.dx, figure.dy, figure.w, figure.h, figure.x, figure.y, figure.w, figure.h);
		all.push(figure);

		// 怪物/魔法道具
		props.forEach(function (item) {
			raiden.ctx.beginPath();
			console.log(1);
			raiden.ctx.globalAlpha = 1;
			if (item.y > raiden.height) props.remove(item);
			if (!subtract) item.y += (12 * delaySpeed);
			raiden.ctx.drawImage(raiden_props, item.dx, item.dy, item.w, item.h, item.x, item.y, item.w, item.h);
		});
		try {
			attack.timer = requestAnimationFrame(attack);
			console.log(attack.timer)
		} catch (error) {}
		if (!subtract) {
			all = all.concat(bullets, props);
			all.forEach(function (item) {
				attack.first = item;
				all.forEach(function (other) {
					attack.another = other;
					attack.another !== attack.first && ishit(attack.first, attack.another);
				});
			});
		}
	};
	/*
	 *	碰撞检测 *
	 */
	function ishit(a, b) {
		var h, v;
		if (a.role !== b.role) {
			// 礼物或者炸弹 碰撞检测
			if ((a.role === 'prop' || a.role === 'bomb') && b.role === 'figure') {
				h = a.x > b.x ? Math.abs(a.x - b.x + a.width) : Math.abs(b.x - a.x + b.width);
				v = a.y > b.y ? Math.abs(a.y - b.y + a.height) : Math.abs(b.y - a.y + b.height);
				if (h <= (a.width + b.width) && v <= (a.height + b.height)) {
					ishit.SCORE += premium(b, a);
					if (ishit.SCORE <= 0) ishit.SCORE = 0;
					score.innerHTML = ishit.SCORE;
				}
			}
		}
	};

	// 技能效果及加分
	function premium(a, b) {
		var number = 0;
		//bullets.remove(a);
		explosion(b); //碰到炸弹爆炸
		number = +b.effect;
		return number;
	};
	// 碰到炸弹爆炸
	function explosion(o) {
		if (o.role === 'bomb') {
			var x = o.x - (232 - o.w) / 2;
			var y = o.y - (232 - o.h) / 2;
			raiden.ctx.drawImage(raiden_props, 0, 542, 232, 232, x, y, 232, 232);

			//bombing = true; //让小人哭开关
		}
		props.remove(o);
	}
	// 移动小人
	var timeOutEventLeft,timeOutEventRight,timerLeft,timerRight;
	left.addEventListener('touchstart',function(e){
		timeOutEventLeft = setTimeout(longPressLeft,0);
		clearInterval(timerRight);
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
		return false;
	});
	function longPressLeft(){
		timeOutEventLeft = 0;
		//执行长按事件的行为
		clearInterval(timerLeft);
		timerLeft = setInterval(function(){
			if (heroX <= 0) {
				heroX = 0;
			}else{
				heroX -=15;
			}
			// console.log(heroX);
		}, 50);
	}

	right.addEventListener('touchstart',function(e){
		clearInterval(timerLeft);
		timeOutEventRight = setTimeout(longPressRight,0);
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
		return false;
	});
	function longPressRight(){
		//执行长按事件的行为
		timeOutEventRight = 0;
		clearInterval(timerRight);
		timerRight = setInterval(function(){
			if (heroX >= 437) { //640-人物宽
				heroX = 437;
			}else{
				heroX +=15;
			}
			// console.log(heroX);
		}, 50);
	}


	// 清空
	function clear(a) {
		if (a && a === 'all'){} figure = '';
		background = '';
		props = [];
	};
	//倒计时
	var countDown = function () {
		var timeMain = document.querySelector('#time');
		time.countdown--;
		if (time.countdown >= 0) {
			timeMain.innerHTML = time.countdown;
		} else {
			clearInterval(timer);
			isOver();
		};
	};

	var isOver = function () {
		document.body.style.height = window.innerHeight + 'px';

		var allTotal = document.querySelectorAll('.total');
		clear('all');
		cancelAnimationFrame && cancelAnimationFrame(attack.timer);
		gameover.classList.add('visible');
		allTotal.forEach(function (span, i) {
			span.innerHTML = ishit.SCORE;
		})
	};

	function restart() {
		if (gameover.classList.contains('visible')) {
			gameover.classList.remove('visible');
			score.innerHTML = ishit.SCORE;
		}
		gameover.classList.contains('gameover-status1') && gameover.classList.remove('gameover-status1');
		gameover.classList.contains('gameover-status2') && gameover.classList.remove('gameover-status2');
		subScore.disabled = false;
		init();
	}

	//重玩游戏
	replay.addEventListener('tap', restart);

	// 测试使用
	//document.getElementById('stop').addEventListener('tap',isOver);

	var activeType = 6206348; //专题id
	//获取排行
	function fillRank(data) {
		var html = '';
		if (data && Array.isArray(data)) {
			data.forEach(function (item, index) {
				var timeArr = item.ctime.match(/(\d{4})-(\d{1,2})-(\d{1,2})/),
					timeStr = timeArr[2] + '-' + timeArr[3];
				html += '<tr><td width="20%">' + (index + 1) + '</td><td width="32%">' + item.tel + '</td><td width="21%">' + timeStr + '</td><td width="27%">' + item.ext1 + '</td></tr>'
			});
			return html;
		}
	};

	function getRankData() {
		$.ajax({
			type: 'get',
			url: 'http://m.zol.com.cn/topic/services/user.php?action=getUserListForMaxScore&type=' + activeType + '&limit=10',
			dataType: 'jsonp',
			success: function (res) {
				if (res.result) {
					document.querySelector('.rank-list table').innerHTML = fillRank(res.result);
					if (res.result.length == 0) {
						document.querySelector('.rank-list table').innerHTML = '排行暂无数据，赶快参加吧~';
					}
				} else {
					document.querySelector('.rank-list table').innerHTML = '排行暂无数据，赶快参加吧~';
				}
			}
		});
	};

	//提交成绩
	var subScore = document.querySelector('.sub-btn'),
		mobile = document.querySelector('.inp-box .tel'),
		tips1 = document.querySelector('.info-box .tips');
	mobile.addEventListener('focus', function () {
		tips1.style.display = 'none';
	})
	subScore.addEventListener('tap', function () {
		if (subScore.disabled) return;
		window.mobileValue = mobile.value;
		localStorage.userPhone = mobile.value;
		if (!window.mobileValue || !(/^1(([38]\d)|(4[57])|(5[012356789])|(7[0678]))\d{8}$/.test(window.mobileValue))) {
			tips1.style.display = 'block';
			return;
		}
		subScore.disabled = true;
		$.ajax({
			type: 'get',
			url: 'http://m.zol.com.cn/topic/services/session.php?callback=?',
			dataType: 'json',
			success: function (res) {
				if (res) {
					var token = res.result;
					$.ajax({
						type: 'get',
						url: 'http://m.zol.com.cn/topic/services/user.php?callback=?',
						data: {
							token: token,
							action: 'addUser',
							username: 'lenovo',
							type: activeType,
							tel: window.mobileValue,
							ext1: ishit.SCORE
						},
						dataType: 'jsonp',
						success: function (data) {
							document.body.style.height = '';
							if (data.result == 1) { //提交成功
								successFn(window.mobileValue);
							} else {
								alert(data.result);
								subScore.disabled = false;
							}
						}
					});
				}
			},
			error: function () {
				subScore.disabled = false;
			}
		});

	});
	//查询排名
	function successFn(phone) {
		$.ajax({
			type: 'get',
			url: 'http://m.zol.com.cn/topic/services/user.php?',
			data: {
				action: 'findUserTop',
				type: activeType,
				tel: phone
			},
			dataType: 'jsonp',
			success: function (result) {
				if (result) {
					var result = result.result;
					var bestScore = result.ext1,
						ranking = result.top;
					if (window.rank || searchFlag) {
						resultRank.style.display = 'block';
						searchBox.style.display = 'none';
						document.querySelector('.rank-section .tel').innerHTML = phone;
						document.querySelector('.rank-section .best').innerHTML = bestScore;
						document.querySelector('.rank-section .ranking').innerHTML = ranking;
					} else {
						if (result.over >= 30) {
							gameover.classList.add('gameover-status1');
							gameover.querySelector('.status1 .best').innerHTML = bestScore;
							gameover.querySelector('.status1 .ranking').innerHTML = ranking;

						} else {
							gameover.classList.add('gameover-status2');
							gameover.querySelector('.percent').innerHTML = result.over + '%';

						}
					}

				}
			}
		});

	}
	//查看排行榜
	var searchBox = document.querySelector('.hd-box .search-box'),
		resultRank = document.querySelector('.hd-box .result-rank'),
		searchFlag;
	document.querySelectorAll('.rank-btn').addEventListener('click', function () {
		getRankData();

		document.querySelector('.rank-section').classList.add('visible');
		var tel = window.mobileValue || localStorage.userPhone //或者本地存储
		if (tel) {
			window.rank = true;
			successFn(tel);
		} else {
			resultRank.style.display = 'none';
			searchBox.style.display = 'block';
		}
	});

	//查询
	var searchPhone = document.querySelector('.input-box .phone'),
		searchBtn = document.querySelector('.search-btn'),
		tips2 = document.querySelector('.hd-box .tips');
	searchPhone.addEventListener('focus', function () {
		tips2.style.display = 'none';
	})
	searchBtn.addEventListener('tap', function () {
		var searchVal = searchPhone.value;
		if (!searchVal || !(/^1(([38]\d)|(4[57])|(5[012356789])|(7[0678]))\d{8}$/.test(searchVal))) {
			tips2.style.display = 'block';
			return;
		}
		//localStorage.userPhone = searchPhone.value;
		searchFlag = true;
		successFn(searchVal);
	});

	//关闭
	document.querySelectorAll('.close,.scroll').addEventListener('click', function () {
		var parent = this.parentNode;
		parent.classList.remove('visible');
	});
	//弹出页面
	var scroll = document.querySelector('.scroll');
	var iScrollBrand = new iScroll(scroll, {
		bounce: false,
	});
	document.querySelector('.gift').addEventListener('click', function () {
		document.querySelector('.page-section').classList.add('visible');
		iScrollBrand.refresh();
	})

})