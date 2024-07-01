# zy-schema

`easy.json` 是简易配置文件的 `$schema` 文件, 示例:

```jsonc
{
  "$schema": "https://raw.githubusercontent.com/Hiram-Wong/ZyPlayer/main/schema/easy.json",
  "sites": {
    "default": "fff",
    "data": [
      {
        "id": "fff",
        "name": "菲菲影视",
        "api": "https://www.example.com/api.php/provide/vod/",
        "search": 0,
        "type": 1
      }
    ]
  }
}
```