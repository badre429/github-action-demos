
#  Expand-Archive -LiteralPath .\context-setup-win64.zip

#  .\context-setup-win64\context\bin\luatex.exe -synctex=1 -interaction=nonstopmode --shell-escape .\index.tex
#  & .\context-setup-win64\context\first-setup.bat

Get-ChildItem
luatex.exe  --synctex=1 --interaction=batchmode  --shell-escape --enable-installer  .\spiral.tex
Get-ChildItem
exit 0