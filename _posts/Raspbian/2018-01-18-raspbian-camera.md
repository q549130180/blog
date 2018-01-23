---
layout: post
title:  树莓派安装配置摄像头
description: "为树莓派(Raspbian Pi)安装摄像头,并使用raspi-config对摄像头进行配置,使用raspistill、raspivid工具对图像进行捕捉。"
modified: 2018-01-18 15:20:20
tags: [Raspbian Pi,Raspberry Pi,Raspbian,树莓派,Canera,raspi-config]
post_type: developer
series: 树莓派系列文章
blogid: 201801180001
categories: [Raspbian Pi]
image:
  feature: posts_header/abstract-7.jpg
  credit:
  creditlink:
---

## 1. 安装摄像头

按照以下步骤来将树莓派摄像头模块连接搭配树莓派：

1. 找到 CSI 接口(CSI接口在以太网接口旁边)，掀起深色胶带。

2. 拉起 CSI 接口挡板。

3. 拿起你的摄像头模块，将贴在镜头上的塑料保护膜撕掉。确保黄色部分的PCB(有字的一面)是安装完美的（可以轻轻按一下黄色的部分来保证安装完美）。

4. 将排线插入CSI接口。记住，有蓝色胶带的一面应该面向以太网接口方向。同样，这时也确认一下排线安装好了之后，将挡板拉下。


![Alt text]({{site.url}}/images/posts_image/raspbian-camera-2018-01-18.jpg)



## 2. 启用摄像头

在安装完摄像头模块之后，首先要确认你已经升级了树莓派系统并应用了最新的固件，使用如下命令来跟新系统:

```
sudo apt-get update
sudo apt-get upgrade
```

运行树莓派配置工具来激活摄像头模块：

```
sudo raspi-config
```

如果执行`sudo raspi-config`提示`raspi-config: command not found`，则可能是系统中没有内置`raspi-config`或者误操作卸载了，那我们就手动安装一下`raspi-config`吧

下载deb包

```
wget http://mirrors.ustc.edu.cn/archive.raspberrypi.org/pool/main/r/raspi-config/raspi-config_20171201_all.deb
```

解决以来

```
sudo apt-get install whiptail parted lua5.1  alsa-utils psmisc
```

安装软件

```
dpkg -i raspi-config_20170811_all.deb
```

再次运行`sudo raspi-config`


然后移动光标到`Interfacing Options`,按回车(现在最新的`raspi-config`,`Camera`模块在`Interfacing Options`)
![Alt text]({{site.url}}/images/posts_image/raspbian-camera-2018-01-18_001.jpg)
然后选择Camera,按回车
![Alt text]({{site.url}}/images/posts_image/raspbian-camera-2018-01-18_002.jpg)
然后选择Yes
![Alt text]({{site.url}}/images/posts_image/raspbian-camera-2018-01-18_003.jpg)
再选择Yes
![Alt text]({{site.url}}/images/posts_image/raspbian-camera-2018-01-18_004.jpg)

结束后会树莓派会重启.

重启完成后就可以用树莓派拍照了
运行`raspistill -o ling.jpg -t 2000 `这句命令将在 2s 后拍摄一张照片，然后保存为 ling.jpg

通过`raspi-config`工具更新了操作并使能摄像头之后，它会告诉树莓派摄像头已经连接成功，并增加了两个命令行工具以供用户使用摄像头。

1. `raspistill` 用于捕捉图像
2. `raspivid` 用于捕捉视频




## 3. raspistill详解

- `–width, -w` 设置图像宽度
- `–height, -h` 设置图像高度
- `–quality, -q ` 设置 JPEG 品质,品质为 100 时几乎等同于未压缩。75 相对是比较好的选择。
- `–raw, -r` 向 JPEG 元数据中添加 RAW 信息,该参数将从摄像头获取到的 RAW 信息插入到 JPEG 元数据中。

- `–output, -o` 输出文件名,指定输出的文件名。如果不指定，将不保存到文件。如果文件名为“-”，将输出发送至标准输出设备。

- `–latest, -l` 链接最后一帧到文件名,基于该名称做一个指向最后一帧的文件系统链接。

- `–verbose, -v` 在运行过程中输出详细信息,在程序运行过程中，输出调试/详细信息。

- `–timeout, -t` 获取图片前的时间,程序将执行指定的时长，然后进行获取操作（前提是 output 已指定）。如果未指定，将设置为 5 秒。

- `–timelapse, -tl` 间隔拍摄模式,指定多次拍摄之间所间隔的毫秒值。注意，您需要在文件名中加入 %04d 做为画面计数。

- `-t 30000 -tl 2000 -o image%04d.jpg` 将会在 30 秒的时间内，每两秒拍摄一次，并且将文件命名为：image1.jpg、image0002.jpg…image0015.jpg。注意 %04d 表示在文件名中数字部分加入前导零，使其成为 4 位数。例如，%08d 将生成 8 位数字。如果间隔时间设置为 0，程序将不间断（取决于系统负担及存储速度）进行拍摄。不过需要注意，每次捕捉前还是会有 30ms 的最小暂停时间，用于曝光计算操作。

- `–thumb, -th` 设置缩略图参数（x:y:quality）,允许指定插入到 JPEG 文件中缩略图信息。如果不指定，将为默认的 64×48 质量为 35 的缩略图。如果设置为 –thumb none，那么将不会向文件中插入缩略图信息。文件的尺寸也会稍微变小。

- `–demo, -d` 运行演示模式,该参数将循环使用所有摄像头参数，并且不会捕捉。而且无论是否完成所有的循环，在超时周期到达时都会停止演示操作。循环之前的时间需要设置毫秒值。

- `–encoding, -e` 指定输出文件的编码,可用的参数为 jpg、bmp、gif、png。注意，未被硬件加速支持的图像格式（gif、png、bmp）在保存的时候要比 jpg 格式耗时更长。还需要注意，文件扩展名在编码时将被完全忽略。

- `–exif, -x` 在捕捉的内容中加入 EXIF 标签（格式为 ‘key=value’）,允许在 JPEG 图像中插入特定的 EXIF 标签。您可以插入 32 条记录。这是非常实用的功能，比如插入 GPS 元数据。例如设置经度

- `–exif GPS.GPSLongitude=5/1,10/1,15/100` 该命令将会设置经度为 5 度 10 分 15 秒。查看 EXIF 文档获得所有可用标签的详细信息。支持的标签如下：
> IFD0. 或 IFD1.
>
> <ImageWidth, ImageLength, BitsPerSample, Compression, PhotometricInterpretation, ImageDescription, Make, Model, StripOffsets, Orientation, SamplesPerPixel, RowsPerString, StripByteCounts, Xresolution, Yresolution, PlanarConfiguration, ResolutionUnit, TransferFunction, Software, DateTime, Artist, WhitePoint, PrimaryChromaticities, JPEGInterchangeFormat, JPEGInterchangeFormatLength, YcbCrCoefficients, YcbCrSubSampling, YcbCrPositioning, ReferenceBlackWhite, Copyright>
>
> EXIF.
>
> <ExposureTime, FNumber, ExposureProgram, SpectralSensitivity, a ISOSpeedRatings, OECF, ExifVersion, DateTimeOriginal, DateTimeDigitized, ComponentsConfiguration, CompressedBitsPerPixel, ShutterSpeedValue, ApertureValue, BrightnessValue, ExposureBiasValue, MaxApertureValue, SubjectDistance, MeteringMode, LightSource, Flash, FocalLength, SubjectArea, MakerNote, UserComment, SubSecTime, SubSecTimeOriginal, SubSecTimeDigitized, FlashpixVersion, ColorSpace, PixelXDimension, PixelYDimension, RelatedSoundFile, FlashEnergy, SpacialFrequencyResponse, FocalPlaneXResolution, FocalPlaneYResolution, FocalPlaneResolutionUnit, SubjectLocation, ExposureIndex, SensingMethod, FileSource, SceneType, CFAPattern, CustomRendered, ExposureMode, WhiteBalance, DigitalZoomRatio, FocalLengthIn35mmFilm, SceneCaptureType, GainControl, Contrast, Saturation, Sharpness, DeviceSettingDescription, SubjectDistanceRange, ImageUniqueID>
>
> GPS.
>
> <GPSVersionID, GPSLatitudeRef, GPSLatitude, GPSLongitudeRef, GPSLongitude, GPSAltitudeRef, GPSAltitude, GPSTimeStamp, GPSSatellites, GPSStatus, GPSMeasureMode, GPSDOP, GPSSpeedRef, GPSSpeed, GPSTrackRef, GPSTrack, GPSImgDirectionRef, GPSImgDirection, GPSMapDatum, GPSDestLatitudeRef, GPSDestLatitude, GPSDestLongitudeRef, GPSDestLongitude, GPSDestBearingRef, GPSDestBearing, GPSDestDistanceRef, GPSDestDistance, GPSProcessingMethod, GPSAreaInformation, GPSDateStamp, GPSDifferential>
>
> EINT.
>
> <InteroperabilityIndex, InteroperabilityVersion, RelatedImageFileFormat, RelatedImageWidth, RelatedImageLength>


注意，有部分标签将会由摄像头系统自动设置，但是会被命令行执行的 EXIF 操作所覆盖。

如果设置为 –exif none，那么将不会向文件中插入 EXIF信息。文件的尺寸也会稍微变小。

- `–fullpreview, -fp` 全预览模式,这将使预览窗口运行于全分辨率捕捉模式。该模式最大帧率为 15fps，并且预览将和捕捉拥有相同的可视区域。在不进行模式转换时，捕捉动作将进行的更迅速。该功能目前还在开发中。

- `–keypress, -k` 按键模式,摄像头会运行（-t）参数指定的时间，并且每次按下回车键时进行一次捕捉。在超时设置到达前按 X 键然后按回车键将退出程序。如果超时时间设置为 0，摄像头将一直工作，直到按下 X 键和回车键。使用 verbose（-v）参数可以显示输入确认提示，否则不会有任何提示。

- `–signal, -s` 信号模式,摄像头会运行（-t）参数指定的时间，并且每次向摄像进程发送 USR1 信号时进行一次捕捉。该操作可以通过发送 kill 命令进行终止。您可以使用“pgrep raspistill”命令找到摄像进程的 ID。
`kill -USR1`












## 4. raspivid详解
- `–width, -w` 设置图像宽度,视频的宽度。范围为 64 到 1920。

- `–height, -h` 设置图像高度,视频的高度。范围为 64 到 1080。

- `bitrate, -b` 设置码率。使用比特/秒为单位，所以 10Mbits/s 需要输入 -b 10000000。对于 H264 编码的 1080p30 高清视频，码率需要在 15Mbits/s 或以上。码率最大为 25Mbits/s（-b 25000000），但大于 17Mbits/s 时，在 1080p30 中并没有太大区别。

- `–output -o` 输出文件名,指定输出的文件名。如果不指定，将不保存到文件。如果文件名为“-”，将输出发送至标准输出设备。

- `–verbose, -v` 在运行过程中输出详细信息在程序运行过程中，输出调试/详细信息。

- `–timeout, -t` 获取图片前的时间,程序将执行指定的时长，然后进行获取操作（前提是 output 已指定）。如果未指定，将设置为 5 秒。设置为 0 意味着程序将一直运行，直到按下 Ctrl-C 才会停止。

- `–demo, -d` 运行演示模式,该参数将循环使用所有摄像头参数，并且不会捕捉。而且无论是否完成所有的循环，在超时周期到达时都会停止演示操作。循环之前的时间需要设置毫秒值。

- `–framerate, -fps` 指定录制的视频每秒的画面数量,目前，最小的帧率为 2fps，最大为 30fps。似乎将来会有所改变。

- `–penc, -e` 在编码完成后显示预览图像,开启该选项会在压缩完成后显示预览图像。显示在预览窗口中的图像会因为压缩的原因出现失真。正常情况下，预览将会显示摄像头输出的原始图像。该功能在未来的版本中可能不再可用。

- `–intra, -g` 指定帧内刷新周期（关键帧率/画面组）,为录制的视频设置帧内刷新周期（画面组）率。H.264 视频在每个帧内刷新周期中都使用了 I-frame。该选项指定了每个 I-frame 之间帧的数量。数字越大，生成的视频尺寸越小，数字越小，视频流将越庞大，直至出错。

- `–qp, -qp` 设置量化参数,为视频流设置初始量化参数。范围从 10 到 40，并且对所录制视频的质量有极大的影响。值越大，质量越低，并且文件尺寸越小。码流设置为 0，并结合此参数一起使用，可用来设置一个完全动态码流的视频。

- `–profile, -pf` 为录制的视频指定 H264 配置文件,为录制的视频指定 H264 配置文件。选项为：baseline、main、high。

- `–inline, -ih` Insert PPS, SPS headers 插入 PPS，SPS 头,强制视频流的 I-frame 都包含 PPS 和 SPS 头信息。某些视频封装格式需要该信息。例如 Apple HLS。这些头信息体积很小，所以不会让文件的尺寸增加太多。

- `–timed, -td` 设置定时切换捕捉和暂停,该选项可以使视频捕捉在特定的时间里暂停并重新开始记录。需要指定开启时间和关闭时间两个值。开启时间是视频的捕捉时长，关闭时间是暂停的时长。总录制时长是又超时选项进行定义的。注意，由于开启时间和关闭时间的设置原因，录制时长将略微比超时设置的时间要长。
> 例如
>
> `raspivid -o test.h264 -t 25000 -timed 2500,5000`
将进行 25 秒的录制操作。录制操作包括若干个 2500 毫秒（2.5 秒）录制和 5000 毫秒（5秒）暂停的操作，并且重复时长超过 20 秒。所以该录制过程中实际只录制了 10 秒的内容。包括 4 段 2.5 秒的视频片断 = 被若干个 5 秒钟暂停操作分隔开的 10 秒钟视频。
>
> 2.5 秒录制 – 5 秒暂停 – 2.5 秒录制 – 5 秒暂停 -2.5 秒录制 – 5 秒暂停 – 2.5 秒录制
>
> 录制了 25 秒。但仅有 10 秒的记录

- `–keypress, -k` 使用回车键在录制和暂停两种状态间进行切换,每次点击回车键将会暂停或重新开始录制进程。点击 X 键后点击回车键将停止录制并关闭程序。注意，超时设置值将影响录制结束时间，但仅在每次回车键点击后进行检查，所以如果系统正在等待按键操作，尽管超时设置已过期，录制进程退出前也会等待按键操作。

- `–signal, -s` 使用 SIGUSR1 信号在录制和暂停两种状态间进行切换,向 Raspivid 进程发送 USR1 信号来切换录制和暂停。该操作可以通过使用 kill 命令来实现。您可以使用“pgrep raspivid” 命令找到 raspivid 的进程 ID。
> kill -USR1
>
> 注意，超时设置值将影响录制结束时间，但仅在每次发送 SIGUSR1 信号后进行检查，所以如果系统正在等待信号，尽管超时设置已过期，录制进程退出前也会等待信号的发送操作。

- `–initial, -i` 定义启动时的初始状态。定义摄像头初始状态为暂停或立即开始录像。选项可以为“record”（录像）或“pause”（暂停）。注意，如果您设置的超时时长很短，而且初始状态设置为“暂停”，那么将不会录制任何输出的内容。

- `–segment, -sg` 将视频流分段存储到多个文件,与存储在单个文件中不同，该参数将视频分段存储在以毫秒为单位所指定长度的数个文件中。为了将生成的文件命名为不同的名称，您需要在文件名中合适的位置添加 %04d 或类似的参数来让文件名中显示计数值。例如：

- `–segment 3000 -o video%04d.h264` 将分割成每段长度 3000 毫秒（3 秒）并且命名为 video0001.h264，video0002.h264 等。每个段落都是可无缝连接的（段落之间不会丢帧），但每个片段的长度将取决于帧内周期值，原因是每个分割的段落都需要起始于 I-frame 处。因此，每个段落都会等于或大于指定的时间长度。

- `–wrap, -wr` 设置最大分段数,当输出分段视频时，该参数设置了最大分段数，并且达到最大值时，将返回到初始的第一个段落。该参数赋予了录制分段视频的功能，但是将覆盖之前生成的文件。所以，如果设置为 4，那么上面的例子中所生成的文件名为 video0001.h264，video0002.h264，video0003.h264，video0004.h264。而且，一旦 video0004.h264 文件录制完毕后，计数将回到 1，并且 video0001.h264 将被覆盖。

- `–start, -sn` 设置初始段落数,当输出分段视频时，该参数为初始的段落数，它允许从指定的段落恢复之前的录制操作。默认值为 1。





## 5. 示例

**图像捕捉**

默认情况下，传感器将以其支持的最高分辨率进行捕捉。可以在命令行中通过使用 -w 和 -h 参数进行更改。

```
# 两秒钟（时间单位为毫秒）延迟后拍摄一张照片，并保存为 image.jpg
raspistill -t 2000 -o image.jpg

# 拍摄一张自定义大小的照片。
raspistill -t 2000 -o image.jpg -w 640 -h 480

# 降低图像质量，减小文件尺寸
raspistill -t 2000 -o image.jpg -q 5

# 强制使预览窗口出现在坐标为 100,100 的位置，并且尺寸为宽 300 和高 200 像素。
raspistill -t 2000 -o image.jpg -p 100,100,300,200

# 禁用预览窗口
raspistill -t 2000 -o image.jpg -n

# 将图像保存为 PNG 文件（无损压缩格式，但是要比 JPEG 速度慢）。注意，当选择图像编码时，文件扩展名将被忽略。
raspistill -t 2000 -o image.png –e png

# 向 JPEG 文件中添加一些 EXIF 信息。该命令将会把作者名称标签设置为 Dreamcolor，GPS 海拔高度为 123.5米。
raspistill -t 2000 -o image.jpg -x IFD0.Artist=Dreamcolor -x GPS.GPSAltitude=1235/10

# 设置浮雕风格图像特效
raspistill -t 2000 -o image.jpg -ifx emboss

# 设置 YUV 图像的 U 和 V 通道为指定的值（128:128 为黑白图像）
raspistill -t 2000 -o image.jpg -cfx 128:128

# 仅显示两秒钟预览图像，而不对图像进行保存。
raspistill -t 2000

# 间隔获取图片，在 10 分钟（10 分钟 = 600000 毫秒）的时间里，每 10 秒获取一张，并且命名为 image_number_001_today.jpg，image_number_002_today.jpg... 的形式，并且最后一张照片将命名为 latest.jpg。
raspistill -t 600000 -tl 10000 -o image_num_%03d_today.jpg -l latest.jpg

# 获取一张照片并发送至标准输出设备
raspistill -t 2000 -o -

# 获取一张照片并保存为一个文件
raspistill -t 2000 -o - &gt; my_file.jpg

#摄像头一直工作，当按下回车键时获取一张照片。
raspistill -t 0 -k -o my_pics%02d.jpg
```




**视频捕捉**

图像尺寸和预览设置与图像捕捉相同。录制的视频默认尺寸为 1080p（1920×1080）

```
# 使用默认设置录制一段 5 秒钟的视频片段（1080p30）
raspivid -t 5000 -o video.h264

# 使用指定码率（3.5Mbits/s）录制一段 5 秒钟的视频片段
raspivid -t 5000 -o video.h264 -b 3500000

# 使用指定帧率（5fps）录制一段 5 秒钟的视频片段
raspivid -t 5000 -o video.h264 -f 5

# 发送到标准输出设备一段 5 秒钟经过编码的摄像头流图像
raspivid -t 5000 -o -

# 保存到文件一段 5 秒钟经过编码的摄像头流图像
raspivid -t 5000 -o - &gt; my_file.h264
```

## 6. 视频转换

`raspivid` 的输出是一段未压缩的 H.264 视频流，而且这段视频不含声音。为了能被通常的视频播放器所播放，这个 raw 的 H.264 视频还需要转换。可以使用 `gpac` 包中所带有的 MP4Box 应用。

在 Raspbian 上安装 `gpac`，输入命令：

```
sudo apt-get install -y gpac
```

然后将这段 raw 的 H.264 格式的视频流转换为每秒30帧的 .mp4 格式视频：

```
MP4Box -fps 30 -add keychain.h264 keychain.mp4
```


## 7. 参考资料

- [树莓派摄像头模块应用程序文档翻译][1]


[1]: http://shumeipai.nxez.com/2014/09/21/raspicam-documentation.html
