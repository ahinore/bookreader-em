
/**
 * URLからハッシュ値を切り出す。
 * URLパラメータと同じような感じ。
 */
function getParams(){
  var params = []
  var param; 
  var pindex = window.location.href.indexOf('#') + 1;
  var pstrs = window.location.href.slice(pindex).split('&'); 

  for(var i = 0; i < pstrs.length; i++) { 
      param = pstrs[i].split('='); 
      params.push(param[0]); 
      params[param[0]] = param[1]; 
  } 
  return params; 
}

function makeParam(book, last, page){
  return '#book='+book+'&last='+last+'&page='+page;
}

/**
 * コンテンツ領域にBook Listを表示する。
 */
function showBookList(){
  window.location = makeParam("","","");

  $('#contents').html('<ul></ul>');

  list = $.parseJSON($("#booklist").text());
  $.each(list, function(){
     $('ul').append('<li><a href="'+makeParam(this.dir, this.last, "")+'"</a>'+this.name+'</li>');
  });

  $('a').click(function(){
    window.location = $(this).attr("href");
    window.location.reload();
  });
}

/**
 * コンテンツ領域にPage Listを表示する。
 */
function showPageList(book, last, current){
  /* URLのハッシュ値に表示中のBookを保存 */
  window.location = makeParam(book,last,"");

  $('#contents').html('<ul></ul>');
  $('ul').append('<li><a href="#">booklist</a>');

  for(var i=0; i<=last; i++){
    disp = i;
    /* 画像からPage Listに遷移した場合は読んでたページに*を付与 */
    if(current == i){
      disp += " *";
    }
    $('ul').append('<li><a href="'+makeParam(book, last, i)+'">'+disp+'</a></li>');
  }

  $('a').click(function(){
    var href = $(this).attr("href");
    /* Book Listに戻る場合は保存したBookとPageを削除 */
    if(href == "#"){
      //window.localStorage.removeItem("book");
      //window.localStorage.removeItem("page");
      $.removeCookie("book");
      $.removeCookie("page");
    }
    window.location = href;
    window.location.reload();
  });
}

/**
 * コンテンツ領域に画像を表示する。
 */
function showPage(book, last, page){
  /* 表示した本とページを保存　※ただしeMローカルファイルだとうまく動作せず */
  //window.localStorage.setItem("book", book);
  //window.localStorage.setItem("page", page);
  $.cookie('book', book, { expires: 30 });
  $.cookie('page', page, { expires: 30 });

  /* ヘッダー領域の範囲 */
  var header = Math.floor($(window).height() / 10);

  /* 真ん中辺りのX座標 */
  var center = Math.floor($(window).width() / 2);

  /* URLのハッシュ値に表示中のBookとPageを保存 */
  window.location = makeParam(book,last,page);

  /* 画像ファイル名は「[0-9]{4}.jpg」の形式を想定 */
  var file_name = ("0000"+page).slice(-4) + ".jpg";

  /* コンテンツ領域に画像を表示 */
  $('#contents').html('<img src="data/'+book+"/"+file_name+'" width="100%" alt="">');

  /* 画像がクリックされた時の処理 */
  $("img").click(function(e) {
    
    /* クリックした位置がヘッダー領域の場合はページリストを表示 */
    if( e.clientY < header){
      showPageList(book, last, page);
      return;
    }

    /* クリックした位置が真ん中より右の場合は進める */
    if( center < e.clientX){
      page = last<=page ? last : page + 1;

    /* クリックした位置が真ん中より右の場合は戻る */
    }else{
      page = page<=0 ? 0 : page - 1;
    }

    showPage(book, last, page);
  });
}

/**
 * 初期処理
 */
$(function() {

  var params = getParams();
  var last = params["last"];

  /* 表示対象BookのIDを取得*/
  var book = params["book"];
  if(!book){
    /* 前回表示した値が残っていれば取得 */
    //book = window.localStorage.getItem("book");
    book = $.cookie('book');
  }
  /* Bookまたはlastが指定されていない場合はBook Listを表示 */
  if(!book || !last){
    showBookList();
    return;
  }

  /* 表示対象ページのIDを取得*/
  var page = params["page"];
  if(!page){
    /* 前回表示した値が残っていれば取得 */
    //page = window.localStorage.getItem("page");
    page = $.cookie('page');
  }
  /* ページが指定されていない場合はPage Listを表示 */
  if(!page){
    showPageList(book, last, -1);
    return;
  }

  /* BookとPageが指定されている場合はその画像を表示 */
  showPage(book, last, parseInt(page));
});
