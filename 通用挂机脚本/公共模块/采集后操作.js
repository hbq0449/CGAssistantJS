var cga = global.cga;
var configTable = global.configTable;

var doneArray = [
{
	name: '换条存银行',
	func: (cb, mineObject)=>{
		cga.travel.falan.toMineStore(mineObject.name, ()=>{
			cga.AsyncWaitNPCDialog(()=>{
				cga.ClickNPCDialog(0, 0);
				cga.AsyncWaitNPCDialog(()=>{
					var exchangeCount = cga.getItemCount(mineObject.name) / 20;
					cga.BuyNPCStore([{index:0, count:exchangeCount}]);
					cga.AsyncWaitNPCDialog(()=>{
						cga.travel.falan.toBank(()=>{
							cga.AsyncWaitNPCDialog(()=>{
								cga.saveToBankAll(mineObject.name+'条', 20, (err)=>{
									cb(null);
								});
							});
						});
					});
				});
			});
		});
	}
},
{
	name: '直接存银行',
	func: (cb, mineObject)=>{
		cga.travel.falan.toBank(()=>{
			cga.AsyncWaitNPCDialog(()=>{
				cga.saveToBankAll(mineObject.name, 20, (err)=>{
					cb(null);
				});
			});
		});
	}
},
{
	name: '飞碟卖店',
	func: (cb, mineObject)=>{
		cga.travel.falan.toStone('C', ()=>{
			cga.walkList([
			[30, 79],
			], ()=>{
				cga.TurnTo(30, 77);
				cga.AsyncWaitNPCDialog(()=>{	
					cga.ClickNPCDialog(0, 0);
					cga.AsyncWaitNPCDialog(()=>{

						var sell = cga.findItemArray(mineObject.name);
						var sellArray = sell.map((item)=>{
							item.count /= 20;
							return item;
						});

						var pattern = /(.+)的卡片/;
						cga.getInventoryItems().forEach((item)=>{
							if(item.name == '魔石' || item.name == '卡片？' || pattern.exec(item.name) ){
								sellArray.push({
									itempos : item.pos,
									itemid : item.itemid,
									count : (item.count < 1) ? 1 : item.count,
								});
							} else if(mineObject && mineObject.extra_selling && mineObject.extra_selling(item)){
								sellArray.push({
									itempos : item.pos,
									itemid : item.itemid,
									count : item.count / 20,
								});
							}
						})

						cga.SellNPCStore(sellArray);
						cga.AsyncWaitNPCDialog(()=>{
							cga.walkList([
							[27, 82]
							], ()=>{
								cb(true);
							});
						});
					});
				});
			});
		});
	}
},
{
	name: '阿凯鲁法卖店',
	func: (cb, mineObject)=>{
		if(cga.GetMapName() != '阿凯鲁法村'){
			cga.LogBack();
			setTimeout(thisobj.object.func, 1000, mineObject);
			return;
		}
		cga.walkList([
			[158, 139, '拉那杂货店'],
			[12, 11],
		], ()=>{
			cga.TurnTo(12, 9);
			cga.AsyncWaitNPCDialog(()=>{	
				cga.ClickNPCDialog(0, 0);
				cga.AsyncWaitNPCDialog(()=>{

					var sell = cga.findItemArray(mineObject.name);
					var sellArray = sell.map((item)=>{
						item.count /= 20;
						return item;
					});

					var pattern = /(.+)的卡片/;
					cga.getInventoryItems().forEach((item)=>{
						if(item.name == '魔石' || item.name == '卡片？' || pattern.exec(item.name) ){
							sellArray.push({
								itempos : item.pos,
								itemid : item.itemid,
								count : (item.count < 1) ? 1 : item.count,
							});
						} else if(mineObject && mineObject.extra_selling && mineObject.extra_selling(item)){
							sellArray.push({
								itempos : item.pos,
								itemid : item.itemid,
								count : item.count / 20,
							});
						}
					})

					cga.SellNPCStore(sellArray);
					cga.AsyncWaitNPCDialog(()=>{
						cga.walkList([
						[15, 24, '阿凯鲁法村']
						], ()=>{
							cb(true);
						});
					});
				});
			});
		});
	}
},
]

var thisobj = {
	func : (cb, mineObject)=>{
		if(mineObject.doneManager){
			mineObject.doneManager(cb);
			return;
		}
		
		thisobj.object.func(cb, mineObject);
	},
	translate : (pair)=>{
		if(pair.field == 'doneObject'){
			pair.field = '采集完成后操作';
			pair.value = doneArray[pair.value].name;
			pair.translated = true;
			return true;
		}

		return false;
	},
	loadconfig : (obj, cb)=>{
		for(var i in doneArray){
			if(i == obj.doneObject){
				configTable.doneObject = i;
				thisobj.object = doneArray[i];
				break;
			}
		}
		
		if(!thisobj.object){
			console.error('读取配置：采集完成后操作失败！');
			return false;
		}
		
		return true;
	},
	inputcb : (cb)=>{
		
		var stage1 = (cb2)=>{
			var sayString = '【采集插件】请选择采集完成后操作:';
			for(var i in doneArray){
				if(i != 0)
					sayString += ', ';
				sayString += '('+ (parseInt(i)+1) + ')' + doneArray[i].name;
			}
			cga.sayLongWords(sayString, 0, 3, 1);
			cga.waitForChatInput((msg, index)=>{
				if(index !== null && index >= 1 && doneArray[index - 1]){
					configTable.doneObject = index - 1;
					thisobj.object = doneArray[index - 1];
					
					var sayString2 = '当前已选择:[' + thisobj.object.name + ']。';
					cga.sayLongWords(sayString2, 0, 3, 1);
					
					cb(null);				
					return false;
				}
				
				return true;
			});
		}
		
		stage1();
	}
}

module.exports = thisobj;