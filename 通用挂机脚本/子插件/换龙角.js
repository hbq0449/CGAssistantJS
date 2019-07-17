var cga = global.cga;
var configTable = global.configTable;

var openbox = ()=>{
	var box = cga.findItem('加强补给品');
	if(box != -1){
		cga.AsyncWaitNPCDialog(function(dlg){
			cga.ClickNPCDialog(4, 0);
			setTimeout(openbox, 1500);
		});
		cga.UseItem(box);
	}
}

var waitArray = [
{
	mapname:'肯吉罗岛',
	pos:[475, 208],
	cb : ()=>{
		if(cga.getItemCount('龙角') >= 30){
			cga.TurnTo(475, 208);
			cga.AsyncWaitNPCDialog(function(dlg){
				if(typeof dlg.message == 'string' && 
				dlg.message.indexOf('非常好') >= 0){
					cga.ClickNPCDialog(32, 0);
					cga.AsyncWaitNPCDialog(function(dlg){
						cga.ClickNPCDialog(1, 0);
					});
				}
				else if(typeof dlg.message == 'string' && 
				dlg.message.indexOf('滚开') >= 0){
					openbox();
				}
				else if(typeof dlg.message == 'string' && 
				dlg.message.indexOf('新的增援') >= 0){
					cga.ClickNPCDialog(32, 0);
					cga.AsyncWaitNPCDialog(function(dlg){
						cga.ClickNPCDialog(32, 0);
						cga.AsyncWaitNPCDialog(function(dlg){
							cga.ClickNPCDialog(32, 0);
							cga.AsyncWaitNPCDialog(function(dlg){
								cga.ClickNPCDialog(1, 0);
								
							});
						});
					});
				}
				else if(typeof dlg.message == 'string' && 
				dlg.message.indexOf('哦？不错') >= 0){
					cga.ClickNPCDialog(32, 0);
					cga.AsyncWaitNPCDialog(function(dlg){
						cga.ClickNPCDialog(1, 0);
					});
				}
			});
		}
		else if(cga.getItemCount('加强补给品') > 0);
		{
			openbox();
		}

		setTimeout(cga.waitForMultipleLocation, 5000, waitArray);
	}
}
];

module.exports = {
	init : ()=>{
		cga.waitForMultipleLocation(waitArray);
	},
	battle : (ctx)=>{
	
	},
	loadconfig : (obj, cb)=>{
		return true;
	},
	inputcb : (cb)=>{
		cb(null);
	}
};