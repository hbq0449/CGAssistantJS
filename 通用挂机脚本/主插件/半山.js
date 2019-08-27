var Async = require('async');
var supplyMode = require('./../公共模块/里堡回补');
var sellStore2 = require('./../公共模块/里堡卖石');
var teamMode = require('./../公共模块/组队模式');
var logbackEx = require('./../公共模块/登出防卡住');

var cga = global.cga;
var configTable = global.configTable;
var sellStoreArray = ['不卖石', '卖石'];

var interrupt = require('./../公共模块/interrupt');

var moveThinkInterrupt = new interrupt();
var playerThinkInterrupt = new interrupt();
var playerThinkRunning = false;

var walkMazeForward = (cb)=>{
	var map = cga.GetMapName();
	if(map == '小岛'){
		cb(false);
		return;
	}
	cga.walkRandomMaze(null, (err)=>{
		if(err)
		{
			cb( err.message == 'Unexcepted map changed.' ? true : false);
			return;
		}
		walkMazeForward(cb);
	}, {
		layerNameFilter : (layerIndex)=>{
			return '通往山顶的路'+(layerIndex + 100)+'M';
		},
		entryTileFilter : (e)=>{
			return e.colraw == 0x36AC;
		}
	});
}

var moveThink = (arg)=>{

	if(moveThinkInterrupt.hasInterrupt())
		return false;

	if(arg == 'freqMoveMapChanged')
	{
		playerThinkInterrupt.requestInterrupt();
		return false;
	}

	return true;
}

var playerThink = ()=>{

	if(!cga.isInNormalState())
		return true;
	
	var playerinfo = cga.GetPlayerInfo();
	var ctx = {
		playerinfo : playerinfo,
		petinfo : playerinfo.petid >= 0 ? cga.GetPetInfo(playerinfo.petid) : null,
		teamplayers : cga.getTeamPlayers(),
		result : null,
		dangerlevel : thisobj.getDangerLevel(),
	}

	teamMode.think(ctx);

	global.callSubPlugins('think', ctx);

	if(cga.isTeamLeaderEx())
	{
		var interruptFromMoveThink = false;
		
		if(ctx.result == null && playerThinkInterrupt.hasInterrupt())
		{
			ctx.result = 'supply';
			interruptFromMoveThink = true;
		}

		if(ctx.result == 'supply' && supplyMode.isLogBack())
			ctx.result = 'logback';
		
		if( ctx.result == 'supply' )
		{
			if(interruptFromMoveThink)
			{
				walkMazeBack(loop);
				return false;
			}
			else
			{
				moveThinkInterrupt.requestInterrupt(()=>{
					if(cga.isInNormalState()){
						walkMazeBack(loop);
						return true;
					}
					return false;
				});
				return false;
			}
		}
		else if( ctx.result == 'logback' )
		{
			if(interruptFromMoveThink)
			{
				logbackEx.func(loop);
				return false;
			}
			else
			{
				moveThinkInterrupt.requestInterrupt(()=>{
					if(cga.isInNormalState()){
						logbackEx.func(loop);
						return true;
					}
					return false;
				});
				return false;
			}
		}
	}

	return true;
}

var playerThinkTimer = ()=>{
	if(playerThinkRunning){
		if(!playerThink()){
			console.log('playerThink off');
			playerThinkRunning = false;
		}
	}
	
	setTimeout(playerThinkTimer, 1500);
}

var loop = ()=>{
		
	var map = cga.GetMapName();
	var mapindex = cga.GetMapIndex().index3;
	var isleader = cga.isTeamLeaderEx();
	
	if(isleader && teamMode.is_enough_teammates()){
		if(map == '半山腰'){
			console.log('playerThink on');
			playerThinkRunning = true;
			cga.walkList([
				[64, 63],
			], ()=>{
				cga.freqMove(0);
			});
			return;
		}
		if(map == '小岛'){
			console.log('playerThink on');
			playerThinkRunning = true;			
			cga.walkList([
				[64, 45, '通往山顶的路100M'],
			], loop);
			return;
		}
		if(map == '通往山顶的路100M')
		{
			console.log('playerThink on');
			playerThinkRunning = true;
			walkMazeForward(loop);
			return;
		}
	} else if(!isleader){
		console.log('playerThink on');
		playerThinkRunning = true;
		return;
	}
	
	if(thisobj.sellStore == 1 && cga.getSellStoneItem().length > 0)
	{
		sellStore2.func(loop);
		return;
	}
	
	if(cga.needSupplyInitial())
	{
		if(supplyMode.isInitialSupply())
		{
			supplyMode.func(loop);
			return;
		}
		else
		{
			cga.travel.falan.toCastleHospital(()=>{
				setTimeout(loop, 3000);
			});
			return;
		}
	}

	callSubPluginsAsync('prepare', ()=>{
		cga.travel.falan.toStone('W1', ()=>{
			cga.walkList([
			[22, 88, '芙蕾雅'],
			[397, 168],
			], ()=>{
				cga.TurnTo(399, 168);
				cga.AsyncWaitNPCDialog(()=>{
					cga.ClickNPCDialog(4, 0);
					cga.AsyncWaitMovement({map:['小岛'], delay:1000, timeout:10000}, ()=>{
						cga.walkList([
						cga.isTeamLeader ? [66, 98] : [65, 98],
						], ()=>{
							teamMode.wait_for_teammates(loop);
						});
					});
				})
			});
		});
	});
}

var thisobj = {
	getDangerLevel : ()=>{
		var map = cga.GetMapName();
		
		if(map == '小岛' )
			return 1;
		
		if(map.indexOf('黑龙沼泽') >= 0)
			return 2;
		
		if(map == '半山腰' )
			return 2;
		
		return 0;
	},
	translate : (pair)=>{
		
		if(pair.field == 'sellStore'){
			pair.field = '是否卖石';
			pair.value = pair.value == 1 ? '卖石' : '不卖石';
			pair.translated = true;
			return true;
		}
		
		if(supplyMode.translate(pair))
			return true;

		if(teamMode.translate(pair))
			return true;
		
		return false;
	},
	loadconfig : (obj)=>{

		if(!supplyMode.loadconfig(obj))
			return false;
		
		if(!teamMode.loadconfig(obj))
			return false;
		
		configTable.sellStore = obj.sellStore;
		thisobj.sellStore = obj.sellStore
		
		if(thisobj.sellStore == undefined){
			console.error('读取配置：是否卖石失败！');
			return false;
		}
		
		return true;
	},
	inputcb : (cb)=>{
		Async.series([supplyMode.inputcb, teamMode.inputcb, (cb2)=>{
			var sayString = '【半山插件】请选择是否卖石: 0不卖石 1卖石';
			cga.sayLongWords(sayString, 0, 3, 1);
			cga.waitForChatInput((msg, val)=>{
				if(val !== null && val >= 0 && val <= 1){
					configTable.sellStore = val;
					thisobj.sellStore = val;
					
					var sayString2 = '当前已选择:'+sellStoreArray[thisobj.sellStore]+'。';
					cga.sayLongWords(sayString2, 0, 3, 1);
					
					cb2(null);
					
					return false;
				}
				
				return true;
			});
		}], cb);
	},
	execute : ()=>{
		playerThinkTimer();
		cga.registerMoveThink(moveThink);
		callSubPlugins('init');
		logbackEx.init();
		loop();
	},
};

module.exports = thisobj;