---
title: 參訪臺師大林口校區雲端節能機房
slug: about-ntnu-linkou-campus-datacenter-visit
date: 2026-05-11 14:00
author: Chang Wei (昌維) <changwei1006@gmail.com>
language: zh-Hant-TW
category: [University Life]
tag: [NTNU, Datacenter, GDG, Campus Life, Linkou, PUE]
cover_image: linkou-datacenter-01.jpg
---

> 這個分類用來記錄大學生活裡比較值得留下來的片段——不一定是課業或研究，也可能是校園裡才會遇到的制度與文化。
> 這篇寫的是透過 GDG on NTNU 活動，參訪國立臺灣師範大學林口校區的雲端節能機房。

# 參訪臺師大林口校區雲端節能機房

五月上旬，我隨 **GDG on NTNU**（臺師大學生開發者社團）一行，前往國立臺灣師範大學**林口校區**的資訊中心機房參訪。對一般同學來說，校務系統、學校信箱、圖書館自動化館藏、門禁等服務幾乎是「打開就用」；但這些系統背後的伺服器、網路與電力設施究竟長什麼樣、放在哪裡，多半只有機房裡才看得到。

這次參訪由 **臺師大資訊工程學系**（[@ntnu_csie](https://www.instagram.com/ntnu_csie/)）贊助，**臺師大資訊中心**（[@ntnu.taiwan](https://www.instagram.com/ntnu.taiwan/)）同仁與保養廠商人員現場講解，NZ 同學（[@su_n_z](https://www.instagram.com/su_n_z/)）也在百忙中協助籌備。對我這種平常寫程式、卻很少走進實體機房的人來說，是一次難得的「把抽象的線上系統服務對應到具體硬體」的機會。

----

## 出發：往林口校區

由於校本部的資訊中心機房主要在教育大樓的四樓，那邊空間不足以擺放過多機器，因此更多伺服器主要都設置在林口校區，其位於新北市林口區。沿途經過林口新創園、仁愛路一帶，路標上也能看見指向「國立臺灣師範大學（林口校區前門）」的指示。

![](linkou-datacenter-22.jpg)

抵達後，我們先在**資訊中心**（Information Technology Center）門口集合。藍底白字的招牌上寫著「資訊中心／Information Technology Center／National Taiwan Normal University」，參與者約二十多人，多數是對系統與基礎設施有興趣的學生。

![](linkou-datacenter-01.jpg)

## 第一印象：又冷又吵

走進機房區域，第一個感受非常具體：**非常冷，也非常吵**。

冷，來自為伺服器散熱而運轉的空調與氣流設計；吵，則來自機櫃內風扇、冷卻設備與不間斷運轉的硬體。和一般教室或辦公室完全不同，這裡的環境是為了讓機器 7×24 小時穩定運轉而設計的，人反而要適應機器的「舒適區間」。

![](linkou-datacenter-04.jpg)

![](linkou-datacenter-05.jpg)

![](linkou-datacenter-06.jpg)

## 雲端節能機房：冷氣只送進機櫃通道

很久以前我也參觀過傳統機房：冷氣往往遍布整間空間，整個房間都被降溫。這次在臺師大林口看到的做法不同——**冷氣主要在機櫃通道內流動**，例如圖中玻璃門內的封閉通道，而不是對整個機房空間無差別送風。

這種**冷／熱通道分離**（或通道封閉）的設計，目的是把冷空氣精準送到需要散熱的設備進風側，避免冷熱空氣混流造成能源浪費。相較於傳統「整室強冷」的模式，通常能更有效地利用每一度電。

![](linkou-datacenter-07.jpg)

![](linkou-datacenter-08.jpg)

資訊中心同仁提到，這裡年均 **PUE** 低於 **1.6**。PUE（Power Usage Effectiveness，電源使用效率）的計算方式是：

**PUE = 資料中心總設備能耗 ÷ IT 設備能耗**

數值越接近 1，代表越多的電力用在實際運算與儲存，而不是被空調、配電等周邊設備消耗。PUE 低於 1.6 在學校自營機房裡已屬不錯的水準，這也是此區域被稱作**「雲端節能機房」**的原因。

![](linkou-datacenter-09.jpg)

![](linkou-datacenter-10.jpg)

![](linkou-datacenter-11.jpg)

## 機櫃裡有什麼：從線材到 KVM

走進機櫃通道，一排排黑色機櫃整齊延伸，網孔門後可見密布的網路線材與設備指示燈。有些機櫃的線材管理非常嚴謹，也有些「線材參考圖」讓人會心一笑——現場工作人員笑說，理想與現實有時就是差在理線的時間與人力。

![](linkou-datacenter-12.jpg)

講解過程中，同仁介紹了各類設備的用途與運作原理：例如 **KVM** 主控台（可在一台螢幕前切換操作多台伺服器）、**NVR** 監視主機、門禁保全主機，以及 **APC InRow** 等列間冷卻設備。機櫃上貼有「F6」「Row F2」等標示，方便維運人員定位；也有「電池櫃」等標籤，對應不斷電系統的蓄電模組。

![](linkou-datacenter-13.jpg)

![](linkou-datacenter-14.jpg)

![](linkou-datacenter-15.jpg)

![](linkou-datacenter-16.jpg)

廠商與資訊中心人員也現場示範了伺服器**滑軌**（rail）等機房裡才會接觸到的硬體細節——這些在雲端服務的抽象介面背後，都是實體存在、需要人工安裝與維護的零件。

![](linkou-datacenter-17.jpg)

![](linkou-datacenter-18.jpg)

![](linkou-datacenter-19.jpg)

![](linkou-datacenter-20.jpg)

![](linkou-datacenter-21.jpg)

## 和日常校園服務的連結

參訪結束後，我對「學校 IT 基礎設施」多了一層具體想像：選課系統當機、信箱延遲、圖書館查詢變慢——這些使用者端的困擾，背後可能對應到某台伺服器的負載、某條線路的頻寬，或是機房裡某個需要保養的環控元件。

對開發者社群而言，這樣的參訪也提醒我：寫程式、架服務之外，**實體機房、電力、散熱與維運**同樣是系統能否長期穩定運作的關鍵。GDG 這類活動把課堂裡較少觸及的現場帶到同學面前，我覺得很有價值。

## 致謝

感謝 **NTNU CSIE 臺師大資工系**（[@ntnu_csie](https://www.instagram.com/ntnu_csie/)）贊助 **GDG on NTNU**（[@gdg.ntnu](https://www.instagram.com/gdg.ntnu/)）舉辦此次活動；感謝 **臺師大資訊中心**（[@ntnu.taiwan](https://www.instagram.com/ntnu.taiwan/)）同仁與保養廠商人員耐心講解機房內各種設備的功能、用途與工作原理；也感謝 **NZ 同學**（[@su_n_z](https://www.instagram.com/su_n_z/)）百忙之餘抽空籌備。

原文與更多照片見 Instagram 貼文：[參訪臺師大林口校區機房](https://www.instagram.com/p/DYMSrxbkcvd/)。
