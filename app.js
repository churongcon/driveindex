document.write('<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/mdui@0.4.3/dist/css/mdui.min.css">');
//document.write('<script src="//cdn.jsdelivr.net/npm/mdui@0.4.3/dist/js/mdui.js"></script>');
document.write('<style>.mdui-appbar .mdui-toolbar{height:56px;font-size:1pc}.mdui-toolbar>*{padding:0 6px;margin:0 2px}.mdui-toolbar>i{opacity:.5}.mdui-toolbar>.mdui-typo-headline{padding:0 1pc 0 0}.mdui-toolbar>i{padding:0}.mdui-toolbar>a:hover,a.active,a.mdui-typo-headline{opacity:1}.mdui-container{max-width:980px}.mdui-list-item{transition:none}.mdui-list>.th{background-color:initial}.mdui-list-item>a{width:100%;line-height:3pc}.mdui-list-item{margin:2px 0;padding:0}.mdui-toolbar>a:last-child{opacity:1}@media screen and (max-width:980px){.mdui-list-item .mdui-text-right{display:none}.mdui-container{width:100%!important;margin:0}.mdui-toolbar>.mdui-typo-headline,.mdui-toolbar>a:last-child,.mdui-toolbar>i:first-child{display:block}}</style>');
function init(){
	document.siteName = $('title').html();
	$('body').addClass("mdui-theme-primary-blue-grey mdui-theme-accent-blue");
	var html = `
<header class="mdui-appbar mdui-color-theme"> 
   <div id="nav" class="mdui-toolbar mdui-container"> 
   </div> 
</header>
  <div class="mdui-container"> 
   <div class="mdui-row"> 
    <ul class="mdui-list"> 
     <li class="mdui-list-item th"> 
      <div class="mdui-col-xs-12 mdui-col-sm-7">
       Tên
      </div> 
      <div class="mdui-col-sm-3 mdui-text-right">
       Sửa đổi lần cuối
      </div> 
      <div class="mdui-col-sm-2 mdui-text-right">
       Kích cỡ tệp
      </div> 
      </li> 
    </ul> 
   </div> 
   <div class="mdui-row"> 
    <ul id="list" class="mdui-list"> 
    </ul> 
   </div> 
  </div>
`;
	$('body').html(html);
}

function render(path){
	title(path);
	nav(path);
	list(path);
}

function title(path){
	path = decodeURI(path);
	$('title').html(document.siteName+' - '+path);
}

function nav(path){
	var html = `<div id="nav" class="mdui-toolbar mdui-container">`;
	html += `<a href="/" class="mdui-typo-headline folder">${document.siteName}</a>`;
	var arr = path.trim('/').split('/');
	var p = '/';
	if(arr.length > 0){
		for(i in arr){
		  var n = arr[i];
    	  n = decodeURI(n);
    	  p += n+'/';
    	  if(n == ''){
    	    break;
    	  }
    	  html += `<i class="mdui-icon material-icons mdui-icon-dark folder" style="margin:0;">chevron_right</i><a href="${p}">${n}</a>`;
    	}
	}
	html += `</div>`;
   	$('#nav').html(html);
}

function list(path){
	var password = localStorage.getItem('password'+path);
	$('#list').html(`<div class="mdui-progress"><div class="mdui-progress-indeterminate"></div></div>`);
	$.post(path,'{"password":"'+password+'"}', function(data,status){
		var obj = jQuery.parseJSON(data);
		if(typeof obj != 'null' && obj.hasOwnProperty('error') && obj.error.code == '401'){
			var pass = prompt("Vui lòng nhập pass trong group lớp","");
			localStorage.setItem('password'+path, pass);
			if(pass != null && pass != ""){
				list(path);
			}else{
				alert("Sai mật khẩu, vào group lớp xem pass lại!");
			}
		}else if(typeof obj != 'null'){
			list_files(path,obj.files);
		}
	});
}

function list_files(path,files){
	html = "";
	for(i in files){
		var item = files[i];
		var p = path+item.name+'/';
	    if(item['size']==undefined){
	      item['size'] = "";
	    }

	    item['modifiedTime'] = utc2beijing(item['modifiedTime']);
	    item['size'] = formatFileSize(item['size']);
	    if(item['mimeType'] == 'application/vnd.google-apps.folder'){
	      html +=`<li class="mdui-list-item mdui-ripple"><a href="${p}" class="folder">
	            <div class="mdui-col-xs-12 mdui-col-sm-7 mdui-text-truncate">
	            <i class="mdui-icon material-icons">folder_open</i>
	              ${item.name}
	            </div>
	            <div class="mdui-col-sm-3 mdui-text-right">${item['modifiedTime']}</div>
	            <div class="mdui-col-sm-2 mdui-text-right">${item['size']}</div>
	            </a>
	        </li>`;
	    }else{
	      var p = path+item.name;
	      html += `<li class="mdui-list-item file mdui-ripple" target="_blank"><a href="${p}">
	          <div class="mdui-col-xs-12 mdui-col-sm-7 mdui-text-truncate">
	          <i class="mdui-icon material-icons">insert_drive_file</i>
	            ${item.name}
	          </div>
	          <div class="mdui-col-sm-3 mdui-text-right">${item['modifiedTime']}</div>
	          <div class="mdui-col-sm-2 mdui-text-right">${item['size']}</div>
	          </a>
	      </li>`;
	    }
	}
	$('#list').html(html);
}


function utc2beijing(utc_datetime) {
    var T_pos = utc_datetime.indexOf('T');
    var Z_pos = utc_datetime.indexOf('Z');
    var year_month_day = utc_datetime.substr(0,T_pos);
    var hour_minute_second = utc_datetime.substr(T_pos+1,Z_pos-T_pos-1);
    var new_datetime = year_month_day+" "+hour_minute_second; // 2017-03-31 08:02:06

    timestamp = new Date(Date.parse(new_datetime));
    timestamp = timestamp.getTime();
    timestamp = timestamp/1000;

    var unixtimestamp = timestamp+8*60*60;

    var unixtimestamp = new Date(unixtimestamp*1000);
        var year = 1900 + unixtimestamp.getYear();
        var month = "0" + (unixtimestamp.getMonth() + 1);
        var date = "0" + unixtimestamp.getDate();
        var hour = "0" + unixtimestamp.getHours();
        var minute = "0" + unixtimestamp.getMinutes();
        var second = "0" + unixtimestamp.getSeconds();
        return year + "-" + month.substring(month.length-2, month.length)  + "-" + date.substring(date.length-2, date.length)
            + " " + hour.substring(hour.length-2, hour.length) + ":"
            + minute.substring(minute.length-2, minute.length) + ":"
            + second.substring(second.length-2, second.length);
} 

function formatFileSize(bytes) {
	if (bytes>=1000000000) {bytes=(bytes/1000000000).toFixed(2)+' GB';}
        else if (bytes>=1000000)    {bytes=(bytes/1000000).toFixed(2)+' MB';}
        else if (bytes>=1000)       {bytes=(bytes/1000).toFixed(2)+' KB';}
        else if (bytes>1)           {bytes=bytes+' bytes';}
        else if (bytes==1)          {bytes=bytes+' byte';}
        else                        {bytes='';}
        return bytes;
}

String.prototype.trim = function (char) {
    if (char) {
        return this.replace(new RegExp('^\\'+char+'+|\\'+char+'+$', 'g'), '');
    }
    return this.replace(/^\s+|\s+$/g, '');
};

$(function(){
	init();
	var path = window.location.pathname;
	$("body").on("click",'.folder',function(){
	  var url = $(this).attr('href');
	  history.pushState(null, null, url);
	  render(url);
	  return false;
	});
	render(path);
});

window.onpopstate = function(){
	var path = window.location.pathname;
	render(path);
}
