export npm_config_target=2.0.2 # Electron 的系统架构, 值为 ia32 或者 x64。
export npm_config_arch=x64
export npm_config_target_arch=x64 # 下载 Electron 的 headers。
export npm_config_disturl=https://atom.io/download/electron
  #告诉 node - pre - gyp 我们是在为 Electron 生成模块。
export npm_config_runtime=electron # 告诉 node - pre - gyp 从源代码构建模块。
export npm_config_build_from_source=true # 安装所有依赖， 并缓存到~/.electron-gyp。
HOME=~/.electron-gyp npm install
