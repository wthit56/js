var DATA = {src:'data.json'}, trigger, menuList, resObj, jsonloader, appData = {};

if(window.addEventListener)
{
	window.addEventListener('onload', loadJSONMenuData());
}
else if(window.attachEvent)
{
	window.attachEvent('onload', loadJSONMenuData());
}

function loadJSONMenuData()
{
	if(window.XMLHttpRequest)
	{
		jsonloader = new XMLHttpRequest();
	}
	else
	{
		jsonloader = new ActiveXObject('Microsoft.HTTP');
	}

	jsonloader.open('GET', DATA.src, true);

	jsonloader.onreadystatechange = function()
	{
		if(this.readyState == 4 && this.status == 200)
		{
			resObj = JSON.parse(jsonloader.responseText);
			parseJSONMenuData(resObj);
		}
	}

	jsonloader.send(null);
}

function parseJSONMenuData(data)
{
	//Populate the menu items and names.
	var ml = data.menulist, wrap = document.getElementById('wrap'), navList = document.createElement('ul');

	navList.setAttribute('id', 'navList');

	var mouseOver = function(e)
	{

		if(menuList != null)
		{
			document.body.removeChild(menuList);
		}
			trigger = 1;
			//Get event target's offset
			var x = e.target.offsetLeft, y = e.target.offsetTop;

			//Build the popup & set a class
			menuList = document.createElement('ul');

			menuList.classList.add('menuList');

			menuList.style.left = '' + (x-5) +'px';
			menuList.style.top = '' + (y+45) + 'px';

			document.body.appendChild(menuList);

			var data = ml[e.target.id];

			for(var each in data.content)
			{
				content = data.content[each];
				menuItem = document.createElement('li');
				menuItem.classList.add('menuItem');
				menuList.appendChild(menuItem);
				contentLink = document.createElement('a');
				contentLink.classList.add('contentLink');
				contentLink.setAttribute('href', '#');
				menuItem.appendChild(contentLink);
				contentLink.innerHTML = data.content[each];
			}	
	};

	var killTimerID = null;
	var mouseOut = function (e) {
		if (killTimerID !== null) {
			clearTimeout(killTimerID);
		}
		
		killTimerID = setTimeout(killMenuList, 10);
	};

	function killMenuList() {
		document.body.removeChild(menuList);
		menuList = null;
		killTimerID = null;
	}

	for(var i = 0, l = ml.length; i < l; i++)
	{
		itemName = ml[i].name, mi = i;

		if(itemName)
		{
			var navItem = document.createElement('li'), a = document.createElement('a');

			navItem.classList.add('navItem');

			a.setAttribute('href', '#'); a.setAttribute('id', ''+mi+''); a.classList.add('menutitle'); a.innerHTML = itemName;

			wrap.appendChild(navList); navList.appendChild(navItem); navItem.appendChild(a);

		}

		//MOUSEOVER & MOUSEOUT
		a.addEventListener('mouseover', mouseOver);
		//a.addEventListener('mouseout', mouseOut);
	}
}