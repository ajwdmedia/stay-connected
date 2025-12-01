curl https://github.com/ajwdmedia/stay-connected/releases/latest/download/connector-$(dpkg-architecture -q DEB_BUILD_ARCH) --output /opt/connector -L
chmod uga+x /opt/connector
curl https://raw.githubusercontent.com/ajwdmedia/stay-connected/HEAD/stay-connected.service --output /etc/systemd/system/stay-connected.service
systemctl daemon-reload
systemctl start stay-connected
systemctl enable stay-connected
