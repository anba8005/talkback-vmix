#!/bin/sh

sudo apt -y install libva2 libva-drm2 libopus0 libavahi-client3

wget https://github.com/Palakis/obs-ndi/releases/download/4.9.1/libndi4_4.5.1-1_amd64.deb -P /tmp
sudo dpkg -i /tmp/libndi4_4.5.1-1_amd64.deb
rm /tmp/libndi4_4.5.1-1_amd64.deb