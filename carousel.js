/**
 * Created by web-daddy on 2018/10/31.
 */
var Carousel = {
	data: {
	},
	init: function () {
		//初始化
		Carousel.control();
	},
	videoSkip: function (stopBtn, video, box1, box2) {
		stopBtn.addEventListener("tap", function () {
			if (video) {
				video.pause();
			}
			box1.style.display = "none";
			box1.classList.remove("active");
			box2.style.display = "block";
			box2.classList.add("active");
		});
	},
	showRule: function (ruleBox1, ruleBox2) {
		ruleBox1.style.display = "none";
		ruleBox2.style.display = "block";
		ruleBox1.classList.remove("active");
		ruleBox2.classList.add("active");
	},
	control: function () {
		// 阻止默认事件
		document.body.addEventListener(
			"touchmove",
			function (e) {
				e.preventDefault(); //阻止默认的处理方式(阻止下拉滑动的效果)
				return false;
			},
			{
				passive: false,
			}
		); //passive 参数不能省略，用来兼容ios和android

		// 音频暂停
		document.querySelector(".audio").addEventListener("tap", function () {
			var audio = document.getElementById("audio");
			if (this.classList.contains("off")) {
				audio.play();
				this.classList.remove("off");
			} else {
				audio.pause();
				this.classList.add("off");
			}
		});

		// 规则弹层操作
		document.querySelector(".gameHelp").addEventListener("tap", function () {
			Carousel.showRule(document.querySelector(".gameStartPage"), document.querySelector(".gameExplain"));
		});
		document.querySelector(".gameBack").addEventListener("tap", function () {
			Carousel.showRule(document.querySelector(".gameExplain"), document.querySelector(".gameStartPage"));
		});

		// 点击开始游戏
		document.querySelectorAll(".gamePlay").forEach(function (item) {
			item.addEventListener("tap", function () {
				Carousel.showRule(document.querySelector("#page2"), document.querySelector("#page3"));
				init();
			});
		});

		// 再玩一次
		document.querySelectorAll(".again").forEach(function (item) {
			item.addEventListener("tap", function () {
				Carousel.showRule(document.querySelector("#page4"), document.querySelector("#page3"));
        Carousel.showRule(document.querySelector("#page5"), document.querySelector("#page3"));
				init();
        
			});
		});

		// 加载动画
		function loading() {
			var l = document.querySelector(".loading");
			if (!l) return;
			l.classList.remove("loading-visible");
			setTimeout(function () {
				l.style.display = "block";
				l.classList.add("loading-visible");
			}, 0);
		}
		loading.dismiss = function () {
			var l = document.querySelector(".loading");
			if (!l) return;
			l.classList.remove("loading-visible");
			setTimeout(function () {
				l.style.display = "none";
			}, 300);
		};
		// 判断是否加载完毕
		var imgHref = [
			"./images/audio-off.png",
			"./images/audio-on.png",
			"./images/canvas-bg.jpg",
			"./images/icon-bg.jpg",
			"./images/icon-p2-0.png",
			"./images/icon-p2-1.png",
			"./images/icon-p2-2.png",
			"./images/icon-p2-3.png",
			"./images/icon-p2-4.png",
			"./images/icon-p2-5.png",
			"./images/icon-p2-6.png",
			"./images/icon-p2-bg.jpg",
			"./images/icon-p3-0.png",
			"./images/icon-p3-1.png",
			"./images/icon-p3-5.png",
			"./images/icon-p4-1.png",
			"./images/icon-p4-2.png",
			"./images/icon-p4-3.png",
			"./images/icon-p4-4.png",
			"./images/icon-p4-bg.jpg",
			"./images/icon-p5-1.png",
			"./images/icon-p5-bg.jpg",
			"./images/sprites.png",
		];
		window.addEventListener("load", function () {
			var img = [];
			var imgLoad = 0;
			for (var i = 0; i < imgHref.length; i++) {
				img[i] = new Image();
				img[i].src = imgHref[i];
				img[i].onload = function () {
					imgLoad++;
					if (imgLoad >= imgHref.length) {
						loading.dismiss();
						document.querySelector("#page2").classList.add("active");
					}
				};
			}
		});
	},
};
Carousel.init();
