# -*- encoding: utf-8 -*-

require 'rubygems'
require 'RMagick'
require 'systemu'

require 'fileutils'
require 'erb'
require 'json'
require 'escape'

books_dir = "books/data"
pdf_dir = "pdf"

book_list = Array.new

#PDFからjpgに変換
Dir.glob("pdf/*.pdf").each_with_index{|pdf_path, i|
  name = File.basename(pdf_path, ".pdf")
  pdf_imagelist =  Magick::ImageList.new(pdf_path)
  last_index = pdf_imagelist.size - 1
  
  book_dir = sprintf('%04d', i)

  output_dir = "#{books_dir}/#{book_dir}"
  tmp_dir = "#{books_dir}/tmp"

  FileUtils.mkdir_p(output_dir)
  FileUtils.mkdir_p(tmp_dir)

  #中間ファイルが大きすぎるので10ページ毎に処理
  w = 10
  0.step(last_index, w){|start|
    last = start + w -1
    last = last_index if last > last_index

    input_path = "#{pdf_path}[#{start}-#{last}]"
    tmp_path = "#{tmp_dir}/%04d.jpg"
    
    #RMagicだと解像度の指定方法が分からないのでimagemagicのコマンドでjpgに変換
    puts "convert -density 600 -geometry 1000 #{input_path} #{tmp_path}"
    res = systemu("convert -density 600 -geometry 1000 #{input_path} #{tmp_path}")
    if res[0].exitstatus != 0
      STDERR.puts res[2]
    else
      src_i = 0
      start.upto(last){|dst_i|
        FileUtils.mv("#{tmp_dir}/#{sprintf('%04d',src_i)+'.jpg'}", "#{output_dir}/#{sprintf('%04d',dst_i)+'.jpg'}")
        src_i = src_i + 1;
      }
    end
  }

  book_list << {"name"=>name, "dir"=>book_dir, "last"=>last_index}
}

#index.htmlを生成
open("books/index.html", "w"){|f|
 f.puts ERB.new(DATA.read).result(binding)
}

#--------------------------------------------------------------
# index.htmlの雛形
# booklistの所にerbでBook ListのJSONデータを埋め込んでるだけ
#--------------------------------------------------------------
__END__
<html>
<head>
<meta charset="utf-8">
<script src="js/jquery-1.10.2.min.js"></script>
<script src="js/jquery.cookie.js"></script>
<script src="js/bookreader.js"></script>
<style type="text/css">
#contents{
  font-size: large;
}
#booklist{
  visibility: hidden;
}
</style>
<title>BookReader</title>
</head>
<body>

<!-- コンテンツ表示部分 -->
<div id="contents"></div>

<!-- Book Listのデータ...要エスケープ? -->
<div id="booklist">
<%= book_list.to_json %>
</div>
</body>
</html>
