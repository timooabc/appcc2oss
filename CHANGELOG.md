# Change Log

All notable changes to the "appcc2oss" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [0.0.5]
### Added
修改task数据的存储位置到当前工作空间，方便数据的版本控制和多人协作。

## [0.0.4]
### Added
webhooks支持关键字的替换：
- 替换```{remoteUrl}``` 为任务的Url
- 替换```{subUrl}``` 为任务相对customDomain的子路径
### Fixed
修复任务创建后修改customDomain配置项的bug。

## [0.0.3]
### Added
支持任务上传完成后调用webhooks

## [0.0.2]
完成基本功能