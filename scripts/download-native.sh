#!/bin/sh

mkdir -p ../native
cd ../native

# linux

wget https://github.com/anba8005/ndi-webrtc-peer-ffmpeg/releases/latest/download/ffmpeg.linux.x64.gz
gunzip ffmpeg.linux.x64.gz
mv ffmpeg.linux.x64 ffmpeg.linux
chmod +x ffmpeg.linux

# mac

wget https://github.com/anba8005/ndi-webrtc-peer-ffmpeg/releases/latest/download/ffmpeg.mac.x64.gz
gunzip ffmpeg.mac.x64.gz
mv ffmpeg.mac.x64 ffmpeg.mac
chmod +x ffmpeg.mac

wget https://github.com/anba8005/ndi-webrtc-peer-ffmpeg/releases/latest/download/libndi.4.dylib.4.5.3.gz
gunzip libndi.4.dylib.4.5.3.gz
mv libndi.4.dylib.4.5.3 libndi.4.dylib

# win

wget https://github.com/anba8005/ndi-webrtc-peer-ffmpeg/releases/latest/download/ffmpeg.win.x64.gz
gunzip ffmpeg.win.x64.gz
mv ffmpeg.win.x64 ffmpeg.exe

wget https://github.com/anba8005/ndi-webrtc-peer-ffmpeg/releases/latest/download/Processing.NDI.Lib.x64.dll.4.5.3.gz
gunzip Processing.NDI.Lib.x64.dll.4.5.3.gz
mv Processing.NDI.Lib.x64.dll.4.5.3 Processing.NDI.Lib.x64.dll

cd ../scripts
