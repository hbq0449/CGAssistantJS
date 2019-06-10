var cga = require('./cgaapi')(function(){
	console.log('贝爷 起始地点：艾尔莎岛')
	
	var loop_count = 0;
	
	var teammates = [ 'hzqst', '你萌死了', '小苹花', '傲世蒼穹√' , '[NAI]地狱宠儿']//队长名字和队员名字
	
	var playerinfo = cga.GetPlayerInfo();
	
	cga.isTeamLeader = (teammates[0] == playerinfo.name) ? true : false
	
	var task = cga.task.Task('贝爷', [
	{//0
		intro: '1.前往法兰城里谢里雅堡与贝尔（53.22）对话，获得【证明信】。',
		workFunc: function(cb2){
			cga.travel.falan.toStone('C', ()=>{
				cga.walkList([
				[53, 23],
				], ()=>{
					cga.TurnTo(53, 21);
					cga.AsyncWaitNPCDialog((dlg)=>{
						cga.ClickNPCDialog(32, 0);
						cga.AsyncWaitNPCDialog((dlg)=>{
							cga.ClickNPCDialog(4, 0);
							cga.AsyncWaitNPCDialog((dlg)=>{
								cga.ClickNPCDialog(1, 0);
								setTimeout(cb2, 1500, true);
							});
						});
					});
				});
			});
		}
	},
	{//1
		intro: '2.前往莎莲娜岛西方洞窟与贝尔的助手（13.10）对话，交出【证明信】进入隐秘的山道。',
		workFunc: function(cb2){
			
			//补血
			cga.travel.falan.toCastleHospital(()=>{
				setTimeout(()=>{
					cga.travel.falan.toABNSCun(()=>{//去莎莲娜西方洞窟
						cga.walkList([
						[5, 4, '村长的家'],
						[6, 13, 4312],
						[6, 13, '阿巴尼斯村'],
						[37, 71, '莎莲娜'],
						[258, 180, '莎莲娜西方洞窟'],
						[30, 44, 14001],
						[14, 68, 14000],
						[13, 11],
						], ()=>{
							cga.TurnTo(13, 9);
							cga.AsyncWaitNPCDialog((dlg)=>{
								cga.ClickNPCDialog(32, 0);
								cga.AsyncWaitNPCDialog((dlg)=>{
									cga.ClickNPCDialog(1, 0);
									setTimeout(cb2, 1000, true);
								});
							});
						});
					});
				}, 3000);
			});
		}
	},
	{//2
		intro: '3.通过随机迷宫抵达山道尽头，调查军刀（13.6）获得【贝尔的军刀】并传送出迷宫。',
		workFunc: function(cb2){
			var findObj = (cb3)=>{
				var objs = cga.getMapObjects();
				var pos = cga.GetMapXY();
				if(objs.length){
					for(var i in objs){
						if(objs[i].mapx != pos.x || objs[i].mapy != pos.y){
							cb3(objs[0]);
							return;
						}
					}
				}
				setTimeout(findObj, 1000, cb3);
			}
			
			var walkMaze = (cb3)=>{
				var map = cga.GetMapName();
				if(map == '隐秘山道中层' || map == '隐秘山道下层' || map == '山道尽头'){
					cb3();
					return;
				}
				var target = null;
				if(map == '隐秘山道上层B7')
					target = '隐秘山道中层';
				else if(map == '隐秘山道中层B7')
					target = '隐秘山道下层';
				else if(map == '隐秘山道下层B7')
					target = '山道尽头';
				cga.walkRandomMaze(target, (err)=>{
					if(err == 4){
						//非预期的地图切换,重启脚本
						cb2('restart task');
						return;
					}
					
					walkMaze(cb3);
				});
			}
			
			findObj((obj)=>{
				cga.walkList([
					[obj.mapx, obj.mapy, '隐秘山道上层B1']
				], ()=>{
					walkMaze(()=>{
						findObj((obj)=>{
							cga.walkList([
								[obj.mapx, obj.mapy, '隐秘山道中层B1']
							], ()=>{
								walkMaze(()=>{
									findObj((obj)=>{
										cga.walkList([
											[obj.mapx, obj.mapy, '隐秘山道下层B1']
										], ()=>{
											walkMaze(()=>{
												cga.walkList([
												[13, 6]
												], ()=>{
													cga.TurnTo(13, 4);
													cga.AsyncWaitNPCDialog((dlg)=>{
														cga.ClickNPCDialog(4, 0);
														setTimeout(cb2, 1000, true);
													});
												});
											});
										});
									});
								});
							});
						});
					});
				});
			});
		}
	},
	{//3
		intro: '4.返回法兰城里谢里雅堡与贝尔（53.22）对话，交出【贝尔的军刀】并传送至贝尔的隐居地。',
		workFunc: function(cb2){
			//补血
			cga.travel.falan.toCastleHospital(()=>{
				setTimeout(()=>{
					cga.travel.falan.toStone('C', ()=>{
						cga.walkList([
						[53, 23],
						], ()=>{
							cga.TurnTo(53, 21);
							cga.AsyncWaitNPCDialog((dlg)=>{
								cga.ClickNPCDialog(32, 0);
								cga.AsyncWaitNPCDialog((dlg)=>{
									cga.ClickNPCDialog(1, 0);
									setTimeout(cb2, 1500, true);
								});
							});
						});
					});
				}, 3000);
			});
		}
	},
	{//4
		intro: '5.与饥饿的贝尔对话，进入战斗。',
		workFunc: function(cb2){
			
			var waitBOSS = ()=>{
				if(cga.isInBattle())
				{
					setTimeout(waitBOSS, 1000);
					return;
				}
				
				setTimeout(cb2, 1000, true);
			}
			
			var fuckBeiYe = ()=>{
				if(cga.isTeamLeader){
					cga.walkList([
						[20, 18],
					], ()=>{
						cga.TurnTo(20, 16);
						cga.AsyncWaitNPCDialog((dlg)=>{
							cga.ClickNPCDialog(1, 0);
							setTimeout(waitBOSS, 1500);
						});
					});
				} else {
					if(cga.isInBattle())
					{
						setTimeout(waitBOSS, 1000);
						return;
					}
					setTimeout(fuckBeiYe, 1500);
				}
			}
			
			var wait = ()=>{

				if(cga.isTeamLeader){
					cga.WalkTo(23, 23);
					cga.waitTeammates(teammates, (r)=>{
						if(r){
							fuckBeiYe();
							return;
						}
						setTimeout(wait, 1000);
					});
				} else {
					cga.addTeammate(teammates[0], (r)=>{
						if(r){
							fuckBeiYe();
							return;
						}
						setTimeout(wait, 1000);
					});
				}
			}
			
			wait();
		}
	},
	{//5
		intro: '6.战斗胜利后与饥饿的贝尔对话，获得【签名】并传送出贝尔的隐居地。',
		workFunc: function(cb2){
			cga.TurnTo(20, 16);
			cga.AsyncWaitNPCDialog((dlg)=>{
				cga.ClickNPCDialog(32, 0);
				cga.AsyncWaitNPCDialog((dlg)=>{
					cga.ClickNPCDialog(32, 0);
					cga.AsyncWaitNPCDialog((dlg)=>{
						cga.ClickNPCDialog(1, 0);
						setTimeout(cb2, 1000, true);
					});
				});
			});
		}
	},
	],
	[//任务阶段是否完成
		function(){//证明信
			return (cga.getItemCount('#491723') >= 1) ? true : false;
		},
		function(){
			return cga.GetMapName() == '隐秘山道上层';
		},
		function(){
			return (cga.getItemCount('贝尔的军刀') >= 1) ? true : false;
		},
		function(){
			return cga.GetMapName() == '贝尔的隐居地' && cga.GetMapIndex().index3 == 57199;
		},
		function(){
			return cga.GetMapName() == '贝尔的隐居地' && cga.GetMapIndex().index3 == 57200;
		},
		function(){
			return false;
		},
	]
	);
	
	var loop = ()=>{
		loop_count ++;
		cga.SayWords('已刷' + loop_count + '遍贝爷！', 0, 3, 1);
		task.doTask(loop);
	}

	task.doTask(loop);
});