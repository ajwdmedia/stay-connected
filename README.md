# stay-connected

## Manual Install (Recommended)
```sh
sudo su
curl https://github.com/ajwdmedia/stay-connected/releases/latest/download/connector-$(dpkg-architecture -q DEB_BUILD_ARCH) --output /opt/connector -L
chmod uga+x /opt/connector
curl https://raw.githubusercontent.com/ajwdmedia/stay-connected/HEAD/stay-connected.service --output /etc/systemd/system/stay-connected.service
systemctl daemon-reload
systemctl start stay-connected
systemctl enable stay-connected
```

## Automatic Install
Note that this might fail at a previous step and i'm not a massive bash writer so there's no error handling.
The script is the same as the lines above - only use the below method if you're sure it's not going to fail.
```sh
curl -o- https://raw.githubusercontent.com/ajwdmedia/stay-connected/HEAD/install.sh | sudo su
```
