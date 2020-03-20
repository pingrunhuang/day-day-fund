
from collections import namedtuple
import pandas as pd

component = namedtuple('component', ['name', 'ratio'])
fund = namedtuple('fund', ['name', 'components', 'buy_price', 'shares'])
position = namedtuple('position', ['fund', 'status', 'sell_price'])


f1 = fund('鹏华可转债', [
    component('宁德时代', 1.04),
    component('格力电器', 1.00),
    component('先导智能', 1.00),
    component('华泰证券', 0.98),
    component('泸州老窖', 0.86),
    component('通威股份', 0.78),
    component('迈瑞医疗', 0.72),
    component('紫金矿业', 0.72),
    component('贵州茅台', 0.71),
    component('三一重工', 0.64)
], 1.0782, 10202.5)


f2 = fund('嘉实逆向策略', [
    component('神州数码',8.69),
    component('通威股份',8.61),
    component('阳光电源',8.25),
    component('雄帝科技',7.39),
    component('中孚信息',6.39),
    component('纳思达',6.02),
    component('同有科技',5.98),
    component('华测检测',5.86),
    component('隆基股份',5.71),
    component('华体科技',5.71)
], 1.809, 544.62)


f3 = fund('华泰柏瑞价值增长', [
    component('兆易创新', 4.95),
    component('宁德时代', 2.98),
    component('宋城演艺', 2.96),
    component('邮储银行', 2.72),
    component('工商银行', 2.64),
    component('三花智控', 2.59),
    component('石英股份', 2.58),
    component('康泰生物', 2.55),
    component('闻泰科技', 2.37),
    component('中国平安', 2.36)
], 3.922, 251.2)


f4 = fund('招商深证TMT50ETF联接', [
    component('京东方Ａ',6.22),
    component('中兴通讯',6.09),
    component('海康威视',6.01),
    component('立讯精密',5.59),
    component('分众传媒',4.94),
    component('科大讯飞',3.86),
    component('TCL科技',3.79),
    component('歌尔股份',3.06),
    component('信维通信',2.66),
    component('大族激光',2.47)
], 1.620, 10497.09)

f5 = fund('工银瑞信物流产业', [
    component('上汽集团', 8.08),
    component('长安汽车', 6.00),
    component('克来机电', 5.78),
    component('中国重汽', 5.17),
    component('华域汽车', 5.00),
    component('汇川技术', 4.16),
    component('立讯精密', 4.12),
    component('福耀玻璃', 3.80),
    component('上海机场', 3.70),
    component('长城汽车', 3.69)
], 2.0828, 960.26)

f6 = fund('前海开源再融资主题精选', [
    component('格力电器',7.48),
    component('恩捷股份',5.53),
    component('金地集团',5.18),
    component('掌趣科技',5.08),
    component('保利地产',5.03),
    component('长安汽车',4.43),
    component('上汽集团',4.00),
    component('吉比特',3.6),
    component('宋城演艺',3.13),
    component('卫星石化',3.04)
], 1.6142, 6814.34)

f7 = fund('易方达瑞和灵活配置', [
    component('格力电器',8.80),
    component('美的集团',7.14),
    component('亿联网络',6.00),
    component('顺鑫农业',5.71),
    component('隆基股份',5.35),
    component('福斯特',5.23),
    component('联化科技',5.08),
    component('白云机场',4.60),
    component('海康威视',4.55),
    component('药明康德',4.54)
], 1.7096, 7019.38)

f8 = fund('工银瑞信深证红利ETF联接', [
    component('格力电器', 12.61),
    component('美的集团', 11.86),
    component('五 粮 液', 9.83),
    component('万 科Ａ', 7.64),
    component('平安银行', 6.28),
    component('温氏股份', 5.70),
    component('海康威视', 4.74),
    component('宁波银行', 3.12),
    component('潍柴动力', 2.94),
    component('分众传媒', 2.84)
], 1.6675, 7796.23)

f9 = fund('汇添富价值精选', [
    component('中国平安', 7.36),
    component('招商银行', 6.47),
    component('立讯精密', 6.28),
    component('兴业银行', 6.18),
    component('美的集团', 5.85),
    component('乐普医疗', 4.75),
    component('贵州茅台', 4.24),
    component('万华化学', 4.23),
    component('华鲁恒升', 3.85),
    component('华泰证券', 2.91)
], 2.7450, 4371.54)

f10 = fund('中欧新蓝筹灵活配置A', [
    component('中兴通讯',5.77),
    component('紫金矿业',5.02),
    component('中国平安',5.00),
    component('招商银行',4.48),
    component('伊利股份',4.18),
    component('长春高新',3.47),
    component('贵州茅台',3.26),
    component('深南电路',3.16),
    component('海尔智家',3.08),
    component('牧原股份',2.65)
], 1.5238, 7218.81)

f11 = fund('易方达新思路灵活配置', [
    component('上海机场',8.73),
    component('贵州茅台',8.63),
    component('泸州老窖',7.55),
    component('五粮液',7.54),
    component('海尔智家',6.52),
    component('华兰生物',6.38),
    component('爱尔眼科',5.86),
    component('山西汾酒',4.52),
    component('苏 泊 尔',4.29),
    component('扬农化工',2.08),
], 0.9760, 11270.7)

position11 = position(f11, 'sold', 1.02)
position4 = position(f4, 'sold', 1.8051)

funds = [f1, f2, f3, f4, f5, f6, f7, f8, f9, f10, f11]


def generate_compoent_csv(funds):
    pool = set()
    for fund in funds:
        tmp_components = fund.components
        for com in tmp_components:
            pool.add(com.name)

    df = pd.DataFrame(data=list(pool), columns=['components'])
    df.set_index(['components'], inplace=True)
    for fund in funds:
        tmp_components = fund.components
        df[fund.name] = float(0)
        for com in tmp_components:
            df.at[com.name, fund.name] = float(com.ratio)
    df.to_csv("funds.csv", encoding='utf-8', float_format='%.2f')

if __name__ == "__main__":
    generate_compoent_csv(funds)