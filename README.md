# pile-designer
[桩基设计器](nav.html) 导航页面

## pile.html 地址参数
- `src` 图片地址
- `id` 图纸Id
- `types` 桩基类型: 桩基Id,桩基类名,桩基绘制上限;桩基Id-2,桩基类名-2,桩基绘制上限-2;...
- `hl` 加载后高亮并定位到指定桩号
- `highlight` 同 `hl`
- `readonly=1` 只读模式 (readonly = 1 与 mode=1 作用一致)
- `mode` 0. 设计模式，1. 只读模式
- `pos` 定位到指定桩号

## 操作快捷键
- `空格 + 拖拽画板` 移动画板位置
- `Ctrl + 点击拖拽桩` 复制当前桩
- `↑ ↓ ← →` 微调桩位置
- `Shift + ↑ ↓ ← →` 微调桩尺寸
- `Delete` 删除指定桩
- `ESC` 关闭[查找定位桩]对话框
- `Return` 回车确定输入桩号